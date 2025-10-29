import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { bearerToPayload } from '@/lib/api/auth';
import { Property } from '@/models/Property';
import { Distribution } from '@/models/Distribution';

export async function POST(req: NextRequest) {
  try {
    const payload = bearerToPayload(req.headers.get('authorization'));
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { propertyId, amount } = await req.json();
    
    // Verify property ownership
    const property = await Property.findById(propertyId);
    if (!property || property.createdBy.toString() !== payload.sub) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Create distribution on-chain
    const provider = new ethers.providers.JsonRpcProvider(
      'https://testnet.hashio.io/api'
    );
    const signer = new ethers.Wallet(process.env.HEDERA_OPERATOR_KEY!, provider);
    
    const DividendDistributorABI = [
      'function createDistribution() external payable',
    ];
    
    const distributor = new ethers.Contract(
      property.dividendContractAddress!,
      DividendDistributorABI,
      signer
    );
    
    const tx = await distributor.createDistribution({
      value: ethers.utils.parseEther(amount.toString()),
    });
    await tx.wait();
    
    // Record in database
    const distribution = await Distribution.create({
      property: propertyId,
      amount,
      transactionHash: tx.hash,
    });
    
    return NextResponse.json({ distribution }, { status: 201 });
  } catch (error: any) {
    console.error('Distribution error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
