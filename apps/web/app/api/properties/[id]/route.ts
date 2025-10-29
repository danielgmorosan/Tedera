import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/../lib/db";
import { Property } from "@/app/../models/Property";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  await dbConnect();
  const property = await Property.findById(params.id).lean();
  if (!property)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ property });
}
