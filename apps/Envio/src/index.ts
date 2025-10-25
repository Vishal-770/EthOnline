import express from "express";
import cors from "cors";
import { fetchTokenAddresses } from "./fetch-token-address.ts";
import { metadata } from "./test.ts";
import { getAllTokenTransactions } from "./transaction.ts";
import { OnChainAggregator } from "./aggregate.ts";
import { createClient } from "redis";
import type { Transaction } from "./aggregate.ts";
import { fetchTokenAddressesMultichain } from "./multichain/multichain-address.ts";
import { analyzeTokenWalletsMultiChain } from "./wallet-analysis.ts";

const client = createClient({
  username: "default",
  password: "pDQQrMEE5RQ9aMMqBw4WdKWItjNYmWHB",
  socket: {
    host: "redis-13615.c277.us-east-1-3.ec2.redns.redis-cloud.com",
    port: 13615,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();

interface Token {
  address: string;
  firstSeenBlock: number;
  firstSeenTimestamp: number;
}

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

function calculateTrendingScore(metrics: any) {
  const {
    activityScore = 0,
    liquidityHealthScore = 0,
    momentumScore = 0,
    distributionScore = 0,
    buyVsSellRatio = 1,
    priceChange24h = 0,
  } = metrics;

  const score =
    activityScore * 0.25 +
    liquidityHealthScore * 0.2 +
    distributionScore * 0.15 +
    momentumScore * 0.1 +
    Math.min(buyVsSellRatio, 100) * 0.1 +
    Math.max(priceChange24h, -100) / 2;

  return Math.max(0, Math.min(100, Math.round(score)));
}

async function analyzeAndStoreTokens(tokens: Token[]) {
  const aggregator = new OnChainAggregator();

  for (const token of tokens) {
    try {
      const exists = await client.exists(token.address);
      if (exists) {
        console.log(`⏭️ Skipping ${token.address} — already exists in Redis`);
        continue;
      }

      const transactions: Transaction[] = await getAllTokenTransactions(
        token.address
      );
      const analysis = await metadata(token.address);

      aggregator.addTransactions(transactions);
      aggregator.addTokenData(analysis);

      const onChainMetrics = aggregator.analyzeOnChain();
      const trendingScore = calculateTrendingScore(onChainMetrics);

      console.log(`✅ ${token.address} — Trending Score: ${trendingScore}`);

      await client.set(
        token.address,
        JSON.stringify({
          address: token.address,
          trendingscore: trendingScore,
          block: token.firstSeenBlock,
          timestamp: token.firstSeenTimestamp,
        })
      );
    } catch (err) {
      console.error(`❌ Error analyzing token ${token.address}:`, err);
    }
  }
}

app.get("/", (req, res) => {
  res.send("Envio API is running");
});

// app.get("/token-addresses", async (req, res) => {
//   try {
//     const body = req.body;
//     if(body.hypersyncurl ){
//       console.log("Using custom Hypersync URL from request body:", body.hypersyncurl);
//       const addresses = await fetchTokenAddresses(body.hypersyncurl);
//       return res.json(addresses);
//     }
//     const addresses = await fetchTokenAddresses();

//     res.json(addresses);
//   } catch (error) {
//     console.error("Error fetching token addresses:", error);
//     res.status(500).json({ error: "Failed to fetch token addresses" });
//   }
// });

// app.get("/token-metadata/:address", async (req, res) => {
//   try {
//     const address = req.params.address;
//     const body = req.body;
//     if(body.hypersyncurl ){
//       console.log("Using custom Hypersync URL from request body:", body.hypersyncurl);
//       const data = await metadata(address, body.hypersyncurl);
//       return res.json(data);
//     }
//     const data = await metadata(address);
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching token metadata:", error);
//     res.status(500).json({ error: "Failed to fetch token metadata" });
//   }
// });

// app.get("/transactions/:address", async (req, res) => {
//   try {
//     const tokenAddress = req.params.address as string;
//     if (!tokenAddress) {
//       return res.status(400).json({ error: "Token address is required" });
//     }
//     const body = req.body;
//     if(body.hypersyncurl ){
//       console.log("Using custom Hypersync URL from request body:", body.hypersyncurl);
//       const transactions = await getAllTokenTransactions(tokenAddress, body.hypersyncurl);
//       return res.json(transactions);
//     }
//     const transactions = await getAllTokenTransactions(tokenAddress);
//     return res.json(transactions);
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     return res.status(500).json({ error: "Failed to fetch transactions" });
//   }
// });

app.get("/token-addresses", async (req, res) => {
  try {
    const hypersyncurl = req.body?.hypersyncurl;
    console.log(hypersyncurl)
    if(hypersyncurl){
      console.log("Using custom Hypersync URL from request body:", hypersyncurl);
      const addresses = await fetchTokenAddresses(hypersyncurl);
      return res.json(addresses);
    }
    const addresses = await fetchTokenAddresses();
    res.json(addresses);
  } catch (error) {
    console.error("Error fetching token addresses:", error);
    res.status(500).json({ error: "Failed to fetch token addresses" });
  }
});

// to get multichain transactions
// body: eg: { "hypersyncurl": "https://arbitrum.hypersync.xyz", days:360}
app.post("/token-addresses", async (req, res) => {
  try {
    const { hypersyncurl, days } = req.body;
    console.log("Received hypersyncurl:", hypersyncurl);
    
    if(hypersyncurl){
      console.log("Using custom Hypersync URL:", hypersyncurl);
      const addresses = await fetchTokenAddresses(days, hypersyncurl);
      return res.json(addresses);
    }
    
    const addresses = await fetchTokenAddresses();
    res.json(addresses);
  } catch (error) {
    console.error("Error fetching token addresses:", error);
    res.status(500).json({ error: "Failed to fetch token addresses" });
  }
});

app.get("/token-metadata/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const data = await metadata(address);
    res.json(data);
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    res.status(500).json({ error: "Failed to fetch token metadata" });
  }
});

// to get multichain transactions
// body: eg: { "string": "arbitrum", }
app.post("/token-metadata/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const string = req.body?.string;
    if(string){
      console.log("Using custom Hypersync URL from request body:", string);
      const data = await metadata(address, string);
      return res.json(data);
    }
    const data = await metadata(address);
    res.json(data);
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    res.status(500).json({ error: "Failed to fetch token metadata" });
  }
});

