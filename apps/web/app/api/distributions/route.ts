import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/app/../lib/db";
import { Distribution } from "@/app/../models/Distribution";
import { Property } from "@/app/../models/Property";
import { bearerToPayload } from "@/app/../lib/api/auth";

const schema = z.object({
  propertyId: z.string(),
  totalAmount: z.number().positive(),
  description: z.string().optional(),
  transactionHash: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const payload = bearerToPayload(req.headers.get("authorization"));
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const data = schema.parse(body);
    const property = await Property.findById(data.propertyId);
    if (!property)
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    if (String(property.createdBy) !== payload.sub)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const dist = await Distribution.create({
      property: property.id,
      totalAmount: data.totalAmount,
      description: data.description,
      transactionHash: data.transactionHash,
    });
    return NextResponse.json({ distribution: dist }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Distribution failed" },
      { status: 400 }
    );
  }
}
