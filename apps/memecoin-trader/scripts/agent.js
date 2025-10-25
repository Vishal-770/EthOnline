const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
  }
});

// --- Contract ABIs ---
const TRADER_ABI = [
  "function depositETH() external payable",
  "function executeTrade(uint8 tradeType, address user, address token, uint256 amount, string reason) external",
  "function ethBalances(address user) view returns (uint256)",
  "function tokenBalances(address user, address token) view returns (uint256)",
  "event TradeExecuted(address indexed user, address indexed token, uint256 inputAmount, uint256 outputAmount, uint256 timestamp, string tradeType, string reason)"
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

const trendingTokens = require("../config/trending-tokens.json");

async function getUserPortfolio(userAddress) {
  try {
    if (!userAddress || userAddress === 'undefined') {
      console.error("❌ USER_ADDRESS not set in .env file!");
      return { ethBalance: "0", tokenHoldings: [], totalValueUSD: "0" };
    }

    let ethBalance = 0n;
    let ethBalanceFormatted = "0";
    
    try {
      ethBalance = await contract.ethBalances(userAddress);
      ethBalanceFormatted = ethers.formatEther(ethBalance);
    } catch (err) {
      console.log(`⚠️ Error fetching ETH balance: ${err.message}`);
    }

    const tokenHoldings = [];
    
    for (const token of trendingTokens) {
      try {
        const balance = await contract.tokenBalances(userAddress, token.address);
        
        if (balance > 0n) {
          const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);
          const decimals = await tokenContract.decimals();
          const balanceFormatted = ethers.formatUnits(balance, decimals);
          
          if (parseFloat(balanceFormatted) > 0.000001) {
            tokenHoldings.push({
              address: token.address,
              symbol: token.symbol,
              balance: balanceFormatted,
              valueUSD: (parseFloat(balanceFormatted) * parseFloat(token.priceUSD || 0)).toFixed(2)
            });
          }
        }
      } catch (err) {
        continue;
      }
    }

    return {
      ethBalance: ethBalanceFormatted,
      tokenHoldings,
      totalValueUSD: tokenHoldings.reduce((sum, t) => sum + parseFloat(t.valueUSD), 0).toFixed(2)
    };
  } catch (err) {
    console.error("❌ Error fetching portfolio:", err.message);
    return { ethBalance: "0", tokenHoldings: [], totalValueUSD: "0" };
  }
}

async function getMarketData() {
  return trendingTokens.map(token => {
    const volumeToLiqRatio = token.volume24h && token.totalLiquidityUSD 
      ? (token.volume24h / token.totalLiquidityUSD).toFixed(4)
      : "0";
    
    return {
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      priceUSD: parseFloat(token.priceUSD || 0).toFixed(6),
      marketCap: parseInt(token.marketCap || 0),
      volume24h: parseInt(token.volume24h || 0),
      liquidityUSD: parseInt(token.totalLiquidityUSD || 0),
      volumeToLiqRatio: volumeToLiqRatio,
      ageInDays: token.viralMetrics?.ageInDays || 0,
      dexCount: token.totalPairs || 0
    };
  }).filter(t => t.liquidityUSD > 5000);
}

function createTradingPrompt(marketData, portfolio) {
  const hasTokens = portfolio.tokenHoldings.length > 0;
  const hasETH = parseFloat(portfolio.ethBalance) > 0;
  
  return `You are an aggressive memecoin trading AI. Make a HIGH-RISK, HIGH-REWARD decision NOW.

PORTFOLIO:
💰 ETH: ${portfolio.ethBalance} ${hasETH ? "✅ READY TO TRADE" : "❌ EMPTY"}
🪙 Tokens: ${portfolio.tokenHoldings.length} ${hasTokens ? "positions" : "NONE - FRESH START!"}
💵 Total: $${portfolio.totalValueUSD}

${hasTokens ? `HOLDINGS:\n${portfolio.tokenHoldings.map(t => `  ${t.symbol}: ${parseFloat(t.balance).toFixed(4)} = $${t.valueUSD}`).join('\n')}\n` : '🎯 NO POSITIONS - Time to FIND OPPORTUNITIES!\n'}

AVAILABLE MEMECOINS (Sepolia Testnet):
${marketData.map((t, i) => `
${i + 1}. ${t.symbol} - ${t.name}
   📍 ${t.address}
   💵 Price: $${t.priceUSD}
   📊 MCap: $${(t.marketCap / 1000000).toFixed(2)}M
   💧 Liquidity: $${(t.liquidityUSD / 1000).toFixed(0)}k
   📈 Volume 24h: $${(t.volume24h / 1000).toFixed(0)}k
   🔥 Vol/Liq: ${t.volumeToLiqRatio} ${parseFloat(t.volumeToLiqRatio) > 0.15 ? "🚀 HOT!" : parseFloat(t.volumeToLiqRatio) > 0.08 ? "⚡ ACTIVE" : ""}
   ⏰ Age: ${t.ageInDays} days ${t.ageInDays < 30 ? "🆕 NEW!" : ""}
   🏦 DEX Pairs: ${t.dexCount}`).join('\n')}

MEMECOIN TRADING STRATEGY:
✅ Look for HIGH volume/liquidity ratio (>0.15 = 🚀, >0.08 = ⚡)
✅ NEW tokens (<30 days) = early entry opportunity
✅ Good liquidity ($50k+) = safer from rugs
✅ Multiple DEX pairs = more established
✅ You have ${portfolio.ethBalance} ETH - USE IT to make gains!

RULES:
- Max: ${process.env.MAX_TRADE_AMOUNT || "0.05"} ETH per trade
- Min confidence: 0.7
- BUY when you have ETH and see opportunity
- SELL when you hold tokens and want to take profit
- AGGRESSIVE mindset - this is memecoin trading!

YOU MUST RESPOND WITH VALID JSON (no markdown):
{
  "action": "BUY",
  "token_address": "0x...",
  "token_symbol": "MOONR",
  "amount": "0.04",
  "reason": "High volume/liquidity ratio of 0.297 shows strong trading activity. New 8-day token with momentum.",
  "confidence": 0.85,
  "analysis": {
    "opportunity": "Early entry into trending memecoin with active trading",
    "risk": "Volatility typical of new memecoins"
  }
}

${hasETH ? "⚡ YOU HAVE ETH - FIND A BUY OPPORTUNITY NOW!" : ""}
${!hasETH && !hasTokens ? "❌ NO FUNDS - RESPOND WITH HOLD" : ""}

Respond ONLY with JSON:`;
}