app.get("/transactions/:address", async (req, res) => {
  try {
    const tokenAddress = req.params.address as string;
    if (!tokenAddress) {
      return res.status(400).json({ error: "Token address is required" });
    }
    const transactions = await getAllTokenTransactions(tokenAddress);
    return res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});


// to get multichain transactions
// body: eg: { "hypersyncurl": "https://arbitrum.hypersync.xyz", }
app.post("/transactions/:address", async (req, res) => {
  try {
    const tokenAddress = req.params.address as string;
    if (!tokenAddress) {
      return res.status(400).json({ error: "Token address is required" });
    }
    const hypersyncurl = req.body?.hypersyncurl;
    if(hypersyncurl){
      console.log("Using custom Hypersync URL from request body:", hypersyncurl);
      const transactions = await getAllTokenTransactions(tokenAddress, hypersyncurl);
      return res.json(transactions);
    }
    const transactions = await getAllTokenTransactions(tokenAddress);
    return res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.post("/dbinit", async (req, res) => {
  try {
    // const tokens: Token[] = await fetchTokenAddresses();
    const tokens: Token[] = await fetchTokenAddressesMultichain();
    await analyzeAndStoreTokens(tokens);
    res.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("Error initializing database:", error);
    res.status(500).json({ error: "Failed to initialize database" });
  }
});

app.post("/refresh-tokens", async (req, res) => {
  try {
    console.log("\n🔄 Refreshing new tokens...\n");

    // const tokens: Token[] = await fetchTokenAddresses(2); // look back 2 days
    const tokens: Token[] = await fetchTokenAddressesMultichain(2); // look back 2 days
    await analyzeAndStoreTokens(tokens);

    res.json({ message: "New tokens fetched and updated successfully" });
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    res.status(500).json({ error: "Failed to refresh tokens" });
  }
});

function stringifyBigInts(obj: any): any {
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(stringifyBigInts);
  if (obj !== null && typeof obj === "object") {
    const res: any = {};
    for (const key in obj) {
      res[key] = stringifyBigInts(obj[key]);
    }
    return res;
  }
  return obj;
}

//http://localhost:3001/analyze-wallets/0xE0Db8f00c7b3cd24d44e0C7230749D4cBCe6ca95
app.get("/analyze-wallets/:address", async (req, res) => {
  try {
    const tokenAddress = req.params.address as string;
    if (!tokenAddress) {
      return res.status(400).json({ error: "Token address is required" });
    }
    const analysis = await analyzeTokenWalletsMultiChain(tokenAddress);
    console.log("analysis: ", analysis);

    // Convert BigInt to strings
    const safeAnalysis = stringifyBigInts(analysis);

    return res.json(safeAnalysis);
  } catch (error) {
    console.error("Error analyzing wallets:", error);
    return res.status(500).json({ error: "Failed to analyze wallets" });
  }
});


setInterval(async () => {
  console.log("\n⏰ Hourly token refresh started...\n");
  try {
    // const tokens: Token[] = await fetchTokenAddresses(2);
    const tokens: Token[] = await fetchTokenAddressesMultichain(2);
    await analyzeAndStoreTokens(tokens);
    console.log("✅ Hourly token refresh completed.\n");
  } catch (error) {
    console.error("❌ Hourly token refresh failed:", error);
  }
}, 60 * 60 * 1000); 

app.listen(port, () => {
  console.log(`🚀 Envio API listening at http://localhost:${port}`);
});
