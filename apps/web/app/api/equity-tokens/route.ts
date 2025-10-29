import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deployPropertyToken } from "@/lib/hedera/tokenDeployment";

const createEquityTokenSchema = z.object({
  name: z.string().min(3),
  symbol: z.string().min(1).max(10),
  decimals: z.number().int().min(0).max(18),
  isin: z.string().min(12).max(12),
  nominalValue: z.string().min(1),
  currency: z.string().min(1),
  numberOfShares: z.string().min(1),
  totalValue: z.string().min(1),
  chosenRights: z.array(z.string()),
  dividendType: z.string().min(1),
  regulationType: z.string().min(1),
  regulationSubType: z.string().min(1),
  blockedCountries: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createEquityTokenSchema.parse(body);
    
    // Deploy equity token using Hedera SDK
    const tokenDeployment = await deployPropertyToken({
      name: data.name,
      symbol: data.symbol,
      totalShares: parseInt(data.numberOfShares),
      pricePerShare: parseFloat(data.nominalValue),
    });
    
    return NextResponse.json({
      success: true,
      transactionId: tokenDeployment.transactionId,
      tokenAddress: tokenDeployment.tokenAddress,
      evmTokenAddress: tokenDeployment.evmTokenAddress,
      message: "Equity token deployed successfully",
    }, { status: 201 });
    
  } catch (err: any) {
    console.error('Equity token deployment error:', err);
    return NextResponse.json(
      { error: err.message || "Failed to deploy equity token" },
      { status: 400 }
    );
  }
}