// --- Parse AI response ---
function parseAIResponse(response) {
  try {
    const text = response.text();
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.log("⚠️ No JSON found in AI response");
      console.log("Raw response:", text);
      return { action: "HOLD", reason: "No valid JSON response" };
    }
    
    const decision = JSON.parse(jsonMatch[0]);
    
    if (!["BUY", "SELL", "HOLD"].includes(decision.action)) {
      return { action: "HOLD", reason: "Invalid action type" };
    }
    
    if (decision.action !== "HOLD" && !decision.token_address) {
      return { action: "HOLD", reason: "Missing token address" };
    }
    
    if (decision.action !== "HOLD" && !decision.amount) {
      return { action: "HOLD", reason: "Missing amount" };
    }
    
    return decision;
  } catch (err) {
    console.error("❌ Parse error:", err.message);
    return { action: "HOLD", reason: "Failed to parse AI response" };
  }
}

async function executeBuy(userAddress, tokenAddress, ethAmount, reason) {
  console.log(`\n🔵 EXECUTING BUY`);
  console.log(`   User: ${userAddress}`);
  console.log(`   Token: ${tokenAddress}`);
  console.log(`   Amount: ${ethAmount} ETH`);
  console.log(`   Reason: ${reason}`);
  
  try {
    const amountWei = ethers.parseEther(ethAmount);
    
    const tx = await contract.executeTrade(
      0, // BUY
      userAddress,
      tokenAddress,
      amountWei,
      reason,
      { gasLimit: 500000 }
    );
    
    console.log(`   TX: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ BUY executed successfully in block ${receipt.blockNumber}`);
    
    return true;
  } catch (err) {
    console.error("❌ BUY failed:", err.message);
    return false;
  }
}

async function executeSell(userAddress, tokenAddress, tokenAmount, reason) {
  console.log(`\n🔴 EXECUTING SELL`);
  console.log(`   User: ${userAddress}`);
  console.log(`   Token: ${tokenAddress}`);
  console.log(`   Amount: ${tokenAmount} tokens`);
  console.log(`   Reason: ${reason}`);
  
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.parseUnits(tokenAmount, decimals);
    
    const tx = await contract.executeTrade(
      1, 
      userAddress,
      tokenAddress,
      amountWei,
      reason,
      { gasLimit: 500000 }
    );
    
    console.log(`   TX: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ SELL executed successfully in block ${receipt.blockNumber}`);
    
    return true;
  } catch (err) {
    console.error("❌ SELL failed:", err.message);
    return false;
  }
}

