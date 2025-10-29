import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Import contract ABIs
import PropertySaleABI from '@/lib/contracts/PropertySale.json';
import DividendDistributorABI from '@/lib/contracts/DividendDistributor.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, totalShares, pricePerShare } = body;

    // Validate inputs
    if (!tokenId || !totalShares || !pricePerShare) {
      return NextResponse.json(
        { error: 'Missing required parameters (tokenId, totalShares, pricePerShare)' },
        { status: 400 }
      );
    }

    // Get operator credentials from environment
    const operatorKey = process.env.NEXT_PUBLIC_HEDERA_OPERATOR_KEY;
    if (!operatorKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing operator key' },
        { status: 500 }
      );
    }

    // Connect to Hedera testnet
    // Use a simple URL string to avoid fetch referrer issues in Node.js
    const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api');

    // Override the network to avoid auto-detection
    (provider as any)._network = {
      name: 'hedera-testnet',
      chainId: 296,
    };

    const wallet = new ethers.Wallet(operatorKey, provider);

    console.log('🚀 Starting contract deployments from backend...');
    console.log('👛 Deploying from account:', wallet.address);
    console.log('📋 Using existing token:', tokenId);

    // Step 1: Deploy PropertySale contract
    console.log('📝 Step 1/2: Deploying PropertySale Contract...');
    
    let saleAddress: string;
    try {
      const PropertySaleFactory = new ethers.ContractFactory(
        PropertySaleABI.abi,
        PropertySaleABI.bytecode,
        wallet
      );

      const saleDuration = 30 * 24 * 60 * 60; // 30 days in seconds

      const propertySale = await PropertySaleFactory.deploy(
        tokenId,
        ethers.utils.parseEther(pricePerShare.toString()),
        totalShares,
        saleDuration
      );

      await propertySale.deployed();
      saleAddress = propertySale.address;
      console.log('✅ PropertySale deployed:', saleAddress);
    } catch (error) {
      console.error('PropertySale deployment failed:', error);
      return NextResponse.json(
        { error: 'Failed to deploy PropertySale contract', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Step 2: Deploy DividendDistributor contract
    console.log('📝 Step 2/2: Deploying DividendDistributor Contract...');

    let dividendAddress: string;
    try {
      const DividendDistributorFactory = new ethers.ContractFactory(
        DividendDistributorABI.abi,
        DividendDistributorABI.bytecode,
        wallet
      );

      const dividendDistributor = await DividendDistributorFactory.deploy(tokenId);
      await dividendDistributor.deployed();
      dividendAddress = dividendDistributor.address;
      console.log('✅ DividendDistributor deployed:', dividendAddress);
    } catch (error) {
      console.error('DividendDistributor deployment failed:', error);
      return NextResponse.json(
        { error: 'Failed to deploy DividendDistributor contract', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    console.log('🎉 All 2 contracts deployed successfully!');

    return NextResponse.json({
      success: true,
      tokenAddress: tokenId,
      saleAddress,
      dividendAddress,
    });

  } catch (error) {
    console.error('Deployment error:', error);
    return NextResponse.json(
      { error: 'Deployment failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

