/**
 * Multi-chain configuration
 */

export interface ChainConfig {
  id: number;
  name: string;
  slug: string;
  hypersyncUrl: string;
  explorerUrl: string;
  explorerName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blocksPerDay: number;
  icon?: string;
}

export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 1,
    name: "Ethereum",
    slug: "ethereum",
    hypersyncUrl:
      process.env.NEXT_PUBLIC_HYPERSYNC_ETH || "https://eth.hypersync.xyz",
    explorerUrl:
      process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://etherscan.io",
    explorerName: "Etherscan",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blocksPerDay: 7200, // 12s blocks
  },
  base: {
    id: 8453,
    name: "Base",
    slug: "base",
    hypersyncUrl:
      process.env.NEXT_PUBLIC_HYPERSYNC_BASE || "https://base.hypersync.xyz",
    explorerUrl: process.env.NEXT_PUBLIC_BASESCAN_URL || "https://basescan.org",
    explorerName: "BaseScan",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blocksPerDay: 43200, // 2s blocks
  },
  polygon: {
    id: 137,
    name: "Polygon",
    slug: "polygon",
    hypersyncUrl:
      process.env.NEXT_PUBLIC_HYPERSYNC_POLYGON ||
      "https://polygon.hypersync.xyz",
    explorerUrl:
      process.env.NEXT_PUBLIC_POLYGONSCAN_URL || "https://polygonscan.com",
    explorerName: "PolygonScan",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    blocksPerDay: 43200, // 2s blocks
  },
  arbitrum: {
    id: 42161,
    name: "Arbitrum",
    slug: "arbitrum",
    hypersyncUrl:
      process.env.NEXT_PUBLIC_HYPERSYNC_ARBITRUM ||
      "https://arbitrum.hypersync.xyz",
    explorerUrl: process.env.NEXT_PUBLIC_ARBISCAN_URL || "https://arbiscan.io",
    explorerName: "Arbiscan",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blocksPerDay: 28800, // 3s blocks
  },
  optimism: {
    id: 10,
    name: "Optimism",
    slug: "optimism",
    hypersyncUrl:
      process.env.NEXT_PUBLIC_HYPERSYNC_OPTIMISM ||
      "https://optimism.hypersync.xyz",
    explorerUrl:
      process.env.NEXT_PUBLIC_OPTIMISM_ETHERSCAN_URL ||
      "https://optimistic.etherscan.io",
    explorerName: "Optimism Explorer",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blocksPerDay: 43200, // 2s blocks
  },
} as const;

export const CHAIN_ARRAY = Object.values(CHAINS);

export const getChainBySlug = (slug: string): ChainConfig | undefined => {
  return CHAINS[slug.toLowerCase()];
};

export const getChainById = (id: number): ChainConfig | undefined => {
  return CHAIN_ARRAY.find((chain) => chain.id === id);
};

// Helper function to get explorer link
export const getExplorerLink = (
  chain: ChainConfig,
  type: "tx" | "address" | "token",
  value: string
): string => {
  return `${chain.explorerUrl}/${type}/${value}`;
};
