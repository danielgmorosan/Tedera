import { NextResponse } from "next/server";
import { getOpenApiSpec } from "@/app/../lib/api/openapi";

export const dynamic = "force-static";

export async function GET() {
  const spec = getOpenApiSpec();
  return NextResponse.json(spec);
}
