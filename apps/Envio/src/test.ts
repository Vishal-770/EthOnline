import {
  HypersyncClient,
  LogField,
  BlockField,
} from "@envio-dev/hypersync-client";
import type { Query } from "@envio-dev/hypersync-client";
import { ethers } from "ethers";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
];

// Chain configuration
interface ChainConfig {
  chainId: number;
  hypersyncUrl: string;
  rpcUrl: string;
  name: string;
}

const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  eth: {
    chainId: 1,
    hypersyncUrl: "https://eth.hypersync.xyz",
    rpcUrl: process.env.ETH_RPC_URL || "https://eth.llamarpc.com",
    name: "Ethereum",
  },
  arbitrum: {
    chainId: 42161,
    hypersyncUrl: "https://arbitrum.hypersync.xyz",
    rpcUrl: process.env.ARB_RPC_URL || "https://arb1.arbitrum.io/rpc",
    name: "Arbitrum",
  },
  base: {
    chainId: 8453,
    hypersyncUrl: "https://base.hypersync.xyz",
    rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    name: "Base",
  },
  optimism: {
    chainId: 10,
    hypersyncUrl: "https://optimism.hypersync.xyz",
    rpcUrl: process.env.OP_RPC_URL || "https://mainnet.optimism.io",
    name: "Optimism",
  },
  polygon: {
    chainId: 137,
    hypersyncUrl: "https://polygon.hypersync.xyz",
    rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    name: "Polygon",
  },
  bsc: {
    chainId: 56,
    hypersyncUrl: "https://bsc.hypersync.xyz",
    rpcUrl: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org",
    name: "BSC",
  },
};

interface TokenData {
  address: string;
  chain: string;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;

  creationBlock: string;
  creationTimestamp?: number | undefined;

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

  imageUrl?: string;
  headerImage?: string;
  websites?: string[];
  socials?: Array<{ type: string; url: string }>;
  viralMetrics: {
    multiChainPresence: number;
    liquidityScore: number;
    volumeToLiquidityRatio: number;
    priceStability: number;
    dexDiversity: number;
    hasMedia: boolean;
    ageInDays: number;
    marketCapRank: string;
  };
}

