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

async function main() {
  console.log("=".repeat(60));
  console.log("Deploying Property Contracts to Hedera");
  console.log("=".repeat(60));

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("\n📝 Deployer address:", deployer.address);

  const balance = await deployer.getBalance();
  console.log(
    "💰 Deployer balance:",
    ethers.utils.formatEther(balance),
    "HBAR"
  );

  const dividentContractAddress = "0x3048A84e069AC772f9B30dB613d556349b4712bc";

  const DividendDistributor = await ethers.getContractFactory(
    "DividendDistributor"
  );
  const dividendDistributor = await DividendDistributor.attach(
    dividentContractAddress
  );

  const tx = await dividendDistributor.connect(deployer).claimDividend(0);

  console.log("\n🚀 Transaction submitted. Hash:", tx.hash);

  await tx.wait();

  const hasClaimed = await dividendDistributor.hasClaimed(0, deployer.address);

  console.log(
    `\n✅ Dividend claimed status for token ID 0 and address ${deployer.address}:`,
    hasClaimed
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
