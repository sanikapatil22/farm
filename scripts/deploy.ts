import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying ActivityLog...");

  const { viem } = await network.connect();
  const contract = await viem.deployContract("ActivityLog");

  const address = contract.address;

  console.log("✅ ActivityLog deployed to:", address);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});