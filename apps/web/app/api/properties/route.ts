import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { dbConnect } from "@/app/../lib/db";
import { Property } from "@/app/../models/Property";
import { bearerToPayload } from "@/app/../lib/api/auth";
import { parsePagination, buildSkipLimit } from "@/app/../lib/api/pagination";
import { deployPropertyToken, deployPropertySale, deployDividendDistributor } from "@/lib/hedera/tokenDeployment";

const createSchema = z.object({
  name: z.string().min(3),
  location: z.string().optional(),
  description: z.string().optional(),
  totalShares: z.number().int().positive(),
  pricePerShare: z.number().positive(),
  tokenId: z.string().optional(),
  saleContractAddress: z.string().optional(),
  dividendContractAddress: z.string().optional(),
  type: z.enum(["forest", "solar", "real-estate"]).optional(),
  image: z.string().optional(),
  expectedYield: z.number().optional(),
  sustainabilityScore: z.number().optional(),
  tags: z.array(z.string()).optional(),
  area: z.string().optional(),
  established: z.string().optional(),
});

export async function GET(req: NextRequest) {
  await dbConnect();
  const params = parsePagination(new URL(req.url).searchParams, {
    pageSize: 12,
    sort: "-createdAt",
  });
  const { skip, limit } = buildSkipLimit(params);
  let sort: any = { createdAt: -1 };
  if (params.sort) {
    // simple sort syntax: field or -field
    const field = params.sort.replace("-", "");
    sort = { [field]: params.sort.startsWith("-") ? -1 : 1 };
  }
  const [items, total] = await Promise.all([
    Property.find().sort(sort).skip(skip).limit(limit).lean(),
    Property.countDocuments(),
  ]);
  return NextResponse.json({
    properties: items,
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.ceil(total / params.pageSize),
  });
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const payload = bearerToPayload(req.headers.get("authorization"));
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const body = await req.json();
    const data = createSchema.parse(body);
    
    // Validate that all required contract addresses are provided
    if (!data.tokenId) {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
    }

    if (!data.saleContractAddress) {
      return NextResponse.json(
        { error: "Sale contract address is required" },
        { status: 400 }
      );
    }

    if (!data.dividendContractAddress) {
      return NextResponse.json(
        { error: "Dividend contract address is required" },
        { status: 400 }
      );
    }

    // Use the real deployed contract addresses from frontend
    const tokenDeployment = {
      tokenAddress: data.tokenId,
      evmTokenAddress: data.tokenId,
      transactionId: "real_deployment",
    };

    const saleAddress = data.saleContractAddress;
    const dividendAddress = data.dividendContractAddress;
    
    // Save to database
    const property = await Property.create({
      name: data.name,
      location: data.location,
      description: data.description,
      totalShares: data.totalShares,
      availableShares: data.totalShares,
      pricePerShare: data.pricePerShare,
      createdBy: mongoose.isValidObjectId(payload.sub)
        ? (payload.sub as any)
        : new mongoose.Types.ObjectId(),
      // Additional marketplace fields
      type: data.type || "real-estate",
      image: data.image,
      expectedYield: data.expectedYield || 8.5,
      sustainabilityScore: data.sustainabilityScore || 85,
      tags: data.tags || [],
      area: data.area,
      established: data.established,
      status: "open",
      revenueGenerated: 0,
      // Blockchain fields - using real token address
      tokenAddress: tokenDeployment.tokenAddress,
      evmTokenAddress: tokenDeployment.evmTokenAddress,
      saleContractAddress: saleAddress,
      dividendContractAddress: dividendAddress,
      transactionId: tokenDeployment.transactionId,
    });
    
    return NextResponse.json({ property }, { status: 201 });
  } catch (err: any) {
    console.error('Property creation error:', err);
    return NextResponse.json(
      { error: err.message || "Create failed" },
      { status: 400 }
    );
  }
}
