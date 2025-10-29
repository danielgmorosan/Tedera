import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/app/../lib/db";
import { Investment } from "@/app/../models/Investment";
import { Property } from "@/app/../models/Property";
import { bearerToPayload } from "@/app/../lib/api/auth";
import { parsePagination, buildSkipLimit } from "@/app/../lib/api/pagination";

const investSchema = z.object({
  propertyId: z.string(),
  shares: z.number().int().positive(),
  transactionHash: z.string().optional(),
});

export async function GET(req: NextRequest) {
  await dbConnect();
  const payload = bearerToPayload(req.headers.get("authorization"));
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = parsePagination(new URL(req.url).searchParams, {
    pageSize: 20,
    sort: "-createdAt",
  });
  const { skip, limit } = buildSkipLimit(params);
  let sort: any = { createdAt: -1 };
  if (params.sort) {
    const field = params.sort.replace("-", "");
    sort = { [field]: params.sort.startsWith("-") ? -1 : 1 };
  }
  const [items, total] = await Promise.all([
    Investment.find({ user: payload.sub })
      .populate("property")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Investment.countDocuments({ user: payload.sub }),
  ]);
  return NextResponse.json({
    investments: items,
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
    const data = investSchema.parse(body);
    const property = await Property.findById(data.propertyId);
    if (!property)
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    if (property.availableShares < data.shares)
      return NextResponse.json({ error: "Not enough shares" }, { status: 400 });
    const amount = data.shares * property.pricePerShare;
    const investment = await Investment.create({
      user: payload.sub,
      property: property.id,
      shares: data.shares,
      amount,
      transactionHash: data.transactionHash,
    });
    property.availableShares -= data.shares;
    await property.save();
    return NextResponse.json({ investment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Investment failed" },
      { status: 400 }
    );
  }
}