export async function metadata(
  tokenAddress: string,
  chain: string = "eth"
) {
  const chainConfig = CHAIN_CONFIGS[chain.toLowerCase()];
  
  if (!chainConfig) {
    throw new Error(
      `Unsupported chain: ${chain}. Supported chains: ${Object.keys(CHAIN_CONFIGS).join(", ")}`
    );
  }

  console.log(`🔗 Fetching data for ${chainConfig.name} (Chain ID: ${chainConfig.chainId})`);
  console.log(`🔗 HyperSync URL: ${chainConfig.hypersyncUrl}`);

  const hypersyncBearerToken = process.env.HYPERSYNC_BEARER_TOKEN || "";

  const hs = HypersyncClient.new({
    url: chainConfig.hypersyncUrl,
    bearerToken: hypersyncBearerToken,
  });

  console.log("📦 Fetching token creation data...");

  let creationBlock = "Unknown";
  let creationTimestamp: number | undefined = undefined;

  try {
    const query: Query = {
      fromBlock: 0,
      toBlock: 99999999,
      logs: [
        {
          address: [tokenAddress],
        },
      ],
      fieldSelection: {
        log: [LogField.BlockNumber, LogField.Address, LogField.TransactionHash],
        block: [BlockField.Number, BlockField.Timestamp],
      },
      maxNumLogs: 1,
      includeAllBlocks: true,
    };

    const response = await hs.get(query);

    if (
      response?.data?.logs &&
      response.data.logs.length > 0 &&
      response.data.logs[0]
    ) {
      creationBlock =
        response.data.logs[0].blockNumber?.toString() ?? "Unknown";
      if (
        response.data.blocks &&
        response.data.blocks.length > 0 &&
        response.data.blocks[0]
      ) {
        creationTimestamp = response.data.blocks[0].timestamp;
      }
    }
  } catch (err) {
    console.warn("⚠️ Could not fetch creation block:", err);
  }

  console.log(`📊 Fetching token metadata from ${chainConfig.name} RPC...`);

  let name = "Unknown";
  let symbol = "Unknown";
  let decimals = 18;
  let totalSupply = "0";

  try {
    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl, undefined, {
      staticNetwork: ethers.Network.from(chainConfig.chainId),
    });

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const timeout = (ms: number) =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), ms)
      );

    const [nameResult, symbolResult, decimalsResult, totalSupplyResult] =
      (await Promise.race([
        Promise.all([
          contract.name?.() ?? Promise.resolve("Unknown"),
          contract.symbol?.() ?? Promise.resolve("Unknown"),
          contract.decimals?.() ?? Promise.resolve(18n),
          contract.totalSupply?.() ?? Promise.resolve(0n),
        ]),
        timeout(10000),
      ])) as [string, string, bigint, bigint];

    name = nameResult;
    symbol = symbolResult;
    decimals = Number(decimalsResult);
    totalSupply = ethers.formatUnits(totalSupplyResult, decimals);
  } catch (err: any) {
    console.warn(`⚠️ RPC connection failed for ${chainConfig.name}:`, err.message);
    console.warn(`Using fallback values...`);
  }

  console.log("📊 Fetching comprehensive market data from DexScreener...");

  const dexURL = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;

  let tokenData: TokenData = {
    address: tokenAddress,
    chain: chainConfig.name,
    chainId: chainConfig.chainId,
    name,
    symbol,
    decimals,
    totalSupply,
    creationBlock,
    creationTimestamp,
    marketCap: 0,
    fullyDilutedValuation: 0,
    priceUSD: 0,
    totalLiquidityUSD: 0,
    volume24h: 0,
    volume6h: 0,
    volume1h: 0,
    priceChange1h: 0,
    priceChange6h: 0,
    priceChange24h: 0,
    chains: [],
    totalPairs: 0,
    primaryDex: "Unknown",
    viralMetrics: {
      multiChainPresence: 0,
      liquidityScore: 0,
      volumeToLiquidityRatio: 0,
      priceStability: 0,
      dexDiversity: 0,
      hasMedia: false,
      ageInDays: 0,
      marketCapRank: "Unknown",
    },
  };

  try {
    const dexRes = await axios.get(dexURL);
    const data = dexRes.data;

    if (data?.pairs && data.pairs.length > 0) {
      const pairs = data.pairs;
      tokenData.totalPairs = pairs.length;

      // Filter pairs for the specific chain if needed
      const chainPairs = pairs.filter(
        (p: any) => !chain || p.chainId === chain.toLowerCase() || p.chainId === chainConfig.name.toLowerCase()
      );

      const primaryPair = chainPairs.length > 0 ? chainPairs[0] : pairs[0];
      
      tokenData.priceUSD = parseFloat(primaryPair.priceUsd || "0");
      tokenData.marketCap = primaryPair.marketCap || 0;
      tokenData.fullyDilutedValuation = primaryPair.fdv || 0;
      tokenData.primaryDex = primaryPair.dexId;

      // If we got name/symbol from DexScreener and RPC failed, use it
      if (name === "Unknown" && primaryPair.baseToken?.name) {
        tokenData.name = primaryPair.baseToken.name;
      }
      if (symbol === "Unknown" && primaryPair.baseToken?.symbol) {
        tokenData.symbol = primaryPair.baseToken.symbol;
      }

      let totalLiquidity = 0;
      let totalVolume24h = 0;
      let totalVolume6h = 0;
      let totalVolume1h = 0;
      let priceChanges1h: number[] = [];
      let priceChanges6h: number[] = [];
      let priceChanges24h: number[] = [];

      const chainSet = new Set<string>();
      const dexSet = new Set<string>();

      // Process all pairs
      for (const pair of pairs) {
        chainSet.add(pair.chainId);
        dexSet.add(pair.dexId);

        tokenData.chains.push({
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

        if (pair.info?.imageUrl && !tokenData.imageUrl) {
          tokenData.imageUrl = pair.info.imageUrl;
          tokenData.headerImage = pair.info.header;
          tokenData.websites = pair.info.websites?.map((w: any) => w.url || w);
          tokenData.socials = pair.info.socials?.map((s: any) => ({
            type: s.type,
            url: s.url,
          }));
        }
      }

      tokenData.totalLiquidityUSD = totalLiquidity;
      tokenData.volume24h = totalVolume24h;
      tokenData.volume6h = totalVolume6h;
      tokenData.volume1h = totalVolume1h;

      tokenData.priceChange1h =
        priceChanges1h.length > 0
          ? priceChanges1h.reduce((a, b) => a + b, 0) / priceChanges1h.length
          : 0;
      tokenData.priceChange6h =
        priceChanges6h.length > 0
          ? priceChanges6h.reduce((a, b) => a + b, 0) / priceChanges6h.length
          : 0;
      tokenData.priceChange24h =
        priceChanges24h.length > 0
          ? priceChanges24h.reduce((a, b) => a + b, 0) / priceChanges24h.length
          : 0;

      tokenData.viralMetrics.multiChainPresence = chainSet.size;
      tokenData.viralMetrics.liquidityScore = totalLiquidity;
      tokenData.viralMetrics.volumeToLiquidityRatio =
        totalLiquidity > 0 ? totalVolume24h / totalLiquidity : 0;
      tokenData.viralMetrics.dexDiversity = dexSet.size;
      tokenData.viralMetrics.hasMedia = !!(
        tokenData.imageUrl ||
        tokenData.websites?.length ||
        tokenData.socials?.length
      );

      const allPriceChanges = [
        ...priceChanges1h,
        ...priceChanges6h,
        ...priceChanges24h,
      ];
      if (allPriceChanges.length > 0) {
        const avgChange =
          allPriceChanges.reduce((a, b) => a + Math.abs(b), 0) /
          allPriceChanges.length;
        tokenData.viralMetrics.priceStability = 100 - Math.min(avgChange, 100);
      }

      if (tokenData.marketCap < 1_000_000) {
        tokenData.viralMetrics.marketCapRank = "Micro (<$1M)";
      } else if (tokenData.marketCap < 10_000_000) {
        tokenData.viralMetrics.marketCapRank = "Small ($1M-$10M)";
      } else if (tokenData.marketCap < 100_000_000) {
        tokenData.viralMetrics.marketCapRank = "Medium ($10M-$100M)";
      } else if (tokenData.marketCap < 1_000_000_000) {
        tokenData.viralMetrics.marketCapRank = "Large ($100M-$1B)";
      } else {
        tokenData.viralMetrics.marketCapRank = "Mega (>$1B)";
      }

      // Token age
      if (creationTimestamp) {
        const ageInSeconds = Date.now() / 1000 - creationTimestamp;
        tokenData.viralMetrics.ageInDays = Math.floor(ageInSeconds / 86400);
      } else if (primaryPair.pairCreatedAt) {
        const ageInMs = Date.now() - primaryPair.pairCreatedAt;
        tokenData.viralMetrics.ageInDays = Math.floor(ageInMs / 86400000);
      }
    }
  } catch (err) {
    console.warn("⚠️ DexScreener API fetch failed:", err);
  }

  const fs = await import("fs/promises");
  const outputPath = `./token_analysis_${chain}.json`;

  const jsonString = JSON.stringify(
    tokenData,
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  );

  // await fs.writeFile(outputPath, jsonString);

  console.log("\n✅ Comprehensive token data saved to:", outputPath);
  console.log("\n📊 SUMMARY:");
  console.log("━".repeat(60));
  console.table({
    Chain: tokenData.chain,
    Token: `${tokenData.name} (${tokenData.symbol})`,
    Price: `$${tokenData.priceUSD.toFixed(6)}`,
    "Market Cap": `$${tokenData.marketCap.toLocaleString()}`,
    "Total Liquidity": `$${tokenData.totalLiquidityUSD.toLocaleString()}`,
    "24h Volume": `$${tokenData.volume24h.toLocaleString()}`,
    Chains: tokenData.viralMetrics.multiChainPresence,
    DEXs: tokenData.viralMetrics.dexDiversity,
    "Total Pairs": tokenData.totalPairs,
    "Age (days)": tokenData.viralMetrics.ageInDays,
  });

  console.log("\n🎯 VIRAL POTENTIAL INDICATORS:");
  console.log("━".repeat(60));
  console.table({
    "Multi-Chain":
      tokenData.viralMetrics.multiChainPresence > 1 ? "✅ Yes" : "❌ No",
    Liquidity:
      tokenData.viralMetrics.liquidityScore > 100000 ? "✅ Strong" : "⚠️ Weak",
    "Volume/Liquidity": `${(tokenData.viralMetrics.volumeToLiquidityRatio * 100).toFixed(2)}%`,
    "Has Media": tokenData.viralMetrics.hasMedia ? "✅ Yes" : "❌ No",
    "Market Cap Rank": tokenData.viralMetrics.marketCapRank,
    "Price Stability": `${tokenData.viralMetrics.priceStability.toFixed(1)}/100`,
  });

  console.log("\n💰 PRICE CHANGES:");
  console.table({
    "1 Hour": `${tokenData.priceChange1h.toFixed(2)}%`,
    "6 Hours": `${tokenData.priceChange6h.toFixed(2)}%`,
    "24 Hours": `${tokenData.priceChange24h.toFixed(2)}%`,
  });

  return tokenData;
}

// Example usage for different chains:
// metadata("0x00c83aecc790e8a4453e5dd3b0b4b3680501a7a7", "eth")
// metadata("0x25118290e6A5f4139381D072181157035864099d", "arbitrum")
// metadata("0x...", "base")
// metadata("0x...", "optimism")
// metadata("0x...", "polygon")
// metadata("0x...", "bsc")