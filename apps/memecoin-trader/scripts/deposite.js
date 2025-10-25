const ethers = require("ethers");
const dotenv = require("dotenv");
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = process.env.TRADER_CONTRACT_ADDRESS;
const abi = [
  "function depositETH() external payable"
];

const contract = new ethers.Contract(contractAddress, abi, wallet);

async function depositETH(amountInETH) {
  const tx = await contract.depositETH({ value: ethers.parseEther(amountInETH) });
  console.log("Transaction sent, hash:", tx.hash);
  await tx.wait();
  console.log(`✅ Deposited ${amountInETH} ETH into contract!`);
}

// depositETH("0.005").catch(console.error);
