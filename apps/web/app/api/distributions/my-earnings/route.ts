import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/../lib/db";
import { Investment } from "@/app/../models/Investment";
import { Distribution } from "@/app/../models/Distribution";
import { Property } from "@/app/../models/Property";
import { bearerToPayload } from "@/app/../lib/api/auth";

// Lightweight interfaces for the lean() query results
interface InvestmentLean {
  _id: unknown;
  property: unknown;
  shares: number;
  user: unknown;
}
interface DistributionLean {
  _id: unknown;
  property: unknown;
  totalAmount: number;
}
interface PropertyLean {
  _id: unknown;
  totalShares: number;
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const payload = bearerToPayload(req.headers.get("authorization"));
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const investments = await Investment.find({ user: payload.sub }).lean<
    InvestmentLean[]
  >();

  const propertyIds = [
    ...new Set(investments.map((inv: InvestmentLean) => String(inv.property))),
  ];

  const [distributions, properties] = await Promise.all([
    Distribution.find({ property: { $in: propertyIds } }).lean<
      DistributionLean[]
    >(),
    Property.find({ _id: { $in: propertyIds } })
      .select({ totalShares: 1 })
      .lean<PropertyLean[]>(),
  ]);

  const propertyMap = new Map<string, PropertyLean>(
    properties.map((p: PropertyLean) => [String(p._id), p])
  );

  const earnings = distributions.map((d: DistributionLean) => {
    const propId = String(d.property);
    const propInvests = investments.filter(
      (i: InvestmentLean) => String(i.property) === propId
    );
    const userShares = propInvests.reduce(
      (acc: number, i: InvestmentLean) => acc + i.shares,
      0
    );
    const totalSharesRaw = propertyMap.get(propId)?.totalShares;
    const totalShares =
      totalSharesRaw && totalSharesRaw > 0 ? totalSharesRaw : 1; // avoid divide-by-zero
    const userAmount = (d.totalAmount * userShares) / totalShares;
    return { distributionId: d._id, property: d.property, userAmount };
  });

  return NextResponse.json({ earnings });
}
