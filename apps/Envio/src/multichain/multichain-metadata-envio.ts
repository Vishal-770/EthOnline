import {
  HypersyncClient,
  LogField,
  BlockField,
  TransactionField,
} from "@envio-dev/hypersync-client";
import type { Query } from "@envio-dev/hypersync-client";
import * as dotenv from "dotenv";
import fs from "fs/promises";
import { CHAINS } from "./multichain-address.ts";

dotenv.config();

const TRANSFER_EVENT_SIGNATURE =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export interface EnvioOnlyTokenData {
  // Basic info
  address: string;
  chainId: number;
  chainName: string;

  // Creation info
  creationBlock: number;
  creationTimestamp: number;
  creationTxHash: string;
  deployerAddress: string;

  // Activity metrics (calculated from on-chain data)
  totalTransfers: number;
  uniqueHolders: number;
  totalVolume: string; // In token units
  firstActivityTimestamp: number;
  lastActivityTimestamp: number;
  ageInHours: number;
  ageInDays: number;

  // Time-based metrics
  transfers24h: number;
  transfers7d: number;
  uniqueHolders24h: number;
  uniqueHolders7d: number;

  // Activity patterns
  avgTransfersPerHour: number;
  avgTransfersPerDay: number;
  peakActivityHour: number;
  activityTrend: "increasing" | "decreasing" | "stable";

  // Holder distribution (estimated)
  top10HoldersPercentage: number;
  holderConcentration: "high" | "medium" | "low";

  // Cross-chain presence
  isMultichain: boolean;
  chainsActive: string[];

  // Calculated scores
  activityScore: number; // 0-100
  distributionScore: number; // 0-100
  momentumScore: number; // 0-100
  overallScore: number; // 0-100

  // Risk indicators
  suspiciousPatterns: string[];
  riskScore: number; // 0-100
}

/**
 * Fetch creation data using HyperSync
 */
async function fetchCreationInfo(
  tokenAddress: string,
  chainId: number,
  hypersyncUrl: string
): Promise<{
  creationBlock: number;
  creationTimestamp: number;
  creationTxHash: string;
  deployerAddress: string;
}> {
  const hs = HypersyncClient.new({
    url: hypersyncUrl,
    bearerToken: process.env.HYPERSYNC_BEARER_TOKEN || "c09215fd-568a-48f0-83b3-c96c2572ad85",
  });

  // First get current block height
  const heightQuery: Query = {
    fromBlock: 0,
    logs: [],
    fieldSelection: { block: [BlockField.Number] },
    maxNumBlocks: 1,
  };

  const heightRes = await hs.get(heightQuery);
  const currentBlock = heightRes.nextBlock - 1;

  const query: Query = {
    fromBlock: 0,
    toBlock: currentBlock,
    logs: [{ address: [tokenAddress] }],
    fieldSelection: {
      log: [LogField.BlockNumber, LogField.TransactionHash],
      block: [BlockField.Number, BlockField.Timestamp],
      transaction: [TransactionField.From],
    },
    maxNumLogs: 1,
    includeAllBlocks: true,
  };

  const response = await hs.get(query);

  if (response?.data?.logs && response.data.logs.length > 0) {
    const log = response.data.logs[0];
    const block = response.data.blocks?.[0];
    const transaction = response.data.transactions?.[0];

    return {
      creationBlock: log.blockNumber ?? 0,
      creationTimestamp: block?.timestamp ?? 0,
      creationTxHash: log.transactionHash ?? "",
      deployerAddress: transaction?.from ?? "",
    };
  }

  throw new Error("Token creation data not found");
}

/**
 * Fetch all transfer events and calculate metrics
 */
