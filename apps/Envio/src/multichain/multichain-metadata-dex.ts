import {
  HypersyncClient,
  LogField,
  BlockField,
  TransactionField,
} from "@envio-dev/hypersync-client";
import type { Query } from "@envio-dev/hypersync-client";
import { ethers } from "ethers";
import axios from "axios";
import * as dotenv from "dotenv";
import fs from "fs/promises";
import { CHAINS } from "./multichain-address.ts";

dotenv.config();

const TRANSFER_EVENT_SIGNATURE =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const APPROVAL_EVENT_SIGNATURE =
  "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
];

const RPC_URLS: Record<number, string> = {
  1: process.env.ETH_RPC_URL || "https://eth.llamarpc.com",
  8453: process.env.BASE_RPC_URL || "https://mainnet.base.org",
  137: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
  10: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
  42161: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
};

export interface CompleteTokenAnalysis {
  // Basic Info
  address: string;
  chainId: number;
  chainName: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;

  // Creation Info (from Envio)
  creationBlock: string;
  creationTimestamp?: number;
  creationTxHash?: string;
  deployerAddress?: string;

  // Market Data (from DexScreener)
  marketCap: number;
  fullyDilutedValuation: number;
  priceUSD: number;
  totalLiquidityUSD: number;
  volume24h: number;
  volume6h: number;
  volume1h: number;
  priceChange1h: number;
  priceChange6h: number;
  priceChange24h: number;

  // Media & Links
  imageUrl?: string;
  headerImage?: string;
  websites?: string[];
  socials?: Array<{ type: string; url: string }>;

  // DEX Data - ALL chains where token exists
  chains: Array<{
    chainId: string;
    dexId: string;
    pairAddress: string;
    liquidityUSD: number;
    volume24h: number;
    priceUSD: number;
    labels: string[];
    url: string;
  }>;
  totalPairs: number;
  primaryDex: string;

  // Viral Metrics
  viralMetrics: {
    multiChainPresence: number;
    liquidityScore: number;
    volumeToLiquidityRatio: number;
    priceStability: number;
    dexDiversity: number;
    hasMedia: boolean;
    ageInDays: number;
    ageInHours: number;
    marketCapRank: string;
    isNewToken: boolean;
    hasStrongVolume: boolean;
    isMultichain: boolean;
    hasGoodLiquidity: boolean;
    momentumScore: number;
  };

  // On-Chain Activity (from Transactions)
  onChainActivity: {
    totalTransactions: number;
    totalTransfers: number;
    totalApprovals: number;
    uniqueAddresses: number;
    transfers24h: number;
    transfers7d: number;
    avgTransfersPerDay: number;
    activityTrend: "increasing" | "decreasing" | "stable";
    top10HoldersPercentage: number;
    holderConcentration: "high" | "medium" | "low";
    
    // By chain breakdown
    activityByChain: Record<string, {
      transactions: number;
      transfers: number;
      uniqueAddresses: number;
      txPerHour: number;
    }>;
  };

  // Risk Analysis
  riskAnalysis: {
    suspiciousPatterns: string[];
    riskScore: number;
    overallScore: number;
    investmentSignal: "strong_buy" | "buy" | "hold" | "sell" | "avoid";
  };
}

/**
 * Step 1: Fetch creation data from Envio
 */
async function fetchCreationData(
  tokenAddress: string,
  chainId: number
): Promise<{
  creationBlock: string;
  creationTimestamp?: number;
  creationTxHash?: string;
  deployerAddress?: string;
}> {
  const chain = CHAINS.find((c) => c.id === chainId);
  if (!chain) return { creationBlock: "Unknown" };

  try {
    const hs = HypersyncClient.new({
      url: chain.url,
      bearerToken: process.env.HYPERSYNC_BEARER_TOKEN || "c09215fd-568a-48f0-83b3-c96c2572ad85",
    });

    // Get current block
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
      return {
        creationBlock: response.data.logs[0].blockNumber?.toString() ?? "Unknown",
        creationTimestamp: response.data.blocks?.[0]?.timestamp,
        creationTxHash: response.data.logs[0].transactionHash,
        deployerAddress: response.data.transactions?.[0]?.from,
      };
    }
  } catch (err) {
    console.warn(`   ⚠️ Creation data fetch failed:`, err);
  }

  return { creationBlock: "Unknown" };
}

