const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying MemeTrader...");

  const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER;
  const MemeTrader = await hre.ethers.getContractFactory("MemeTrader");
  const trader = await MemeTrader.deploy(UNISWAP_ROUTER);

  await trader.waitForDeployment();
  const address = await trader.getAddress();

  console.log("MemeTrader deployed to:", address);
  console.log("\nAdd to .env:");
  console.log(`TRADER_CONTRACT_ADDRESS=${address}`);

  // Fund contract
  const [owner] = await hre.ethers.getSigners();
  const tx = await owner.sendTransaction({
    to: address,
    value: hre.ethers.parseEther("0.1")
  });
  await tx.wait();
  console.log("Contract funded with 0.1 ETH");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});