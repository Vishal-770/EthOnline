import { GoogleGenerativeAI } from "@google/generative-ai";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const TRADER_ABI = [
  "function depositETH() external payable",
  "function executeTrade(uint8 tradeType, address user, address token, uint256 amount, string reason) external",
  "function ethBalances(address user) view returns (uint256)",
  "function tokenBalances(address user, address token) view returns (uint256)",
];
const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint256)"
];

const contract = new ethers.Contract(
  process.env.TRADER_CONTRACT_ADDRESS,
  TRADER_ABI,
  wallet
);

async function getUserPortfolio(userAddress, trendingTokens) {
  try {
    const ethBalance = await contract.ethBalances(userAddress);
    const ethFormatted = ethers.formatEther(ethBalance);

    const tokenHoldings = [];
    for (const token of trendingTokens) {
      try {
        const balance = await contract.tokenBalances(userAddress, token.address);
        if (balance > 0n) {
          const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);
          const decimals = await tokenContract.decimals();
          const formatted = ethers.formatUnits(balance, decimals);
          tokenHoldings.push({
            address: token.address,
            symbol: token.symbol,
            balance: formatted,
            valueUSD: (parseFloat(formatted) * parseFloat(token.priceUSD || 0)).toFixed(2),
          });
        }
      } catch {}
    }

    return {
      ethBalance: ethFormatted,
      tokenHoldings,
      totalValueUSD: tokenHoldings.reduce((s, t) => s + parseFloat(t.valueUSD), 0).toFixed(2),
    };
  } catch (err) {
    console.error("❌ Portfolio fetch error:", err.message);
    return { ethBalance: "0", tokenHoldings: [], totalValueUSD: "0" };
  }
}

function getMarketData(trendingTokens) {
  return trendingTokens
    .map(t => ({
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      priceUSD: parseFloat(t.priceUSD || 0).toFixed(6),
      liquidityUSD: parseInt(t.totalLiquidityUSD || 0),
      volume24h: parseInt(t.volume24h || 0),
      volumeToLiqRatio:
        t.volume24h && t.totalLiquidityUSD
          ? (t.volume24h / t.totalLiquidityUSD).toFixed(4)
          : "0",
    }))
    .filter(t => t.liquidityUSD > 5000);
}

function createTradingPrompt(marketData, portfolio) {
  return `
You are an aggressive memecoin trading AI. 
Portfolio: ${portfolio.ethBalance} ETH, ${portfolio.tokenHoldings.length} tokens, $${portfolio.totalValueUSD}
Market Data (Top 5): ${marketData
    .slice(0, 5)
    .map(t => `${t.symbol} $${t.priceUSD}`)
    .join(", ")}

Decide whether to BUY, SELL, or HOLD.
Respond with valid JSON:
{"action":"BUY","token_address":"0x...","token_symbol":"XXX","amount":"0.03","reason":"short reason","confidence":0.9}
`;
}

function parseAIResponse(response) {
  try {
    const text = response.text();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("⚠️ AI parse error:", err.message);
    return { action: "HOLD", reason: "Invalid AI response" };
  }
}

async function executeBuy(user, token, ethAmount, reason) {
  console.log(`🚀 BUY ${ethAmount} ETH of ${token} | ${reason}`);
  try {
    const tx = await contract.executeTrade(0, user, token, ethers.parseEther(ethAmount), reason, { gasLimit: 500000 });
    await tx.wait();
    console.log(`✅ BUY executed successfully`);
  } catch (err) {
    console.error("❌ BUY failed:", err.message);
  }
}

async function executeSell(user, token, amount, reason) {
  console.log(`💥 SELL ${amount} tokens of ${token} | ${reason}`);
  try {
    const tokenContract = new ethers.Contract(token, ERC20_ABI, provider);
    const decimals = await tokenContract.decimals();
    const tx = await contract.executeTrade(1, user, token, ethers.parseUnits(amount, decimals), reason, { gasLimit: 500000 });
    await tx.wait();
    console.log(`✅ SELL executed successfully`);
  } catch (err) {
    console.error("❌ SELL failed:", err.message);
  }
}
export async function runSingleTrade(trendingTokens) {
  console.log("🤖 Starting single AI trading cycle...\n");
  const userAddress = process.env.USER_ADDRESS;

  const portfolio = await getUserPortfolio(userAddress, trendingTokens);
  const marketData = getMarketData(trendingTokens);

  console.log(`Portfolio: ${portfolio.ethBalance} ETH, $${portfolio.totalValueUSD}`);
  const prompt = createTradingPrompt(marketData, portfolio);

  console.log("🧠 Asking AI for trading decision...");
  const aiResult = await model.generateContent(prompt);
  const decision = parseAIResponse(aiResult.response);

  console.log("\n📊 AI Decision:", decision);

  if (decision.action === "BUY") {
    await executeBuy(userAddress, decision.token_address, decision.amount, decision.reason);
  } else if (decision.action === "SELL") {
    await executeSell(userAddress, decision.token_address, decision.amount, decision.reason);
  } else {
    console.log("⏸️ HOLD - No action taken.");
  }

  console.log("\n✅ Single trading cycle completed.");
}
