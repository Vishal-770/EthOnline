import {
  HypersyncClient,
  LogField,
  BlockField,
} from "@envio-dev/hypersync-client";
import type { Query } from "@envio-dev/hypersync-client";
import { ethers } from "ethers";

import * as dotenv from "dotenv";

dotenv.config();

interface ChainConfig {
  chainId: number;
  name: string;
  hypersyncUrl: string;
  rpcUrl: string;
  blockTime: number;
}

const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  eth: {
    chainId: 1,
    name: "Ethereum",
    hypersyncUrl: "https://eth.hypersync.xyz",
    rpcUrl: process.env.ETH_RPC_URL || "https://eth.llamarpc.com",
    blockTime: 12,
  },
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum",
    hypersyncUrl: "https://arbitrum.hypersync.xyz",
    rpcUrl: process.env.ARB_RPC_URL || "https://arb1.arbitrum.io/rpc",
    blockTime: 0.25,
  },
  base: {
    chainId: 8453,
    name: "Base",
    hypersyncUrl: "https://base.hypersync.xyz",
    rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    blockTime: 2,
  },
  optimism: {
    chainId: 10,
    name: "Optimism",
    hypersyncUrl: "https://optimism.hypersync.xyz",
    rpcUrl: process.env.OP_RPC_URL || "https://mainnet.optimism.io",
    blockTime: 2,
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    hypersyncUrl: "https://polygon.hypersync.xyz",
    rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    blockTime: 2,
  },
  bsc: {
    chainId: 56,
    name: "BSC",
    hypersyncUrl: "https://bsc.hypersync.xyz",
    rpcUrl: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org",
    blockTime: 3,
  },
};

interface WalletData {
  address: string;
  totalBought: bigint;
  totalSold: bigint;
  profit: bigint;
  chain: string;
}

interface OtherToken {
  token: string;
  chain: string;
}

export async function analyzeTokenWalletsMultiChain(tokenAddress: string) {
  const allWallets: WalletData[] = [];
  const otherTokens: Record<string, OtherToken[]> = {};

  for (const [chainKey, chain] of Object.entries(CHAIN_CONFIGS)) {
    const hypersync = HypersyncClient.new({
      url: chain.hypersyncUrl,
      bearerToken: process.env.HYPERSYNC_BEARER_TOKEN || "",
    });
    const provider = new ethers.JsonRpcProvider(chain.rpcUrl, undefined, {
      staticNetwork: ethers.Network.from(chain.chainId),
    });
    const currentBlock = await provider.getBlockNumber();

    const query: Query = {
      fromBlock: 0,
      toBlock: currentBlock,
      logs: [
        {
          address: [tokenAddress],
          topics: [[ethers.id("Transfer(address,address,uint256)")]],
        },
      ],
      fieldSelection: {
        log: [
          LogField.Topic0,
          LogField.Topic1,
          LogField.Topic2,
          LogField.Data,
          LogField.BlockNumber,
        ],
        block: [BlockField.Number, BlockField.Timestamp],
      },
      maxNumLogs: 50000,
    };

    const response = await hypersync.get(query);
    if (!response?.data?.logs) {
      continue;
    }

    const ZERO = "0x0000000000000000000000000000000000000000";
    const wallets: Record<string, WalletData> = {};

    for (const log of response.data.logs) {
      const from = log.topics[1]
        ? "0x" + log.topics[1].slice(-40).toLowerCase()
        : ZERO;
      const to = log.topics[2]
        ? "0x" + log.topics[2].slice(-40).toLowerCase()
        : ZERO;
      const amount = log.data ? BigInt(log.data) : 0n;

      if (from === ZERO && to === ZERO) continue;

      if (!wallets[to])
        wallets[to] = {
          address: to,
          totalBought: 0n,
          totalSold: 0n,
          profit: 0n,
          chain: chainKey,
        };
      wallets[to].totalBought += amount;

      if (!wallets[from])
        wallets[from] = {
          address: from,
          totalBought: 0n,
          totalSold: 0n,
          profit: 0n,
          chain: chainKey,
        };
      wallets[from].totalSold += amount;
    }

    for (const w of Object.values(wallets)) {
      w.profit = w.totalSold - w.totalBought;
      allWallets.push(w);
    }
  }

  const ZERO = "0x0000000000000000000000000000000000000000";

  // Top wallets across all chains (excluding zero address)
  const topWallets = allWallets
    .filter((w) => w.address !== ZERO)
    .sort((a, b) => (b.profit > a.profit ? 1 : b.profit < a.profit ? -1 : 0))
    .slice(0, 5);

  // Get other recent tokens for top wallets

  for (const wallet of topWallets) {
    otherTokens[wallet.address] = [];

    for (const [chainKey, chain] of Object.entries(CHAIN_CONFIGS)) {
      try {
        const provider = new ethers.JsonRpcProvider(chain.rpcUrl, undefined, {
          staticNetwork: ethers.Network.from(chain.chainId),
        });
        const currentBlock = await provider.getBlockNumber();
        const blocksPerDay = Math.floor(86400 / chain.blockTime);

        const hypersync = HypersyncClient.new({
          url: chain.hypersyncUrl,
          bearerToken: process.env.HYPERSYNC_BEARER_TOKEN || "",
        });

        const recentQuery: Query = {
          fromBlock: Math.max(0, currentBlock - blocksPerDay),
          toBlock: currentBlock,
          logs: [
            {
              topics: [
                [ethers.id("Transfer(address,address,uint256)")],
                [],
                [ethers.zeroPadValue(wallet.address, 32)],
              ],
            },
          ],
          fieldSelection: { log: [LogField.Address] },
          maxNumLogs: 1000,
        };

        const recentRes = await hypersync.get(recentQuery);
        if (!recentRes?.data?.logs) continue;

        const uniqueTokens = new Set<string>();
        for (const log of recentRes.data.logs) {
          const token = log.address ? log.address.toLowerCase() : "";
          if (token && token !== tokenAddress.toLowerCase()) {
            uniqueTokens.add(token);
            if (uniqueTokens.size >= 50) break;
          }
        }

        // Add all unique tokens
        uniqueTokens.forEach((token) => {
          const walletTokens = otherTokens[wallet.address];
          if (walletTokens) {
            walletTokens.push({ token, chain: chainKey });
          }
        });

        // Stop if we've reached 50 tokens for this wallet
        const walletTokensList = otherTokens[wallet.address];
        if (walletTokensList && walletTokensList.length >= 50) break;
      } catch (err) {
        // Error fetching tokens
      }
    }
  }

  return { topWallets, otherTokens };
}

(async () => {
  const TOKEN = "0xE0Db8f00c7b3cd24d44e0C7230749D4cBCe6ca95";
  try {
    await analyzeTokenWalletsMultiChain(TOKEN);
  } catch (err) {
    // Error in analysis
  }
})();
