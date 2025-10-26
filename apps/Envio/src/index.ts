import express from "express";
import cors from "cors";
import { fetchTokenAddresses } from "./fetch-token-address.js";
import { metadata } from "./test.js";
import { getAllTokenTransactions } from "./transaction.js";
import { OnChainAggregator } from "./aggregate.js";
import { createClient } from "redis";
import type { Transaction } from "./aggregate.js";
import { fetchTokenAddressesMultichain } from "./multichain/multichain-address.js";
import { analyzeTokenWalletsMultiChain } from "./wallet-analysis.js";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || "",
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

client.on("error", (err: Error) => {
  // Redis connection errors are logged
});

await client.connect();

interface Token {
  address: string;
  firstSeenBlock: number;
  firstSeenTimestamp: number;
}

const app = express();

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
      // Error analyzing token - skip
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
    if (hypersyncurl) {
      const addresses = await fetchTokenAddresses(hypersyncurl);
      return res.json(addresses);
    }
    const addresses = await fetchTokenAddresses();
    return res.json(addresses);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch token addresses" });
  }
});

// to get multichain transactions
// body: eg: { "hypersyncurl": "https://arbitrum.hypersync.xyz", days:360}
app.post("/token-addresses", async (req, res) => {
  try {
    const { hypersyncurl, days } = req.body;

    if (hypersyncurl) {
      const addresses = await fetchTokenAddresses(days, hypersyncurl);
      return res.json(addresses);
    }

    const addresses = await fetchTokenAddresses();
    return res.json(addresses);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch token addresses" });
  }
});

app.get("/token-metadata/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const data = await metadata(address);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch token metadata" });
  }
});

// to get multichain transactions
// body: eg: { "string": "arbitrum", }
app.post("/token-metadata/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const string = req.body?.string;
    if (string) {
      const data = await metadata(address, string);
      return res.json(data);
    }
    const data = await metadata(address);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch token metadata" });
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
    if (hypersyncurl) {
      console.log(
        "Using custom Hypersync URL from request body:",
        hypersyncurl
      );
      const transactions = await getAllTokenTransactions(
        tokenAddress,
        hypersyncurl
      );
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
    const tokens: Token[] = await fetchTokenAddressesMultichain();
    await analyzeAndStoreTokens(tokens);
    return res.json({ message: "Database initialized successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to initialize database" });
  }
});

app.post("/refresh-tokens", async (req, res) => {
  try {
    const tokens: Token[] = await fetchTokenAddressesMultichain(2);
    await analyzeAndStoreTokens(tokens);
    return res.json({ message: "New tokens fetched and updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to refresh tokens" });
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

    // Convert BigInt to strings
    const safeAnalysis = stringifyBigInts(analysis);

    return res.json(safeAnalysis);
  } catch (error) {
    return res.status(500).json({ error: "Failed to analyze wallets" });
  }
});

setInterval(
  async () => {
    try {
      const tokens: Token[] = await fetchTokenAddressesMultichain(2);
      await analyzeAndStoreTokens(tokens);
    } catch (error) {
      // Hourly refresh failed
    }
  },
  60 * 60 * 1000
  // 60 * 60 * 1000
);

const port = parseInt(process.env.PORT || "3001");

app.listen(port, () => {
 console.log(`Envio API is running on port ${port}`);
});
