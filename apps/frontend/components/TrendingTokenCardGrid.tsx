"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LoaderDemo } from "./Loader";
import { getApiEndpoint } from "@/lib/env";
import type { ChainConfig } from "@/lib/chains";
import { Copy, Check } from "lucide-react"; // ✅ added

interface TrendingTokenCardGridProps {
  tokenAddress: string;
  rank?: number;
  chain?: ChainConfig;
  trendingScore?: number;
}

interface ChainData {
  chainId: string;
  dexId: string;
  pairAddress: string;
  liquidityUSD: number;
  volume24h: number;
  priceUSD: number;
  labels: string[];
  url: string;
}

interface Social {
  type: string;
  url: string;
}

interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creationBlock: string;
  creationTimestamp?: number;
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
  chains: ChainData[];
  totalPairs: number;
  primaryDex: string;
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
  imageUrl?: string;
  headerImage?: string;
  websites?: string[];
  socials?: Social[];
}

async function fetchTokenMetadata(tokenAddress: string): Promise<TokenMetadata> {
  const { data } = await axios.get(getApiEndpoint(`/token-metadata/${tokenAddress}`));
  return data;
}

const formatNumber = (num: number): string => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPrice = (price: number): string => {
  if (price < 0.000001) return price.toExponential(2);
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

const TrendingTokenCardGrid: React.FC<TrendingTokenCardGridProps> = ({
  tokenAddress,
  rank,
  chain,
  trendingScore,
}) => {
  const [copied, setCopied] = React.useState(false); // ✅ new state

  const handleCopy = () => {
    navigator.clipboard.writeText(data?.address || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["token-metadata", tokenAddress, chain?.slug || "ethereum"],
    queryFn: () => fetchTokenMetadata(tokenAddress),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-card/50 border border-border rounded-lg animate-pulse">
        <LoaderDemo number={1} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-card/50 border border-border rounded-lg">
        <span className="text-destructive text-sm">Failed to load token</span>
      </div>
    );
  }

  const isPositive24h = data.priceChange24h >= 0;
  const isPositive1h = data.priceChange1h >= 0;
  const isPositive6h = data.priceChange6h >= 0;

  const chainSlug = chain?.slug || "ethereum";
  const tokenLink = `/token/${chainSlug}/${tokenAddress}`;

  return (
    <Link href={tokenLink} className="block w-full group">
      <Card className="relative w-full p-3 border border-border bg-card hover:bg-accent/5 hover:border-primary/20 rounded-lg transition-all duration-150 overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-3">
          {rank && (
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="text-[10px] text-muted-foreground font-medium uppercase">
                Rank
              </div>
              <div className="text-sm font-bold text-foreground">#{rank}</div>
            </div>
          )}

          {/* Token Image */}
          <div className="relative shrink-0">
            <Image
              src={data.imageUrl || "/image.png"}
              alt={data.name}
              width={48}
              height={48}
              className="rounded border border-border"
            />
            {data.viralMetrics?.multiChainPresence > 1 && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-card">
                {data.viralMetrics.multiChainPresence}
              </div>
            )}
          </div>

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground truncate">{data.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded">
                {data.symbol}
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                {data.viralMetrics.ageInDays}d
              </span>
            </div>
          </div>

          {/* 24H Change or Trending Score */}
          {trendingScore ? (
            <div className="shrink-0 text-xs font-bold px-2 py-1 rounded bg-linear-to-r from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              🔥 {trendingScore}
            </div>
          ) : (
            <div
              className={`shrink-0 text-xs font-bold px-2 py-1 rounded ${
                isPositive24h
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive24h ? "+" : ""}
              {data.priceChange24h.toFixed(2)}%
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-6 gap-2 py-2 border-t border-border">
          <div className="text-left">
            <div className="text-[10px] text-muted-foreground font-medium mb-0.5 uppercase">Price</div>
            <div className="text-xs font-bold text-foreground">${formatPrice(data.priceUSD)}</div>
          </div>

          <div className="text-left">
            <div className="text-[10px] text-muted-foreground font-medium mb-0.5 uppercase">MCap</div>
            <div className="text-xs font-semibold text-foreground">{formatNumber(data.marketCap)}</div>
          </div>

          <div className="text-left">
            <div className="text-[10px] text-muted-foreground font-medium mb-0.5 uppercase">Vol 24H</div>
            <div className="text-xs font-semibold text-foreground">{formatNumber(data.volume24h)}</div>
          </div>

          <div className="text-left">
            <div className="text-[10px] text-muted-foreground font-medium mb-0.5 uppercase">1H</div>
            <div
              className={`text-xs font-bold ${
                isPositive1h ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive1h ? "+" : ""}
              {data.priceChange1h.toFixed(2)}%
            </div>
          </div>

          <div className="text-left">
            <div className="text-[10px] text-muted-foreground font-medium mb-0.5 uppercase">6H</div>
            <div
              className={`text-xs font-bold ${
                isPositive6h ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive6h ? "+" : ""}
              {data.priceChange6h.toFixed(2)}%
            </div>
          </div>

          <div className="text-left">
            <div className="text-[10px] text-muted-foreground font-medium mb-0.5 uppercase">Liquidity</div>
            <div className="text-xs font-semibold text-foreground">{formatNumber(data.totalLiquidityUSD)}</div>
          </div>
        </div>

        {/* ✅ Bottom Row with Copy */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase">DEX:</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
              {data.primaryDex}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-mono">
            <span>{data.address.slice(0, 6)}...{data.address.slice(-4)}</span>
            <button
              onClick={(e) => {
                e.preventDefault(); // stop link navigation
                handleCopy();
              }}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Copy address"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default TrendingTokenCardGrid;
