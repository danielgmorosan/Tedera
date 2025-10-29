import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy PropertySale and DividendDistributor contracts
 *
 * Usage:
 * 1. With token address: npx hardhat run scripts/deployPropertyContracts.ts --network testnet
 * 2. Set TOKEN_ADDRESS environment variable or pass as argument
 *
 * Example:
 * TOKEN_ADDRESS=0x123... npx hardhat run scripts/deployPropertyContracts.ts --network testnet
 */

interface DeploymentConfig {
  tokenAddress: string;
  pricePerShare: string; // in wei (tinybars)
  totalShares: number;
  saleDuration: number; // in seconds, 0 for unlimited
}

async function main() {
  console.log("=".repeat(60));
  console.log("Deploying Property Contracts to Hedera");
  console.log("=".repeat(60));

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("\n📝 Deployer address:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("💰 Deployer balance:", ethers.utils.formatEther(balance), "HBAR");

  // Get configuration from environment or use defaults
  const config: DeploymentConfig = {
    tokenAddress: process.env.TOKEN_ADDRESS || "",
    pricePerShare: process.env.PRICE_PER_SHARE || ethers.utils.parseEther("1").toString(), // 1 HBAR default
    totalShares: parseInt(process.env.TOTAL_SHARES || "1000"),
    saleDuration: parseInt(process.env.SALE_DURATION || "0"), // 0 = unlimited
  };

  console.log("\n⚙️  Configuration:");
  console.log("  Token Address:", config.tokenAddress || "⚠️  NOT SET - will use placeholder");
  console.log("  Price per Share:", ethers.utils.formatEther(config.pricePerShare), "HBAR");
  console.log("  Total Shares:", config.totalShares);
  console.log("  Sale Duration:", config.saleDuration === 0 ? "Unlimited" : `${config.saleDuration} seconds`);

  // If no token address provided, warn user
  if (!config.tokenAddress || config.tokenAddress === "") {
    console.log("\n⚠️  WARNING: No token address provided!");
    console.log("   Set TOKEN_ADDRESS environment variable or update the deployment after token creation.");
    console.log("   Using placeholder address for now...\n");
    config.tokenAddress = "0x0000000000000000000000000000000000000000";
  }

  console.log("\n🚀 Deploying PropertySale contract...");
  const PropertySale = await ethers.getContractFactory("PropertySale");
  const propertySale = await PropertySale.deploy(
    config.tokenAddress,
    config.pricePerShare,
    config.totalShares,
    config.saleDuration
  );

  await propertySale.deployTransaction.wait();
  console.log("✅ PropertySale deployed to:", propertySale.address);

  console.log("\n🚀 Deploying DividendDistributor contract...");
  const DividendDistributor = await ethers.getContractFactory("DividendDistributor");
  const dividendDistributor = await DividendDistributor.deploy(
    config.tokenAddress
  );

  await dividendDistributor.deployTransaction.wait();
  console.log("✅ DividendDistributor deployed to:", dividendDistributor.address);

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PropertySale: {
        address: propertySale.address,
        tokenAddress: config.tokenAddress,
        pricePerShare: config.pricePerShare,
        totalShares: config.totalShares,
        saleDuration: config.saleDuration,
      },
      DividendDistributor: {
        address: dividendDistributor.address,
        tokenAddress: config.tokenAddress,
      },
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `property-contracts-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log("✅ Deployment Completed Successfully!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("  PropertySale:         ", propertySale.address);
  console.log("  DividendDistributor:  ", dividendDistributor.address);
  console.log("\n💾 Deployment info saved to:", filename);

  console.log("\n📝 Next Steps:");
  if (config.tokenAddress === "0x0000000000000000000000000000000000000000") {
    console.log("  1. Create a property token using the ATS SDK");
    console.log("  2. Transfer tokens to PropertySale contract");
    console.log("  3. Update web app with these contract addresses");
  } else {
    console.log("  1. Transfer tokens to PropertySale contract:", propertySale.address);
    console.log("  2. Update web app with these contract addresses");
    console.log("  3. Test the presale functionality");
  }
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
