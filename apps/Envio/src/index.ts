// import express from "express";
// import cors from "cors";
// import { fetchTokenAddresses } from "./fetch-token-address.ts";
// import { metadata } from "./test.ts";
// import { getAllTokenTransactions } from "./transaction.ts";
// import { OnChainAggregator } from './aggregate.ts';
// import { createClient } from 'redis';
// import type { Transaction } from "./aggregate.ts";
// import { GoogleGenerativeAI } from '@google/generative-ai';

// const client = createClient({
//   username: 'default',
//   password: 'pDQQrMEE5RQ9aMMqBw4WdKWItjNYmWHB',
//   socket: {
//     host: 'redis-13615.c277.us-east-1-3.ec2.redns.redis-cloud.com',
//     port: 13615
//   }
// });

// client.on('error', err => console.log('Redis Client Error', err));
// await client.connect();

// interface Token {
//   address: string;
//   firstSeenBlock: number;
//   firstSeenTimestamp: number;
// }

// const app = express();
// const port = 3001;

// app.use(cors());

// app.get("/", (req, res) => {
//   res.send("Envio API is running");
// });

// app.get("/token-metadata/:address", async (req, res) => {
//   try {
//     const address = req.params.address;
//     const data = await metadata(address);
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching token metadata:", error);
//     res.status(500).json({ error: "Failed to fetch token metadata" });
//   }
// });

// app.get("/token-addresses", async (req, res) => {
//   try {
//     const addresses = await fetchTokenAddresses();
//     res.json(addresses);
//   } catch (error) {
//     console.error("Error fetching token addresses:", error);
//     res.status(500).json({ error: "Failed to fetch token addresses" });
//   }
// });

// app.get('/transactions/:address', async (req, res) => {
//   try {
//     const tokenAddress = req.params.address as string;
//     if (!tokenAddress) {
//       return res.status(400).json({ error: "Token address is required" });
//     }
//     const transactions = await getAllTokenTransactions(tokenAddress);
//     return res.json(transactions);
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     return res.status(500).json({ error: "Failed to fetch transactions" });
//   }
// });

// // -------------------- Trending Score Calculation --------------------
// function calculateTrendingScore(metrics: any) {
//   const {
//     activityScore = 0,
//     liquidityHealthScore = 0,
//     momentumScore = 0,
//     distributionScore = 0,
//     buyVsSellRatio = 1,
//     priceChange24h = 0,
//   } = metrics;

//   const score =
//     (activityScore * 0.25) +
//     (liquidityHealthScore * 0.2) +
//     (distributionScore * 0.15) +
//     (momentumScore * 0.1) +
//     (Math.min(buyVsSellRatio, 100) * 0.1) +
//     (Math.max(priceChange24h, -100) / 2);

//   console.log("score: ", score);

//   return Math.max(0, Math.min(100, Math.round(score)));
// }

// async function runOnceAtStart(tokens: Token[]) {
//   const aggregator = new OnChainAggregator();

//   for (const token of tokens) {
//     const transactions: Transaction[] = await getAllTokenTransactions(token.address);
//     const analysis = await metadata(token.address);

//     aggregator.addTransactions(transactions);
//     aggregator.addTokenData(analysis);

//     const onChainMetrics = aggregator.analyzeOnChain();
//     const combinedAnalysis = aggregator.generateCombinedAnalysis(onChainMetrics);

//     console.log("onchain activity: ", onChainMetrics);

//     const trendingscore = calculateTrendingScore(onChainMetrics);
//     console.log(`Token: ${token.address}, Trending Score: ${trendingscore}`);

//     await client.set(token.address, JSON.stringify({
//       address: token.address,
//       trendingscore
//     }));
//   }
// }

// app.post('/dbinit', async (req, res) => {
//   try {
//     const tokens: Token[] = await fetchTokenAddresses();
//     await runOnceAtStart(tokens);
//     res.json({ message: 'Database initialized successfully' });
//   } catch (error) {
//     console.error('Error initializing database:', error);
//     res.status(500).json({ error: 'Failed to initialize database' });
//   }
// });

// app.listen(port, () => {
//   console.log(`Envio API listening at http://localhost:${port}`);
// });

import express from "express";
import cors from "cors";
import { fetchTokenAddresses } from "./fetch-token-address.ts";
import { metadata } from "./test.ts";
import { getAllTokenTransactions } from "./transaction.ts";
import { OnChainAggregator } from "./aggregate.ts";
import { createClient } from "redis";
import type { Transaction } from "./aggregate.ts";

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

// -------------------- Utility Functions --------------------
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

// -------------------- API Endpoints --------------------
app.get("/", (req, res) => {
  res.send("Envio API is running");
});

app.post("/dbinit", async (req, res) => {
  try {
    const tokens: Token[] = await fetchTokenAddresses();
    await analyzeAndStoreTokens(tokens);
    res.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("Error initializing database:", error);
    res.status(500).json({ error: "Failed to initialize database" });
  }
});

/**
 * 🆕 Endpoint: Fetch new tokens, analyze, and push to Redis (skipping existing)
 */
app.post("/refresh-tokens", async (req, res) => {
  try {
    console.log("\n🔄 Refreshing new tokens...\n");

    const tokens: Token[] = await fetchTokenAddresses(2); // look back 2 days
    await analyzeAndStoreTokens(tokens);

    res.json({ message: "New tokens fetched and updated successfully" });
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    res.status(500).json({ error: "Failed to refresh tokens" });
  }
});

// -------------------- Scheduled Task (every 1 hour) --------------------
setInterval(async () => {
  console.log("\n⏰ Hourly token refresh started...\n");
  try {
    const tokens: Token[] = await fetchTokenAddresses(2);
    await analyzeAndStoreTokens(tokens);
    console.log("✅ Hourly token refresh completed.\n");
  } catch (error) {
    console.error("❌ Hourly token refresh failed:", error);
  }
}, 3 * 60 * 1000); // every 1 hour
// }, 60 * 60 * 1000); // every 1 hour

// -------------------- Start Server --------------------
app.listen(port, () => {
  console.log(`🚀 Envio API listening at http://localhost:${port}`);
});