/**
 * Step 2: Fetch ERC20 metadata from RPC
 */
async function fetchERC20Data(
  tokenAddress: string,
  chainId: number
): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}> {
  const rpcUrl = RPC_URLS[chainId];
  if (!rpcUrl) {
    return { name: "Unknown", symbol: "Unknown", decimals: 18, totalSupply: "0" };
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: ethers.Network.from(chainId),
    });

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const timeout = (ms: number) =>
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

    const [nameResult, symbolResult, decimalsResult, totalSupplyResult] =
      (await Promise.race([
        Promise.all([
          contract.name?.().catch(() => "Unknown"),
          contract.symbol?.().catch(() => "Unknown"),
          contract.decimals?.().catch(() => 18n),
          contract.totalSupply?.().catch(() => 0n),
        ]),
        timeout(10000),
      ])) as [string, string, bigint, bigint];

    const decimals = Number(decimalsResult);
    const totalSupply = ethers.formatUnits(totalSupplyResult, decimals);

    return { name: nameResult, symbol: symbolResult, decimals, totalSupply };
  } catch (err) {
    console.warn(`   ⚠️ RPC fetch failed:`, err);
    return { name: "Unknown", symbol: "Unknown", decimals: 18, totalSupply: "0" };
  }
}

/**
 * Step 3: Fetch market data and media from DexScreener
 */
async function fetchDexScreenerData(tokenAddress: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      { timeout: 15000 }
    );

    const data = response.data;
    if (!data?.pairs || data.pairs.length === 0) {
      return null;
    }

    const pairs = data.pairs;
    const primaryPair = pairs[0];

    let totalLiquidity = 0;
    let totalVolume24h = 0;
    let totalVolume6h = 0;
    let totalVolume1h = 0;
    let priceChanges1h: number[] = [];
    let priceChanges6h: number[] = [];
    let priceChanges24h: number[] = [];

    const chainSet = new Set<string>();
    const dexSet = new Set<string>();
    const allChains: any[] = [];

    for (const pair of pairs) {
      chainSet.add(pair.chainId);
      dexSet.add(pair.dexId);

      allChains.push({
        chainId: pair.chainId,
        dexId: pair.dexId,
        pairAddress: pair.pairAddress,
        liquidityUSD: pair.liquidity?.usd || 0,
        volume24h: pair.volume?.h24 || 0,
        priceUSD: parseFloat(pair.priceUsd || "0"),
        labels: pair.labels || [],
        url: pair.url,
      });

      totalLiquidity += pair.liquidity?.usd || 0;
      totalVolume24h += pair.volume?.h24 || 0;
      totalVolume6h += pair.volume?.h6 || 0;
      totalVolume1h += pair.volume?.h1 || 0;

      if (pair.priceChange?.h1) priceChanges1h.push(pair.priceChange.h1);
      if (pair.priceChange?.h6) priceChanges6h.push(pair.priceChange.h6);
      if (pair.priceChange?.h24) priceChanges24h.push(pair.priceChange.h24);
    }

    const avgPriceChange = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      marketCap: primaryPair.marketCap || 0,
      fullyDilutedValuation: primaryPair.fdv || 0,
      priceUSD: parseFloat(primaryPair.priceUsd || "0"),
      totalLiquidityUSD: totalLiquidity,
      volume24h: totalVolume24h,
      volume6h: totalVolume6h,
      volume1h: totalVolume1h,
      priceChange1h: avgPriceChange(priceChanges1h),
      priceChange6h: avgPriceChange(priceChanges6h),
      priceChange24h: avgPriceChange(priceChanges24h),
      chains: allChains,
      totalPairs: pairs.length,
      primaryDex: primaryPair.dexId,
      imageUrl: primaryPair.info?.imageUrl,
      headerImage: primaryPair.info?.header,
      websites: primaryPair.info?.websites?.map((w: any) => w.url || w),
      socials: primaryPair.info?.socials?.map((s: any) => ({
        type: s.type,
        url: s.url,
      })),
      multiChainPresence: chainSet.size,
      dexDiversity: dexSet.size,
      hasMedia: !!(
        primaryPair.info?.imageUrl ||
        primaryPair.info?.websites?.length ||
        primaryPair.info?.socials?.length
      ),
    };
  } catch (err) {
    console.warn(`   ⚠️ DexScreener fetch failed:`, err);
    return null;
  }
}

