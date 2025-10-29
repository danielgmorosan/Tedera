import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/../lib/db";
import { Distribution } from "@/app/../models/Distribution";
import { bearerToPayload } from "@/app/../lib/api/auth";

interface Params {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  await dbConnect();
  // Optional auth (for future personalized fields); not required to view distributions
  bearerToPayload(req.headers.get("authorization"));
  const list = await Distribution.find({ property: params.id })
    .sort({ executedAt: -1 })
    .lean();
  return NextResponse.json({ distributions: list });
}