async function fetchAndAnalyzeTransfers(
  tokenAddress: string,
  chainId: number,
  hypersyncUrl: string,
  lookbackDays: number = 30
): Promise<{
  transfers: Array<{
    from: string;
    to: string;
    value: string;
    timestamp: number;
    blockNumber: number;
  }>;
  metrics: any;
}> {
  const hs = HypersyncClient.new({
    url: hypersyncUrl,
    bearerToken: process.env.HYPERSYNC_BEARER_TOKEN || "c09215fd-568a-48f0-83b3-c96c2572ad85",
  });

  // Get current block for lookback
  const heightQuery: Query = {
    fromBlock: 0,
    toBlock: 999999999,
    logs: [],
    fieldSelection: { block: [BlockField.Number] },
    maxNumBlocks: 1,
  };

  const heightRes = await hs.get(heightQuery);
  const currentBlock = heightRes.nextBlock - 1;

  // Calculate lookback based on chain
  const chain = CHAINS.find((c) => c.id === chainId);
  const blocksToLookback = chain ? chain.blocksPerDay * lookbackDays : 7200 * lookbackDays;
  const startBlock = Math.max(0, currentBlock - blocksToLookback);

  console.log(`   Fetching transfers from block ${startBlock} to ${currentBlock}...`);

  const transfers: Array<{
    from: string;
    to: string;
    value: string;
    timestamp: number;
    blockNumber: number;
  }> = [];

  let fromBlock = startBlock;
  let batchCount = 0;

  while (fromBlock < currentBlock) {
    batchCount++;

    const query: Query = {
      fromBlock,
      toBlock: currentBlock,
      logs: [
        {
          address: [tokenAddress],
          topics: [[TRANSFER_EVENT_SIGNATURE]],
        },
      ],
      fieldSelection: {
        log: [
          LogField.BlockNumber,
          LogField.Topic1,
          LogField.Topic2,
          LogField.Data,
        ],
        block: [BlockField.Number, BlockField.Timestamp],
      },
      maxNumLogs: 100000,
      includeAllBlocks: false,
    };

    const response = await hs.get(query);

    if (!response?.data?.logs || response.data.logs.length === 0) {
      break;
    }

    console.log(`   Batch ${batchCount}: ${response.data.logs.length} transfers`);

    for (const log of response.data.logs) {
      const block = response.data.blocks?.find((b) => b.number === log.blockNumber);

      if (log.topics && log.topics.length >= 3) {
        const from = "0x" + log.topics[1]!.slice(-40);
        const to = "0x" + log.topics[2]!.slice(-40);
        let value = "0";

        if (log.data) {
          try {
            value = BigInt(log.data).toString();
          } catch {
            value = log.data;
          }
        }

        transfers.push({
          from,
          to,
          value,
          timestamp: block?.timestamp ?? 0,
          blockNumber: log.blockNumber ?? 0,
        });
      }
    }

    fromBlock = response.nextBlock;

    if (response.data.logs.length < 100000) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  // Calculate metrics
  const metrics = calculateMetrics(transfers);

  return { transfers, metrics };
}

/**
 * Calculate comprehensive metrics from transfer data
 */
function calculateMetrics(
  transfers: Array<{
    from: string;
    to: string;
    value: string;
    timestamp: number;
    blockNumber: number;
  }>
) {
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;

  // Unique holders
  const holders = new Set<string>();
  const holderBalances = new Map<string, bigint>();

  transfers.forEach((t) => {
    if (t.from !== "0x0000000000000000000000000000000000000000") {
      holders.add(t.from);
    }
    if (t.to !== "0x0000000000000000000000000000000000000000") {
      holders.add(t.to);
    }

    // Track balances
    try {
      const value = BigInt(t.value);
      if (t.from !== "0x0000000000000000000000000000000000000000") {
        const currentBalance = holderBalances.get(t.from) || 0n;
        holderBalances.set(t.from, currentBalance - value);
      }
      if (t.to !== "0x0000000000000000000000000000000000000000") {
        const currentBalance = holderBalances.get(t.to) || 0n;
        holderBalances.set(t.to, currentBalance + value);
      }
    } catch {}
  });

  // Filter positive balances and sort
  const positiveBalances = Array.from(holderBalances.entries())
    .filter(([_, balance]) => balance > 0n)
    .sort((a, b) => (b[1] > a[1] ? 1 : -1));

  // Calculate total supply from balances
  const totalSupply = positiveBalances.reduce(
    (sum, [_, balance]) => sum + balance,
    0n
  );

  // Top 10 holders
  const top10Supply = positiveBalances
    .slice(0, 10)
    .reduce((sum, [_, balance]) => sum + balance, 0n);
  const top10Percentage =
    totalSupply > 0n ? Number((top10Supply * 100n) / totalSupply) : 0;

  // Time-based filtering
  const last24h = transfers.filter((t) => t.timestamp > now - day);
  const last7d = transfers.filter((t) => t.timestamp > now - 7 * day);

  const uniqueHolders24h = new Set<string>();
  last24h.forEach((t) => {
    uniqueHolders24h.add(t.from);
    uniqueHolders24h.add(t.to);
  });

  const uniqueHolders7d = new Set<string>();
  last7d.forEach((t) => {
    uniqueHolders7d.add(t.from);
    uniqueHolders7d.add(t.to);
  });

  // Activity patterns
  const hourCounts = new Array(24).fill(0);
  transfers.forEach((t) => {
    const date = new Date(t.timestamp * 1000);
    const hour = date.getUTCHours();
    if (hour >= 0 && hour < 24) {
      hourCounts[hour]++;
    }
  });
  const peakActivityHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Timestamps
  const firstActivity = transfers[0]?.timestamp || now;
  const lastActivity = transfers[transfers.length - 1]?.timestamp || now;
  const ageInHours = Math.floor((now - firstActivity) / 3600);

  // Activity rates
  const avgTransfersPerHour = ageInHours > 0 ? transfers.length / ageInHours : 0;
  const avgTransfersPerDay = avgTransfersPerHour * 24;

  // Trend detection
  const recentRate = last7d.length / 7;
  const olderTransfers = transfers.filter(
    (t) => t.timestamp > now - 30 * day && t.timestamp <= now - 7 * day
  );
  const olderRate = olderTransfers.length / 23;
  const trendChange = olderRate > 0 ? (recentRate - olderRate) / olderRate : 0;

  let activityTrend: "increasing" | "decreasing" | "stable";
  if (trendChange > 0.2) activityTrend = "increasing";
  else if (trendChange < -0.2) activityTrend = "decreasing";
  else activityTrend = "stable";

  // Total volume
  const totalVolume = transfers.reduce((sum, t) => {
    try {
      return sum + BigInt(t.value);
    } catch {
      return sum;
    }
  }, 0n);

  // Holder concentration
  let holderConcentration: "high" | "medium" | "low";
  if (top10Percentage > 70) holderConcentration = "high";
  else if (top10Percentage > 40) holderConcentration = "medium";
  else holderConcentration = "low";

  // Suspicious patterns
  const suspiciousPatterns: string[] = [];
  let riskScore = 0;

  if (top10Percentage > 80) {
    suspiciousPatterns.push("Extreme holder concentration (>80%)");
    riskScore += 30;
  }

  if (last24h.length > last7d.length * 5 && last7d.length > 0) {
    suspiciousPatterns.push("Sudden activity spike detected");
    riskScore += 25;
  }

  // Wash trading detection (same address pairs)
  const tradePairs = new Map<string, number>();
  transfers.forEach((t) => {
    const pair = [t.from, t.to].sort().join("-");
    tradePairs.set(pair, (tradePairs.get(pair) || 0) + 1);
  });
  const maxPairTrades = Math.max(...Array.from(tradePairs.values()), 0);
  if (maxPairTrades > transfers.length * 0.15) {
    suspiciousPatterns.push("Potential wash trading pattern");
    riskScore += 35;
  }

  // Scoring
  const activityScore = Math.min(
    100,
    Math.log10(avgTransfersPerDay + 1) * 25 + Math.log10(holders.size + 1) * 20
  );

  const distributionScore = Math.max(0, 100 - top10Percentage);

  const momentumScore =
    activityTrend === "increasing"
      ? Math.min(100, 50 + trendChange * 100)
      : activityTrend === "decreasing"
      ? Math.max(0, 50 + trendChange * 100)
      : 50;

  const overallScore = Math.max(
    0,
    (activityScore + distributionScore + momentumScore) / 3 - riskScore / 2
  );

  return {
    totalVolume: totalVolume.toString(),
    uniqueHolders: holders.size,
    transfers24h: last24h.length,
    transfers7d: last7d.length,
    uniqueHolders24h: uniqueHolders24h.size,
    uniqueHolders7d: uniqueHolders7d.size,
    avgTransfersPerHour,
    avgTransfersPerDay,
    peakActivityHour,
    activityTrend,
    firstActivity,
    lastActivity,
    ageInHours,
    top10Percentage,
    holderConcentration,
    suspiciousPatterns,
    riskScore,
    activityScore,
    distributionScore,
    momentumScore,
    overallScore,
  };
}

/**
 * Get metadata using only Envio HyperSync (no external APIs)
 */
export async function getEnvioOnlyMetadata(
  tokenAddress: string,
  chainId: number,
  lookbackDays: number = 30
): Promise<EnvioOnlyTokenData> {
  const chain = CHAINS.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  console.log(`\n🔍 Fetching token data using ONLY Envio HyperSync`);
  console.log(`Token: ${tokenAddress} on ${chain.name}`);
  console.log(`Lookback: ${lookbackDays} days`);
  console.log("━".repeat(70));

  // Fetch creation info
  console.log("📦 Step 1: Fetching creation info...");
  const creationInfo = await fetchCreationInfo(
    tokenAddress,
    chainId,
    chain.url
  );
  console.log(`   ✅ Created at block ${creationInfo.creationBlock}`);

  // Fetch and analyze transfers
  console.log("\n📊 Step 2: Analyzing transfer events...");
  const { transfers, metrics } = await fetchAndAnalyzeTransfers(
    tokenAddress,
    chainId,
    chain.url,
    lookbackDays
  );
  console.log(`   ✅ Analyzed ${transfers.length} transfers`);

  // Compile final data
  const tokenData: EnvioOnlyTokenData = {
    address: tokenAddress,
    chainId,
    chainName: chain.name,
    creationBlock: creationInfo.creationBlock,
    creationTimestamp: creationInfo.creationTimestamp,
    creationTxHash: creationInfo.creationTxHash,
    deployerAddress: creationInfo.deployerAddress,
    totalTransfers: transfers.length,
    uniqueHolders: metrics.uniqueHolders,
    totalVolume: metrics.totalVolume,
    firstActivityTimestamp: metrics.firstActivity,
    lastActivityTimestamp: metrics.lastActivity,
    ageInHours: metrics.ageInHours,
    ageInDays: Math.floor(metrics.ageInHours / 24),
    transfers24h: metrics.transfers24h,
    transfers7d: metrics.transfers7d,
    uniqueHolders24h: metrics.uniqueHolders24h,
    uniqueHolders7d: metrics.uniqueHolders7d,
    avgTransfersPerHour: metrics.avgTransfersPerHour,
    avgTransfersPerDay: metrics.avgTransfersPerDay,
    peakActivityHour: metrics.peakActivityHour,
    activityTrend: metrics.activityTrend,
    top10HoldersPercentage: metrics.top10Percentage,
    holderConcentration: metrics.holderConcentration,
    isMultichain: false, // Single chain in this function
    chainsActive: [chain.name],
    activityScore: metrics.activityScore,
    distributionScore: metrics.distributionScore,
    momentumScore: metrics.momentumScore,
    overallScore: metrics.overallScore,
    suspiciousPatterns: metrics.suspiciousPatterns,
    riskScore: metrics.riskScore,
  };

  console.log("\n✅ Analysis complete");
  printEnvioOnlySummary(tokenData);

  return tokenData;
}

/**
 * Batch analyze multiple tokens across chains using only Envio
 */
export async function batchGetEnvioOnlyMetadata(
  tokens: Array<{ address: string; chainId: number }>,
  lookbackDays: number = 30
): Promise<Map<string, EnvioOnlyTokenData>> {
  console.log(`\n🚀 BATCH ENVIO-ONLY METADATA FETCHER`);
  console.log("━".repeat(70));
  console.log(`Analyzing ${tokens.length} tokens (${lookbackDays} days lookback)\n`);

  const results = new Map<string, EnvioOnlyTokenData>();
  const CONCURRENCY = 2;

  for (let i = 0; i < tokens.length; i += CONCURRENCY) {
    const batch = tokens.slice(i, i + CONCURRENCY);

    const batchResults = await Promise.allSettled(
      batch.map(async (token) => {
        const metadata = await getEnvioOnlyMetadata(
          token.address,
          token.chainId,
          lookbackDays
        );
        return { key: `${token.chainId}-${token.address}`, metadata };
      })
    );

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.set(result.value.key, result.value.metadata);
      } else {
        console.error(`❌ Failed:`, result.reason);
      }
    });

    if (i + CONCURRENCY < tokens.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n✅ Batch complete: ${results.size}/${tokens.length} tokens`);

  return results;
}

/**
 * Rank tokens by on-chain activity (no price data needed)
 */
export function rankTokensByActivity(
  tokens: EnvioOnlyTokenData[]
): EnvioOnlyTokenData[] {
  return tokens
    .filter((token) => {
      return (
        token.ageInDays < 30 && // Focus on newer tokens
        token.uniqueHolders > 10 && // Minimum holder base
        token.totalTransfers > 50 && // Minimum activity
        token.riskScore < 70 // Not too risky
      );
    })
    .sort((a, b) => {
      // Primary sort: Overall score
      if (b.overallScore !== a.overallScore) {
        return b.overallScore - a.overallScore;
      }
      // Secondary: Activity trend
      if (a.activityTrend === "increasing" && b.activityTrend !== "increasing") {
        return -1;
      }
      if (b.activityTrend === "increasing" && a.activityTrend !== "increasing") {
        return 1;
      }
      // Tertiary: Number of holders
      return b.uniqueHolders - a.uniqueHolders;
    });
}

/**
 * Print summary
 */
function printEnvioOnlySummary(token: EnvioOnlyTokenData): void {
  console.log("\n📊 TOKEN SUMMARY (ENVIO DATA ONLY):");
  console.log("━".repeat(70));

  console.table({
    Address: token.address.slice(0, 10) + "...",
    Chain: token.chainName,
    "Age (hours)": token.ageInHours,
    "Age (days)": token.ageInDays,
    "Total Transfers": token.totalTransfers,
    "Unique Holders": token.uniqueHolders,
    "Transfers/Day": token.avgTransfersPerDay.toFixed(2),
  });

  console.log("\n📈 ACTIVITY METRICS:");
  console.table({
    "Last 24h Transfers": token.transfers24h,
    "Last 7d Transfers": token.transfers7d,
    "24h Active Users": token.uniqueHolders24h,
    "7d Active Users": token.uniqueHolders7d,
    "Activity Trend": token.activityTrend,
    "Peak Hour (UTC)": token.peakActivityHour,
  });

  console.log("\n🎯 SCORES:");
  console.table({
    Overall: `${token.overallScore.toFixed(1)}/100`,
    Activity: `${token.activityScore.toFixed(1)}/100`,
    Distribution: `${token.distributionScore.toFixed(1)}/100`,
    Momentum: `${token.momentumScore.toFixed(1)}/100`,
    Risk: `${token.riskScore.toFixed(1)}/100`,
  });

  console.log("\n⚖️  DISTRIBUTION:");
  console.table({
    "Top 10 Holders": `${token.top10HoldersPercentage.toFixed(1)}%`,
    Concentration: token.holderConcentration,
  });

  if (token.suspiciousPatterns.length > 0) {
    console.log("\n⚠️  WARNINGS:");
    token.suspiciousPatterns.forEach((p) => console.log(`   • ${p}`));
  }

  console.log("\n📝 DEPLOYMENT INFO:");
  console.log(`   Block: ${token.creationBlock}`);
  console.log(`   Tx: ${token.creationTxHash}`);
  console.log(`   Deployer: ${token.deployerAddress}`);
}

/**
 * Compare token across multiple chains (for multichain tokens)
 */
export async function compareTokenAcrossChains(
  tokenAddress: string,
  chainIds: number[] = [1, 8453, 137, 10, 42161]
): Promise<Map<number, EnvioOnlyTokenData>> {
  console.log(`\n🌐 CROSS-CHAIN COMPARISON`);
  console.log("━".repeat(70));
  console.log(`Token: ${tokenAddress}`);
  console.log(`Chains: ${chainIds.join(", ")}\n`);

  const results = new Map<number, EnvioOnlyTokenData>();

  for (const chainId of chainIds) {
    try {
      const data = await getEnvioOnlyMetadata(tokenAddress, chainId, 7);
      results.set(chainId, data);
    } catch (error) {
      console.log(`   ⚠️ Token not found on chain ${chainId}`);
    }
  }

  if (results.size > 1) {
    console.log("\n📊 CROSS-CHAIN SUMMARY:");
    const summary = Array.from(results.entries()).map(([chainId, data]) => ({
      Chain: data.chainName,
      Holders: data.uniqueHolders,
      "24h Transfers": data.transfers24h,
      "Activity Score": data.activityScore.toFixed(1),
      Trend: data.activityTrend,
    }));
    console.table(summary);
  }

  return results;
}

// CLI execution
// if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = args[0] || "single"; 

  const tokenAddress = "0x00c83aecc790e8a4453e5dd3b0b4b3680501a7a7";
  const chainId = parseInt(args[2]) || 1;

  if (mode === "compare" && tokenAddress) {
    compareTokenAcrossChains(tokenAddress)
      .then(async (results) => {
        await fs.writeFile(
          `./cross_chain_${tokenAddress.slice(0, 10)}.json`,
          JSON.stringify(Array.from(results.entries()), null, 2)
        );
        console.log("\n💾 Results saved");
        process.exit(0);
      })
      .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
      });
  } else if (tokenAddress) {
    getEnvioOnlyMetadata(tokenAddress, chainId)
      .then(async (data) => {
        await fs.writeFile(
          `./envio_only_${data.chainName}_${Date.now()}.json`,
          JSON.stringify(data, null, 2)
        );
        console.log("\n💾 Data saved");
        process.exit(0);
      })
      .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
      });
  } else {
    console.error("Usage:");
    console.error("  Single: ts-node multichain-metadata-envio-only.ts single <address> [chainId]");
    console.error("  Compare: ts-node multichain-metadata-envio-only.ts compare <address>");
    process.exit(1);
  }
// }