async function tradingLoop() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║   🤖 AI Memecoin Trading Agent      ║");
  console.log("╚══════════════════════════════════════╝\n");
  console.log(`Contract: ${process.env.TRADER_CONTRACT_ADDRESS}`);
  console.log(`User: ${process.env.USER_ADDRESS || "❌ NOT SET"}`);
  console.log(`Max Trade: ${process.env.MAX_TRADE_AMOUNT || "0.05"} ETH`);
  console.log(`Interval: 5 minutes\n`);

  const userAddress = process.env.USER_ADDRESS;
  
  if (!userAddress || userAddress === 'undefined') {
    console.error("❌ CRITICAL: USER_ADDRESS not set in .env file!");
    console.error("Add this line to your .env file:");
    console.error("USER_ADDRESS=0xYourWalletAddress\n");
    process.exit(1);
  }

  let iteration = 0;

  while (true) {
    try {
      iteration++;
      console.log(`\n${"=".repeat(60)}`);
      console.log(`🔄 ITERATION #${iteration} - ${new Date().toLocaleString()}`);
      console.log("=".repeat(60));

      console.log("\n📊 Fetching data...");
      const portfolio = await getUserPortfolio(userAddress);
      const marketData = await getMarketData();

      console.log(`\n💼 Portfolio:`);
      console.log(`   ETH: ${portfolio.ethBalance} ETH`);
      console.log(`   Tokens: ${portfolio.tokenHoldings.length} position${portfolio.tokenHoldings.length !== 1 ? 's' : ''}`);
      console.log(`   Total Value: $${portfolio.totalValueUSD}`);
      
      if (portfolio.tokenHoldings.length > 0) {
        console.log(`\n   Current Holdings:`);
        portfolio.tokenHoldings.forEach(t => {
          console.log(`   - ${t.symbol}: ${parseFloat(t.balance).toFixed(6)} ($${t.valueUSD})`);
        });
      } else {
        console.log(`   📭 No token holdings yet`);
      }
      
      const hasETH = parseFloat(portfolio.ethBalance) > 0;
      const hasTokens = portfolio.tokenHoldings.length > 0;
      
      if (!hasETH && !hasTokens) {
        console.log(`\n⚠️ WARNING: User has no ETH and no tokens!`);
        console.log(`   Please deposit ETH to contract: ${process.env.TRADER_CONTRACT_ADDRESS}`);
        console.log(`   Skipping this iteration...\n`);
        await new Promise(r => setTimeout(r, 60 * 1000));
        continue;
      }

      console.log(`\n🧠 Consulting AI (using aggressive memecoin strategy)...`);
      const prompt = createTradingPrompt(marketData, portfolio);
      const result = await model.generateContent(prompt);
      const decision = parseAIResponse(result.response);

      console.log(`\n📋 AI Decision:`);
      console.log(JSON.stringify(decision, null, 2));

      const maxTrade = parseFloat(process.env.MAX_TRADE_AMOUNT || "0.05");
      const availableETH = parseFloat(portfolio.ethBalance);
      
      if (decision.action === "BUY") {
        if (!decision.token_address) {
          console.log(`⚠️ No token address specified`);
        } else if (!decision.amount || parseFloat(decision.amount) <= 0) {
          console.log(`⚠️ Invalid amount: ${decision.amount}`);
        } else {
          const amount = parseFloat(decision.amount);
          
          if (availableETH <= 0) {
            console.log(`❌ Cannot BUY: No ETH (balance: ${portfolio.ethBalance})`);
          } else if (amount > maxTrade) {
            console.log(`⚠️ Amount ${amount} exceeds max ${maxTrade}, using max`);
            await executeBuy(userAddress, decision.token_address, maxTrade.toString(), `${decision.reason} (capped)`);
          } else if (amount > availableETH) {
            console.log(`⚠️ Amount ${amount} > available ${availableETH}, using all`);
            await executeBuy(userAddress, decision.token_address, availableETH.toString(), `${decision.reason} (all-in)`);
          } else if (decision.confidence < 0.7) {
            console.log(`⚠️ Low confidence: ${decision.confidence} < 0.7`);
          } else {
            await executeBuy(userAddress, decision.token_address, decision.amount, decision.reason);
          }
        }
      } 
      else if (decision.action === "SELL") {
        if (!decision.token_address) {
          console.log(`⚠️ No token address specified`);
        } else if (portfolio.tokenHoldings.length === 0) {
          console.log(`❌ Cannot SELL: No tokens held`);
        } else {
          const holding = portfolio.tokenHoldings.find(
            t => t.address.toLowerCase() === decision.token_address.toLowerCase()
          );
          
          if (!holding) {
            console.log(`❌ Not holding ${decision.token_symbol}`);
            console.log(`   Available: ${portfolio.tokenHoldings.map(t => t.symbol).join(', ')}`);
          } else {
            const requestedAmount = parseFloat(decision.amount);
            const availableAmount = parseFloat(holding.balance);
            
            if (requestedAmount > availableAmount) {
              console.log(`⚠️ Requested ${requestedAmount} > available ${availableAmount}, selling all`);
              await executeSell(userAddress, decision.token_address, holding.balance, `${decision.reason} (all)`);
            } else if (decision.confidence < 0.7) {
              console.log(`⚠️ Low confidence: ${decision.confidence} < 0.7`);
            } else {
              await executeSell(userAddress, decision.token_address, decision.amount, decision.reason);
            }
          }
        }
      } 
      else {
        console.log("⏸️ HOLD - No action taken");
        if (decision.reason) {
          console.log(`   Reason: ${decision.reason}`);
        }
      }

      console.log(`\n⏳ Waiting 5 minutes...\n`);
      await new Promise(r => setTimeout(r, 5 * 60 * 1000));

    } catch (err) {
      console.error("\n❌ Error:", err.message);
      console.log("⏳ Retrying in 1 minute...\n");
      await new Promise(r => setTimeout(r, 60 * 1000));
    }
  }
}

process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down...");
  process.exit(0);
});

tradingLoop().catch(err => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});