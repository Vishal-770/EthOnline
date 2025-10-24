import express from "express";
import cors from "cors";
import { fetchTokenAddresses } from "./fetch-token-address.ts";
import { metadata } from "./test.ts";
import { getAllTokenTransactions } from "./transaction.ts";
import { OnChainAggregator } from './aggregate.ts';
import { createClient } from 'redis';
import type { Transaction } from "./aggregate.ts";
import { GoogleGenerativeAI } from '@google/generative-ai';

// -------------------- Redis Setup --------------------
const client = createClient({
  username: 'default',
  password: 'pDQQrMEE5RQ9aMMqBw4WdKWItjNYmWHB',
  socket: {
    host: 'redis-13615.c277.us-east-1-3.ec2.redns.redis-cloud.com',
    port: 13615
  }
});

client.on('error', err => console.log('Redis Client Error', err));
await client.connect();

// -------------------- Interfaces --------------------
interface Token {
  address: string;
  firstSeenBlock: number;
  firstSeenTimestamp: number;
}

// -------------------- Express Setup --------------------
const app = express();
const port = 3001;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Envio API is running");
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

app.get("/token-addresses", async (req, res) => {
  try {
    const addresses = await fetchTokenAddresses();
    res.json(addresses);
  } catch (error) {
    console.error("Error fetching token addresses:", error);
    res.status(500).json({ error: "Failed to fetch token addresses" });
  }
});

app.get('/transactions/:address', async (req, res) => {
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

// -------------------- Trending Score Calculation --------------------
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
    (activityScore * 0.25) +
    (liquidityHealthScore * 0.2) +
    (distributionScore * 0.15) +
    (momentumScore * 0.1) +
    (Math.min(buyVsSellRatio, 100) * 0.1) +
    (Math.max(priceChange24h, -100) / 2);

  console.log("score: ", score);

  return Math.max(0, Math.min(100, Math.round(score)));
}

// -------------------- Run Aggregation --------------------
async function runOnceAtStart(tokens: Token[]) {
  const aggregator = new OnChainAggregator();

  for (const token of tokens) {
    const transactions: Transaction[] = await getAllTokenTransactions(token.address);
    const analysis = await metadata(token.address);

    aggregator.addTransactions(transactions);
    aggregator.addTokenData(analysis);

    const onChainMetrics = aggregator.analyzeOnChain();
    const combinedAnalysis = aggregator.generateCombinedAnalysis(onChainMetrics);

    console.log("onchain activity: ", onChainMetrics);

    const trendingscore = calculateTrendingScore(onChainMetrics);
    console.log(`Token: ${token.address}, Trending Score: ${trendingscore}`);

    await client.set(token.address, JSON.stringify({
      address: token.address,
      trendingscore
    }));
  }
}

// -------------------- API Endpoint to Initialize DB --------------------
app.post('/dbinit', async (req, res) => {
  try {
    const tokens: Token[] = await fetchTokenAddresses();
    await runOnceAtStart(tokens);
    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
});

// -------------------- Start Server --------------------
app.listen(port, () => {
  console.log(`Envio API listening at http://localhost:${port}`);
});
