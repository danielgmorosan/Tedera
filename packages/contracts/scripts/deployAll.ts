import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  deployer: string;
  timestamp: string;
  contracts: {
    PropertySale?: {
      address: string;
      tokenAddress: string;
      pricePerShare: string;
      totalShares: number;
      saleDuration: number;
    };
    DividendDistributor?: {
      address: string;
      tokenAddress: string;
    };
  };
}

async function main() {
  console.log("🚀 Starting deployment of PropertySale and DividendDistributor...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 Deployment Configuration:");
  console.log("  Network:", network.name);
  console.log("  Chain ID:", network.chainId);
  console.log("  Deployer:", deployer.address);
  console.log("  Balance:", ethers.utils.formatEther(await deployer.getBalance()), "HBAR\n");

  // Get configuration from environment
  const tokenAddress = process.env.TOKEN_ADDRESS || ethers.constants.AddressZero;
  const pricePerShare = process.env.PRICE_PER_SHARE || ethers.utils.parseEther("1").toString();
  const totalShares = parseInt(process.env.TOTAL_SHARES || "1000");
  const saleDuration = parseInt(process.env.SALE_DURATION || "2592000"); // 30 days

  console.log("⚙️  Contract Parameters:");
  console.log("  Token Address:", tokenAddress);
  console.log("  Price Per Share:", ethers.utils.formatEther(pricePerShare), "HBAR");
  console.log("  Total Shares:", totalShares);
  console.log("  Sale Duration:", saleDuration, "seconds (", Math.floor(saleDuration / 86400), "days)\n");

  // Deploy PropertySale
  console.log("📦 Deploying PropertySale...");
  const PropertySale = await ethers.getContractFactory("PropertySale");
  const propertySale = await PropertySale.deploy(
    tokenAddress,
    pricePerShare,
    totalShares,
    saleDuration
  );

  await propertySale.deployTransaction.wait();
  console.log("✅ PropertySale deployed to:", propertySale.address);

  // Deploy DividendDistributor
  console.log("\n📦 Deploying DividendDistributor...");
  const DividendDistributor = await ethers.getContractFactory("DividendDistributor");
  const dividendDistributor = await DividendDistributor.deploy(tokenAddress);

  await dividendDistributor.deployTransaction.wait();
  console.log("✅ DividendDistributor deployed to:", dividendDistributor.address);

  // Save deployment info
  const deploymentInfo: DeploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PropertySale: {
        address: propertySale.address,
        tokenAddress,
        pricePerShare,
        totalShares,
        saleDuration,
      },
      DividendDistributor: {
        address: dividendDistributor.address,
        tokenAddress,
      },
    },
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save to file
  const filename = `deployment-${network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  // Also save as latest
  const latestPath = path.join(deploymentsDir, `deployment-${network.name}-latest.json`);
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:");
  console.log("  ", filepath);
  console.log("  ", latestPath);

  // Print summary
  console.log("\n" + "=".repeat(80));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(80));
  console.log("\n📝 Contract Addresses:");
  console.log("  PropertySale:         ", propertySale.address);
  console.log("  DividendDistributor:  ", dividendDistributor.address);
  
  console.log("\n🔗 Verify on HashScan:");
  const explorerBase = network.chainId === 296 
    ? "https://hashscan.io/testnet" 
    : "https://hashscan.io/mainnet";
  console.log("  PropertySale:         ", `${explorerBase}/contract/${propertySale.address}`);
  console.log("  DividendDistributor:  ", `${explorerBase}/contract/${dividendDistributor.address}`);

  console.log("\n📋 Next Steps:");
  console.log("  1. Add these addresses to apps/web/.env.local:");
  console.log(`     NEXT_PUBLIC_PROPERTY_SALE_ADDRESS=${propertySale.address}`);
  console.log(`     NEXT_PUBLIC_DIVIDEND_DISTRIBUTOR_ADDRESS=${dividendDistributor.address}`);
  console.log("  2. Restart the web app: npm run dev");
  console.log("  3. Test the contracts on HashScan");
  console.log("\n" + "=".repeat(80) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

