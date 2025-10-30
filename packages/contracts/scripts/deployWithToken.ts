import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy PropertySale and DividendDistributor for a specific token
 * 
 * This script is meant to be called after creating a property token via ATS SDK
 * 
 * Usage:
 * npx hardhat run scripts/deployWithToken.ts --network testnet
 * 
 * Pass token address as first argument:
 * npx ts-node scripts/deployWithToken.ts <tokenAddress> <pricePerShare> <totalShares>
 */

async function deployForToken(
  tokenAddress: string,
  pricePerShareHBAR: string = "1",
  totalShares: number = 1000,
  saleDurationDays: number = 30
) {
  console.log("=".repeat(60));
  console.log("Deploying Property Contracts for Token");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("\n📝 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.utils.formatEther(await deployer.getBalance()), "HBAR");

  const pricePerShare = ethers.utils.parseEther(pricePerShareHBAR);
  const saleDuration = saleDurationDays * 24 * 60 * 60; // Convert days to seconds

  console.log("\n⚙️  Configuration:");
  console.log("  Token Address:", tokenAddress);
  console.log("  Price per Share:", pricePerShareHBAR, "HBAR");
  console.log("  Total Shares:", totalShares);
  console.log("  Sale Duration:", saleDurationDays, "days");

  // Deploy PropertySale
  console.log("\n🚀 Deploying PropertySale...");
  const PropertySale = await ethers.getContractFactory("PropertySale");
  const totalSharesWei = ethers.utils.parseUnits(totalShares.toString(), 18);
  console.log("   totalShares (human):", totalShares);
  console.log("   totalShares (wei):", totalSharesWei.toString());
  const propertySale = await PropertySale.deploy(
    tokenAddress,
    pricePerShare,
    totalSharesWei,
    saleDuration
  );
  await propertySale.deployTransaction.wait();
  console.log("✅ PropertySale:", propertySale.address);

  // Deploy DividendDistributor
  console.log("\n🚀 Deploying DividendDistributor...");
  const DividendDistributor = await ethers.getContractFactory("DividendDistributor");
  const dividendDistributor = await DividendDistributor.deploy(tokenAddress);
  await dividendDistributor.deployTransaction.wait();
  console.log("✅ DividendDistributor:", dividendDistributor.address);

  // Save deployment
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    timestamp: new Date().toISOString(),
    tokenAddress,
    contracts: {
      PropertySale: {
        address: propertySale.address,
        pricePerShare: pricePerShare.toString(),
        pricePerShareHBAR,
        totalShares,
        saleDuration,
        saleDurationDays,
      },
      DividendDistributor: {
        address: dividendDistributor.address,
      },
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `deployment-${tokenAddress.slice(0, 10)}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deployment, null, 2)
  );

  console.log("\n" + "=".repeat(60));
  console.log("✅ Deployment Complete!");
  console.log("=".repeat(60));
  console.log("\n📋 Addresses:");
  console.log("  PropertySale:        ", propertySale.address);
  console.log("  DividendDistributor: ", dividendDistributor.address);
  console.log("\n💾 Saved to:", filename);
  console.log("\n📝 Next Steps:");
  console.log("  1. Transfer", totalShares, "tokens to PropertySale:", propertySale.address);
  console.log("  2. Update .env with these addresses:");
  console.log("     NEXT_PUBLIC_PROPERTY_SALE_ADDRESS=" + propertySale.address);
  console.log("     NEXT_PUBLIC_DIVIDEND_DISTRIBUTOR_ADDRESS=" + dividendDistributor.address);
  console.log("\n");

  return { propertySale, dividendDistributor };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("❌ Error: Token address required");
    console.log("\nUsage:");
    console.log("  npx hardhat run scripts/deployWithToken.ts --network testnet");
    console.log("\nOr with custom parameters:");
    console.log("  TOKEN_ADDRESS=0x... PRICE=1 SHARES=1000 DAYS=30 npx hardhat run scripts/deployWithToken.ts --network testnet");
    process.exit(1);
  }

  const tokenAddress = args[0] || process.env.TOKEN_ADDRESS;
  const pricePerShare = args[1] || process.env.PRICE || "1";
  const totalShares = parseInt(args[2] || process.env.SHARES || "1000");
  const saleDays = parseInt(args[3] || process.env.DAYS || "30");

  if (!tokenAddress || !ethers.utils.isAddress(tokenAddress)) {
    console.error("❌ Error: Invalid token address");
    process.exit(1);
  }

  await deployForToken(tokenAddress, pricePerShare, totalShares, saleDays);
}

// Only run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("\n❌ Deployment failed:");
      console.error(error);
      process.exit(1);
    });
}

export { deployForToken };

