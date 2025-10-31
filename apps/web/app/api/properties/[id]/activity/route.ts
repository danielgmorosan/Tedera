import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Property } from "@/models/Property";
import { Investment } from "@/models/Investment";
import { Distribution } from "@/models/Distribution";
import { ethers } from "ethers";

interface Params {
  params: { id: string };
}

// PropertySale ABI for events
const PROPERTY_SALE_ABI = [
  "event SharesPurchased(address indexed buyer, uint256 shares, uint256 amount)",
];

// DividendDistributor ABI for events  
const DIVIDEND_DISTRIBUTOR_ABI = [
  "event DividendDistributed(uint256 indexed distributionId, uint256 amount, uint256 totalShares)",
];

// ERC20 Transfer event
const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function totalSupply() view returns (uint256)",
];

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    
    // Get property with contract addresses
    const property = await Property.findById(params.id).lean();
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const events: any[] = [];

    // Get provider (use environment variable or default)
    // Note: In a production app, you might want to pass provider from client or use a server-side provider
    const providerUrl = process.env.NEXT_PUBLIC_HEDERA_RPC_URL || process.env.HEDERA_RPC_URL || "https://testnet.hashio.io/api";
    let provider: ethers.providers.Provider | null = null;

    try {
      provider = new ethers.providers.JsonRpcProvider(providerUrl);
    } catch (error) {
      console.warn("Failed to create provider, using database fallbacks only:", error);
    }

    // 1. Token Mint Event (Transfer from zero address) - only if we have token address and provider
    if ((property.tokenAddress || property.evmTokenAddress) && provider) {
      try {
        const tokenAddress = property.evmTokenAddress || property.tokenAddress;
        if (!tokenAddress) throw new Error("No token address");
        
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        
        // Get deployment block or use 0 for fromBlock
        const fromBlock = 0;
        const transferEvents = await tokenContract.queryFilter(
          tokenContract.filters.Transfer(),
          fromBlock
        );

        // Find mint event (Transfer from zero address)
        const mintEvent = transferEvents.find((e: any) => 
          e.args.from === ethers.constants.AddressZero
        );
        
        if (mintEvent) {
          const block = await mintEvent.getBlock();
          const totalSupply = await tokenContract.totalSupply();
          const shares = parseFloat(ethers.utils.formatUnits(totalSupply, 18));
          
          events.push({
            id: `mint-${mintEvent.transactionHash}`,
            type: "mint",
            title: "Initial Token Mint",
            description: "Property tokens initially minted and made available",
            amount: `${shares.toLocaleString()} shares`,
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            transactionId: mintEvent.transactionHash,
          });
        }
      } catch (error) {
        console.error("Error fetching mint event:", error);
      }
    }

    // 2. Property Listing (PropertySale deployment) - use property createdAt or try to find deployment
    if (property.createdAt) {
      events.push({
        id: `listing-${property._id}`,
        type: "update",
        title: "Property Listed",
        description: "Property listed for sale on marketplace",
        timestamp: property.createdAt.toISOString(),
      });
    }

    // 3. Dividend Contract Deployment - use property createdAt or add a separate field
    if (property.dividendContractAddress && property.createdAt) {
      events.push({
        id: `dividend-deploy-${property.dividendContractAddress}`,
        type: "update",
        title: "Dividend Contract Deployed",
        description: "Dividend distribution contract deployed",
        timestamp: property.createdAt.toISOString(),
        transactionId: property.transactionId,
      });
    }

    // 4. Share Purchases (from PropertySale events)
    if (property.saleContractAddress && provider) {
      try {
        const saleContract = new ethers.Contract(
          property.saleContractAddress,
          PROPERTY_SALE_ABI,
          provider
        );
        
        const purchaseEvents = await saleContract.queryFilter(
          saleContract.filters.SharesPurchased(),
          0 // from block 0
        );

        for (const event of purchaseEvents) {
          try {
            const block = await event.getBlock();
            const shares = parseFloat(ethers.utils.formatUnits(event.args.shares, 18));
            const amount = parseFloat(ethers.utils.formatUnits(event.args.amount, 8)); // HBAR has 8 decimals
            
            events.push({
              id: `purchase-${event.transactionHash}-${event.args.buyer}`,
              type: "buy",
              title: "Share Purchase",
              description: "Investor purchased shares",
              amount: `${shares.toLocaleString()} shares`,
              user: event.args.buyer,
              timestamp: new Date(block.timestamp * 1000).toISOString(),
              transactionId: event.transactionHash,
            });
          } catch (err) {
            console.error("Error processing purchase event:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching purchase events:", error);
        // Fallback to database investments
        const investments = await Investment.find({ property: params.id })
          .sort({ createdAt: -1 })
          .lean();
        
        for (const inv of investments) {
          events.push({
            id: `investment-${inv._id}`,
            type: "buy",
            title: "Share Purchase",
            description: "Investor purchased shares",
            amount: `${inv.shares.toLocaleString()} shares`,
            timestamp: inv.createdAt?.toISOString() || new Date().toISOString(),
          });
        }
      }
    } else {
      // Fallback to database investments if no contract or provider
      const investments = await Investment.find({ property: params.id })
        .sort({ createdAt: -1 })
        .lean();
      
      for (const inv of investments) {
        events.push({
          id: `investment-${inv._id}`,
          type: "buy",
          title: "Share Purchase",
          description: "Investor purchased shares",
          amount: `${inv.shares.toLocaleString()} shares`,
          timestamp: inv.createdAt?.toISOString() || new Date().toISOString(),
        });
      }
    }

    // 5. Dividend Distributions (from DividendDistributor events)
    if (property.dividendContractAddress && provider) {
      try {
        const dividendContract = new ethers.Contract(
          property.dividendContractAddress,
          DIVIDEND_DISTRIBUTOR_ABI,
          provider
        );
        
        const distributionEvents = await dividendContract.queryFilter(
          dividendContract.filters.DividendDistributed(),
          0
        );

        for (const event of distributionEvents) {
          try {
            const block = await event.getBlock();
            const amount = parseFloat(ethers.utils.formatUnits(event.args.amount, 8)); // HBAR
            
            events.push({
              id: `distribution-${event.args.distributionId}-${event.transactionHash}`,
              type: "distribution",
              title: "Profit Distribution",
              description: "Quarterly profit distribution to all shareholders",
              amount: `$${amount.toLocaleString()}`,
              timestamp: new Date(block.timestamp * 1000).toISOString(),
              transactionId: event.transactionHash,
            });
          } catch (err) {
            console.error("Error processing distribution event:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching distribution events:", error);
        // Fallback to database distributions
        const distributions = await Distribution.find({ property: params.id })
          .sort({ executedAt: -1 })
          .lean();
        
        for (const dist of distributions) {
          events.push({
            id: `distribution-${dist._id}`,
            type: "distribution",
            title: "Profit Distribution",
            description: dist.description || "Quarterly profit distribution to all shareholders",
            amount: `$${dist.totalAmount.toLocaleString()}`,
            timestamp: dist.executedAt?.toISOString() || new Date().toISOString(),
          });
        }
      }
    } else {
      // Fallback to database distributions
      const distributions = await Distribution.find({ property: params.id })
        .sort({ executedAt: -1 })
        .lean();
      
      for (const dist of distributions) {
        events.push({
          id: `distribution-${dist._id}`,
          type: "distribution",
          title: "Profit Distribution",
          description: dist.description || "Quarterly profit distribution to all shareholders",
          amount: `$${dist.totalAmount.toLocaleString()}`,
          timestamp: dist.executedAt?.toISOString() || new Date().toISOString(),
        });
      }
    }

    // Sort events by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Activity timeline error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch activity timeline", events: [] },
      { status: 500 }
    );
  }
}