/**
 * Step 4: Fetch transactions from Envio (multichain)
 */
async function fetchTransactionData(
  tokenAddress: string,
  chainIds: number[]
): Promise<any> {
  const activityByChain: Record<string, any> = {};
  let totalTransactions = 0;
  let totalTransfers = 0;
  let totalApprovals = 0;
  const allUniqueAddresses = new Set<string>();
  const allTransfers: any[] = [];

  for (const chainId of chainIds) {
    const chain = CHAINS.find((c) => c.id === chainId);
    if (!chain) continue;

    try {
      const hs = HypersyncClient.new({
        url: chain.url,
        bearerToken: process.env.HYPERSYNC_BEARER_TOKEN || "c09215fd-568a-48f0-83b3-c96c2572ad85",
      });

      const uniqueAddresses = new Set<string>();
      let chainTransactions = 0;
      let chainTransfers = 0;
      let fromBlock = 0;
      const chainTransferData: any[] = [];

      // Get recent data only (last 30 days worth of blocks)
      const heightQuery: Query = {
        fromBlock: 0,
        logs: [],
        fieldSelection: { block: [BlockField.Number] },
        maxNumBlocks: 1,
      };
      const heightRes = await hs.get(heightQuery);
      const currentBlock = heightRes.nextBlock - 1;
      const startBlock = Math.max(0, currentBlock - chain.blocksPerDay * 30);

      fromBlock = startBlock;

      while (fromBlock < currentBlock) {
        const query: Query = {
          fromBlock,
          toBlock: currentBlock,
          logs: [
            {
              address: [tokenAddress],
              topics: [[TRANSFER_EVENT_SIGNATURE, APPROVAL_EVENT_SIGNATURE]],
            },
          ],
          fieldSelection: {
            log: [
              LogField.BlockNumber,
              LogField.Topic0,
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

        for (const log of response.data.logs) {
          chainTransactions++;

          if (log.topics && log.topics[0] === TRANSFER_EVENT_SIGNATURE) {
            chainTransfers++;

            const from = log.topics[1] ? "0x" + log.topics[1].slice(-40) : "";
            const to = log.topics[2] ? "0x" + log.topics[2].slice(-40) : "";
            let value = "0";

            if (log.data) {
              try {
                value = BigInt(log.data).toString();
              } catch {}
            }

            if (from) {
              uniqueAddresses.add(from);
              allUniqueAddresses.add(from);
            }
            if (to) {
              uniqueAddresses.add(to);
              allUniqueAddresses.add(to);
            }

            const block = response.data.blocks?.find((b) => b.number === log.blockNumber);
            chainTransferData.push({
              from,
              to,
              value,
              timestamp: block?.timestamp || 0,
            });
          }
        }

        fromBlock = response.nextBlock;

        if (response.data.logs.length < 100000) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      const ageInHours =
        chainTransferData.length > 0
          ? Math.floor(
              (chainTransferData[chainTransferData.length - 1].timestamp -
                chainTransferData[0].timestamp) /
                3600
            )
          : 0;

      activityByChain[chain.name] = {
        transactions: chainTransactions,
        transfers: chainTransfers,
        uniqueAddresses: uniqueAddresses.size,
        txPerHour: ageInHours > 0 ? chainTransactions / ageInHours : 0,
      };

      totalTransactions += chainTransactions;
      totalTransfers += chainTransfers;
      totalApprovals += chainTransactions - chainTransfers;
      allTransfers.push(...chainTransferData);
    } catch (err) {
      console.warn(`   ⚠️ Failed to fetch transactions from ${chain.name}`);
    }
  }

  // Calculate activity metrics
  const now = Math.floor(Date.now() / 1000);
  const transfers24h = allTransfers.filter((t) => t.timestamp > now - 86400).length;
  const transfers7d = allTransfers.filter((t) => t.timestamp > now - 604800).length;

  const avgTransfersPerDay =
    allTransfers.length > 0 && allTransfers[0]
      ? allTransfers.length /
        Math.max(
          1,
          (allTransfers[allTransfers.length - 1].timestamp - allTransfers[0].timestamp) /
            86400
        )
      : 0;

  const recentRate = transfers7d / 7;
  const olderTransfers = allTransfers.filter(
    (t) => t.timestamp > now - 2592000 && t.timestamp <= now - 604800
  );
  const olderRate = olderTransfers.length / 23;
  const trendChange = olderRate > 0 ? (recentRate - olderRate) / olderRate : 0;

  let activityTrend: "increasing" | "decreasing" | "stable";
  if (trendChange > 0.2) activityTrend = "increasing";
  else if (trendChange < -0.2) activityTrend = "decreasing";
  else activityTrend = "stable";

  // Calculate holder distribution
  const holderBalances = new Map<string, bigint>();
  allTransfers.forEach((t) => {
    try {
      const value = BigInt(t.value);
      if (t.from !== "0x0000000000000000000000000000000000000000") {
        holderBalances.set(t.from, (holderBalances.get(t.from) || 0n) - value);
      }
      if (t.to !== "0x0000000000000000000000000000000000000000") {
        holderBalances.set(t.to, (holderBalances.get(t.to) || 0n) + value);
      }
    } catch {}
  });

  const positiveBalances = Array.from(holderBalances.entries())
    .filter(([_, balance]) => balance > 0n)
    .sort((a, b) => (b[1] > a[1] ? 1 : -1));

  const totalSupply = positiveBalances.reduce((sum, [_, balance]) => sum + balance, 0n);
  const top10Supply = positiveBalances
    .slice(0, 10)
    .reduce((sum, [_, balance]) => sum + balance, 0n);
  const top10Percentage =
    totalSupply > 0n ? Number((top10Supply * 100n) / totalSupply) : 0;

  let holderConcentration: "high" | "medium" | "low";
  if (top10Percentage > 70) holderConcentration = "high";
  else if (top10Percentage > 40) holderConcentration = "medium";
  else holderConcentration = "low";

  return {
    totalTransactions,
    totalTransfers,
    totalApprovals,
    uniqueAddresses: allUniqueAddresses.size,
    transfers24h,
    transfers7d,
    avgTransfersPerDay,
    activityTrend,
    top10HoldersPercentage: top10Percentage,
    holderConcentration,
    activityByChain,
  };
}

/**
 * Main function: Complete unified analysis
 */
export async function getCompleteTokenAnalysis(
  tokenAddress: string,
  primaryChainId: number
): Promise<CompleteTokenAnalysis> {
  console.log("\n🔍 COMPLETE MULTICHAIN TOKEN ANALYSIS");
  console.log("━".repeat(70));
  console.log(`Token: ${tokenAddress}`);
  console.log(`Primary Chain: ${CHAINS.find((c) => c.id === primaryChainId)?.name || primaryChainId}\n`);

  // Step 1: Creation data
  console.log("📦 Step 1/5: Fetching creation data...");
  const creationData = await fetchCreationData(tokenAddress, primaryChainId);
  console.log(`   ✅ Created at block ${creationData.creationBlock}`);

  // Step 2: ERC20 metadata
  console.log("\n📊 Step 2/5: Fetching ERC20 metadata...");
  const erc20Data = await fetchERC20Data(tokenAddress, primaryChainId);
  console.log(`   ✅ ${erc20Data.name} (${erc20Data.symbol})`);

  // Step 3: DexScreener data (includes ALL chains)
  console.log("\n💰 Step 3/5: Fetching market data from DexScreener...");
  const dexData = await fetchDexScreenerData(tokenAddress);
  if (dexData) {
    console.log(`   ✅ Price: $${dexData.priceUSD.toFixed(6)}`);
    console.log(`   ✅ Liquidity: $${dexData.totalLiquidityUSD.toLocaleString()}`);
    console.log(`   ✅ Found on ${dexData.chains.length} DEX pairs across ${dexData.multiChainPresence} chain(s)`);
  } else {
    console.log(`   ⚠️ No market data found`);
  }

  // Step 4: Transaction data (multichain)
  console.log("\n📈 Step 4/5: Analyzing on-chain activity...");
  const chainIdsWithPairs = dexData
    ? Array.from(
        new Set(
          dexData.chains.map((c: any) => {
            // Map chain names to IDs
            const chainMap: Record<string, number> = {
              ethereum: 1,
              base: 8453,
              polygon: 137,
              optimism: 10,
              arbitrum: 42161,
            };
            return chainMap[c.chainId.toLowerCase()];
          }).filter(Boolean)
        )
      )
    : [primaryChainId];

  const transactionData = await fetchTransactionData(tokenAddress, chainIdsWithPairs);
  console.log(`   ✅ Analyzed ${transactionData.totalTransactions} transactions`);
  console.log(`   ✅ ${transactionData.uniqueAddresses} unique holders`);

  // Step 5: Calculate scores
  console.log("\n🎯 Step 5/5: Calculating scores...");

  // Viral metrics
  const now = Math.floor(Date.now() / 1000);
  const ageInHours = creationData.creationTimestamp
    ? Math.floor((now - creationData.creationTimestamp) / 3600)
    : 0;
  const ageInDays = Math.floor(ageInHours / 24);

  const multiChainPresence = dexData?.multiChainPresence || 1;
  const liquidityScore = dexData?.totalLiquidityUSD || 0;
  const volumeToLiquidityRatio = dexData
    ? dexData.volume24h / Math.max(1, dexData.totalLiquidityUSD)
    : 0;

  const isNewToken = ageInDays < 7;
  const hasStrongVolume = volumeToLiquidityRatio > 0.5;
  const isMultichain = multiChainPresence > 1;
  const hasGoodLiquidity = liquidityScore > 50000;

  // Momentum score
  let momentumScore = 0;
  if (hasStrongVolume) momentumScore += 30;
  else if (volumeToLiquidityRatio > 0.2) momentumScore += 15;

  if (liquidityScore > 500000) momentumScore += 25;
  else if (liquidityScore > 100000) momentumScore += 15;
  else if (liquidityScore > 50000) momentumScore += 10;

  if (dexData) {
    if (dexData.priceChange1h > 5) momentumScore += 10;
    if (dexData.priceChange6h > 10) momentumScore += 10;
  }

  momentumScore += Math.min(15, multiChainPresence * 5);
  if (dexData?.hasMedia) momentumScore += 10;

  // Price stability
  let priceStability = 100;
  if (dexData) {
    const avgChange =
      [
        Math.abs(dexData.priceChange1h),
        Math.abs(dexData.priceChange6h),
        Math.abs(dexData.priceChange24h),
      ].reduce((a, b) => a + b, 0) / 3;
    priceStability = 100 - Math.min(avgChange, 100);
  }

  // Market cap rank
  let marketCapRank = "Unknown";
  const marketCap = dexData?.marketCap || 0;
  if (marketCap < 1_000_000) marketCapRank = "Micro (<$1M)";
  else if (marketCap < 10_000_000) marketCapRank = "Small ($1M-$10M)";
  else if (marketCap < 100_000_000) marketCapRank = "Medium ($10M-$100M)";
  else if (marketCap < 1_000_000_000) marketCapRank = "Large ($100M-$1B)";
  else marketCapRank = "Mega (>$1B)";

  // Risk analysis
  const suspiciousPatterns: string[] = [];
  let riskScore = 0;

  if (transactionData.top10HoldersPercentage > 80) {
    suspiciousPatterns.push("Extreme holder concentration (>80%)");
    riskScore += 30;
  }

  if (transactionData.transfers24h > transactionData.transfers7d * 5) {
    suspiciousPatterns.push("Sudden activity spike detected");
    riskScore += 25;
  }

  if (liquidityScore < 10000) {
    suspiciousPatterns.push("Very low liquidity - high risk");
    riskScore += 20;
  }

  // Overall score
  const activityScore = Math.min(
    100,
    Math.log10(transactionData.avgTransfersPerDay + 1) * 25 +
      Math.log10(transactionData.uniqueAddresses + 1) * 20
  );

  const distributionScore = Math.max(0, 100 - transactionData.top10HoldersPercentage);

  const overallScore = Math.max(
    0,
    (momentumScore + activityScore + distributionScore) / 3 - riskScore / 2
  );

  // Investment signal
  let investmentSignal: "strong_buy" | "buy" | "hold" | "sell" | "avoid";
  if (riskScore > 70) investmentSignal = "avoid";
  else if (overallScore > 75 && momentumScore > 60) investmentSignal = "strong_buy";
  else if (overallScore > 60) investmentSignal = "buy";
  else if (overallScore > 40) investmentSignal = "hold";
  else investmentSignal = "sell";

  console.log(`   ✅ Overall Score: ${overallScore.toFixed(1)}/100`);
  console.log(`   ✅ Investment Signal: ${investmentSignal.toUpperCase()}`);

  // Compile final result
  const result: CompleteTokenAnalysis = {
    address: tokenAddress,
    chainId: primaryChainId,
    chainName: CHAINS.find((c) => c.id === primaryChainId)?.name || "Unknown",
    name: erc20Data.name,
    symbol: erc20Data.symbol,
    decimals: erc20Data.decimals,
    totalSupply: erc20Data.totalSupply,
    creationBlock: creationData.creationBlock,
    creationTimestamp: creationData.creationTimestamp,
    creationTxHash: creationData.creationTxHash,
    deployerAddress: creationData.deployerAddress,
    marketCap: dexData?.marketCap || 0,
    fullyDilutedValuation: dexData?.fullyDilutedValuation || 0,
    priceUSD: dexData?.priceUSD || 0,
    totalLiquidityUSD: dexData?.totalLiquidityUSD || 0,
    volume24h: dexData?.volume24h || 0,
    volume6h: dexData?.volume6h || 0,
    volume1h: dexData?.volume1h || 0,
    priceChange1h: dexData?.priceChange1h || 0,
    priceChange6h: dexData?.priceChange6h || 0,
    priceChange24h: dexData?.priceChange24h || 0,
    imageUrl: dexData?.imageUrl,
    headerImage: dexData?.headerImage,
    websites: dexData?.websites,
    socials: dexData?.socials,
    chains: dexData?.chains || [],
    totalPairs: dexData?.totalPairs || 0,
    primaryDex: dexData?.primaryDex || "Unknown",
    viralMetrics: {
      multiChainPresence,
      liquidityScore,
      volumeToLiquidityRatio,
      priceStability,
      dexDiversity: dexData?.dexDiversity || 1,
      hasMedia: dexData?.hasMedia || false,
      ageInDays,
      ageInHours,
      marketCapRank,
      isNewToken,
      hasStrongVolume,
      isMultichain,
      hasGoodLiquidity,
      momentumScore,
    },
    onChainActivity: {
      totalTransactions: transactionData.totalTransactions,
      totalTransfers: transactionData.totalTransfers,
      totalApprovals: transactionData.totalApprovals,
      uniqueAddresses: transactionData.uniqueAddresses,
      transfers24h: transactionData.transfers24h,
      transfers7d: transactionData.transfers7d,
      avgTransfersPerDay: transactionData.avgTransfersPerDay,
      activityTrend: transactionData.activityTrend,
      top10HoldersPercentage: transactionData.top10HoldersPercentage,
      holderConcentration: transactionData.holderConcentration,
      activityByChain: transactionData.activityByChain,
    },
    riskAnalysis: {
      suspiciousPatterns,
      riskScore,
      overallScore,
      investmentSignal,
    },
  };

  return result;
}

/**
 * Print beautiful formatted output
 */
export function printCompleteAnalysis(analysis: CompleteTokenAnalysis): void {
  console.log("\n" + "═".repeat(70));
  console.log(`📊 COMPLETE TOKEN ANALYSIS: ${analysis.name} (${analysis.symbol})`);
  console.log("═".repeat(70));

  console.log("\n🎯 INVESTMENT SIGNAL: " + analysis.riskAnalysis.investmentSignal.toUpperCase());
  console.log(`📈 Overall Score: ${analysis.riskAnalysis.overallScore.toFixed(1)}/100`);
  console.log(`⚠️  Risk Score: ${analysis.riskAnalysis.riskScore}/100`);

  console.log("\n💰 MARKET DATA:");
  console.table({
    Price: `${analysis.priceUSD.toFixed(8)}`,
    "Market Cap": `${analysis.marketCap.toLocaleString()}`,
    "FDV": `${analysis.fullyDilutedValuation.toLocaleString()}`,
    "Total Liquidity": `${analysis.totalLiquidityUSD.toLocaleString()}`,
    "24h Volume": `${analysis.volume24h.toLocaleString()}`,
    "Vol/Liq Ratio": `${(analysis.viralMetrics.volumeToLiquidityRatio * 100).toFixed(2)}%`,
  });

  console.log("\n💹 PRICE CHANGES:");
  console.table({
    "1 Hour": `${analysis.priceChange1h > 0 ? "+" : ""}${analysis.priceChange1h.toFixed(2)}%`,
    "6 Hours": `${analysis.priceChange6h > 0 ? "+" : ""}${analysis.priceChange6h.toFixed(2)}%`,
    "24 Hours": `${analysis.priceChange24h > 0 ? "+" : ""}${analysis.priceChange24h.toFixed(2)}%`,
  });

  console.log("\n🌐 MULTICHAIN PRESENCE:");
  console.log(`   Found on ${analysis.totalPairs} DEX pairs across ${analysis.viralMetrics.multiChainPresence} chain(s)`);
  console.log(`   Primary DEX: ${analysis.primaryDex}`);
  
  if (analysis.chains.length > 0) {
    console.log("\n   Chains:");
    const chainSummary = analysis.chains.reduce((acc: any, chain) => {
      const key = `${chain.chainId}`;
      if (!acc[key]) {
        acc[key] = { liquidity: 0, volume: 0, pairs: 0 };
      }
      acc[key].liquidity += chain.liquidityUSD;
      acc[key].volume += chain.volume24h;
      acc[key].pairs += 1;
      return acc;
    }, {});

    console.table(
      Object.entries(chainSummary).map(([chain, data]: [string, any]) => ({
        Chain: chain,
        Pairs: data.pairs,
        Liquidity: `${data.liquidity.toLocaleString()}`,
        "24h Vol": `${data.volume.toLocaleString()}`,
      }))
    );
  }

  console.log("\n📈 ON-CHAIN ACTIVITY:");
  console.table({
    "Total Transactions": analysis.onChainActivity.totalTransactions,
    "Transfers": analysis.onChainActivity.totalTransfers,
    "Approvals": analysis.onChainActivity.totalApprovals,
    "Unique Holders": analysis.onChainActivity.uniqueAddresses,
    "24h Transfers": analysis.onChainActivity.transfers24h,
    "7d Transfers": analysis.onChainActivity.transfers7d,
    "Avg/Day": analysis.onChainActivity.avgTransfersPerDay.toFixed(2),
    "Trend": analysis.onChainActivity.activityTrend,
  });

  if (Object.keys(analysis.onChainActivity.activityByChain).length > 1) {
    console.log("\n   Activity by Chain:");
    console.table(analysis.onChainActivity.activityByChain);
  }

  console.log("\n🎯 VIRAL METRICS:");
  console.table({
    "Momentum Score": `${analysis.viralMetrics.momentumScore}/100`,
    "Multi-Chain": analysis.viralMetrics.isMultichain ? "✅ Yes" : "❌ No",
    "New Token (<7d)": analysis.viralMetrics.isNewToken ? "✅ Yes" : "❌ No",
    "Strong Volume": analysis.viralMetrics.hasStrongVolume ? "✅ Yes" : "❌ No",
    "Good Liquidity": analysis.viralMetrics.hasGoodLiquidity ? "✅ Yes" : "❌ No",
    "Has Media": analysis.viralMetrics.hasMedia ? "✅ Yes" : "❌ No",
    "Age": `${analysis.viralMetrics.ageInDays}d (${analysis.viralMetrics.ageInHours}h)`,
    "Market Cap Rank": analysis.viralMetrics.marketCapRank,
  });

  console.log("\n⚖️  HOLDER DISTRIBUTION:");
  console.table({
    "Top 10 Holders": `${analysis.onChainActivity.top10HoldersPercentage.toFixed(1)}%`,
    "Concentration": analysis.onChainActivity.holderConcentration.toUpperCase(),
  });

  if (analysis.riskAnalysis.suspiciousPatterns.length > 0) {
    console.log("\n⚠️  WARNINGS:");
    analysis.riskAnalysis.suspiciousPatterns.forEach((p) =>
      console.log(`   • ${p}`)
    );
  }

  if (analysis.imageUrl || analysis.websites || analysis.socials) {
    console.log("\n🎨 MEDIA & LINKS:");
    if (analysis.imageUrl) {
      console.log(`   Logo: ${analysis.imageUrl}`);
    }
    if (analysis.headerImage) {
      console.log(`   Header: ${analysis.headerImage}`);
    }
    if (analysis.websites && analysis.websites.length > 0) {
      console.log(`   Website: ${analysis.websites[0]}`);
    }
    if (analysis.socials && analysis.socials.length > 0) {
      console.log(`   Socials:`);
      analysis.socials.forEach((s) => console.log(`      ${s.type}: ${s.url}`));
    }
  }

  console.log("\n📝 DEPLOYMENT INFO:");
  console.log(`   Block: ${analysis.creationBlock}`);
  if (analysis.creationTxHash) {
    console.log(`   Tx: ${analysis.creationTxHash}`);
  }
  if (analysis.deployerAddress) {
    console.log(`   Deployer: ${analysis.deployerAddress}`);
  }

  console.log("\n" + "═".repeat(70));
}

/**
 * Batch analyze multiple tokens
 */
export async function batchCompleteAnalysis(
  tokens: Array<{ address: string; chainId: number }>
): Promise<Map<string, CompleteTokenAnalysis>> {
  console.log(`\n🚀 BATCH COMPLETE ANALYSIS`);
  console.log("━".repeat(70));
  console.log(`Analyzing ${tokens.length} tokens\n`);

  const results = new Map<string, CompleteTokenAnalysis>();
  const CONCURRENCY = 2;

  for (let i = 0; i < tokens.length; i += CONCURRENCY) {
    const batch = tokens.slice(i, i + CONCURRENCY);

    const batchResults = await Promise.allSettled(
      batch.map(async (token) => {
        const analysis = await getCompleteTokenAnalysis(token.address, token.chainId);
        return { key: `${token.chainId}-${token.address}`, analysis };
      })
    );

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.set(result.value.key, result.value.analysis);
      } else {
        console.error(`❌ Failed:`, result.reason);
      }
    });

    if (i + CONCURRENCY < tokens.length) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n✅ Batch complete: ${results.size}/${tokens.length} tokens`);

  return results;
}

/**
 * Rank tokens by overall score
 */
export function rankTokens(
  analyses: CompleteTokenAnalysis[]
): CompleteTokenAnalysis[] {
  return analyses
    .filter((a) => a.riskAnalysis.riskScore < 70)
    .sort((a, b) => {
      // Primary: Overall score
      if (b.riskAnalysis.overallScore !== a.riskAnalysis.overallScore) {
        return b.riskAnalysis.overallScore - a.riskAnalysis.overallScore;
      }
      // Secondary: Momentum
      if (b.viralMetrics.momentumScore !== a.viralMetrics.momentumScore) {
        return b.viralMetrics.momentumScore - a.viralMetrics.momentumScore;
      }
      // Tertiary: Liquidity
      return b.totalLiquidityUSD - a.totalLiquidityUSD;
    });
}

// CLI execution
  const args = process.argv.slice(2);
  const tokenAddress = args[0] || "0x00c83aecc790e8a4453e5dd3b0b4b3680501a7a7";
  const chainId = parseInt(args[1]) || 1;

  if (!tokenAddress) {
    console.error("Usage: ts-node unified-multichain-analyzer.ts <tokenAddress> [chainId]");
    console.error("Example: ts-node unified-multichain-analyzer.ts 0x123... 1");
    process.exit(1);
  }

  getCompleteTokenAnalysis(tokenAddress, chainId)
    .then(async (analysis) => {
      printCompleteAnalysis(analysis);

      // Save to file
      const filename = `./complete_analysis_${analysis.symbol}_${Date.now()}.json`;
      await fs.writeFile(filename, JSON.stringify(analysis, null, 2));
      console.log(`\n💾 Full data saved to: ${filename}`);

      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Error:", error);
      process.exit(1);
    });
