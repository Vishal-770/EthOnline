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

interface TrendingTokenCardProps {
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

async function fetchTokenMetadata(
  tokenAddress: string
): Promise<TokenMetadata> {
  const { data } = await axios.get(
    getApiEndpoint(`/token-metadata/${tokenAddress}`)
  );
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

const TrendingTokenCard: React.FC<TrendingTokenCardProps> = ({
  tokenAddress,
  rank,
  chain,
  trendingScore,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["token-metadata", tokenAddress, chain?.slug || "ethereum"],
    queryFn: () => fetchTokenMetadata(tokenAddress),
    staleTime: 10 * 60 * 1000, // Token metadata stays fresh for 10 minutes
    gcTime: 60 * 60 * 1000, // Cache persists for 1 hour
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch on window focus (metadata doesn't change often)
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  if (isLoading) {
    return (
      <div className="w-full h-20 flex items-center justify-center bg-card/50 border border-border rounded-lg animate-pulse">
        <LoaderDemo number={1} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full h-20 flex items-center justify-center bg-card/50 border border-border rounded-lg">
        <span className="text-destructive text-sm">Failed to load token</span>
      </div>
    );
  }

  const isPositive24h = data.priceChange24h >= 0;
  const isPositive1h = data.priceChange1h >= 0;
  const isPositive6h = data.priceChange6h >= 0;

  const chainSlug = chain?.slug || "ethereum";
  const tokenLink = `/token/${chainSlug}/${tokenAddress}`;

  // Debug logging
  console.log('TrendingTokenCard Debug:', {
    tokenAddress,
    chain,
    chainSlug,
    tokenLink
  });

  return (
    <Link href={tokenLink} className="block w-full group">
      <Card className="relative w-full p-3 sm:p-4 border border-border bg-card hover:bg-accent/5 hover:border-primary/20 rounded-lg transition-all duration-150 overflow-hidden">
        {/* Desktop & Tablet Layout */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 lg:gap-4 w-full">
          {/* Rank */}
          {rank && (
            <div className="w-8 text-center shrink-0">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                RANK
              </div>
              <div className="text-sm font-bold text-foreground">#{rank}</div>
            </div>
          )}

          {/* Token Info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <Image
                src={data.imageUrl || "/image.png"}
                alt={data.name}
                width={40}
                height={40}
                className="rounded border border-border"
              />
              {data.viralMetrics?.multiChainPresence > 1 && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-1 py-0.5 rounded-full border-2 border-card">
                  {data.viralMetrics.multiChainPresence}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-foreground truncate">
                  {data.name}
                </h3>
                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded whitespace-nowrap">
                  {data.symbol}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground/60 font-mono">
                  {data.address.slice(0, 6)}...{data.address.slice(-4)}
                </p>
                <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded whitespace-nowrap">
                  {data.viralMetrics.ageInDays}d
                </span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="w-20 sm:w-24 text-right shrink-0">
            <div className="text-xs text-muted-foreground font-medium mb-1">
              PRICE
            </div>
            <div className="text-xs sm:text-sm font-bold text-foreground">
              ${formatPrice(data.priceUSD)}
            </div>
          </div>

          {/* Price Changes */}
          <div className="hidden md:flex gap-2 lg:gap-3 xl:gap-4 shrink-0">
            <div className="w-12 lg:w-14 xl:w-16 text-right">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                1H
              </div>
              <div
                className={`text-xs lg:text-sm font-bold ${
                  isPositive1h
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive1h ? "+" : ""}
                {data.priceChange1h.toFixed(2)}%
              </div>
            </div>
            <div className="w-12 lg:w-14 xl:w-16 text-right">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                6H
              </div>
              <div
                className={`text-xs lg:text-sm font-bold ${
                  isPositive6h
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive6h ? "+" : ""}
                {data.priceChange6h.toFixed(2)}%
              </div>
            </div>
            <div className="w-12 lg:w-14 xl:w-16 text-right">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                24H
              </div>
              <div
                className={`text-xs lg:text-sm font-bold ${
                  isPositive24h
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive24h ? "+" : ""}
                {data.priceChange24h.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Market Data */}
          <div className="hidden lg:flex gap-3 xl:gap-4 2xl:gap-6 shrink-0">
            <div className="w-20 xl:w-24 text-right">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                MARKET CAP
              </div>
              <div className="text-xs xl:text-sm font-semibold text-foreground">
                {formatNumber(data.marketCap)}
              </div>
            </div>

            <div className="w-20 xl:w-24 text-right hidden xl:block">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                VOLUME 24H
              </div>
              <div className="text-xs xl:text-sm font-semibold text-foreground">
                {formatNumber(data.volume24h)}
              </div>
            </div>

            <div className="w-20 xl:w-24 text-right hidden 2xl:block">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                LIQUIDITY
              </div>
              <div className="text-xs xl:text-sm font-semibold text-foreground">
                {formatNumber(data.totalLiquidityUSD)}
              </div>
            </div>
          </div>

          {/* DEX & Additional Info */}
          <div className="hidden xl:flex items-center gap-3 2xl:gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                DEX
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                {data.primaryDex.length > 15
                  ? `${data.primaryDex.substring(0, 10)}...${data.primaryDex.slice(-4)}`
                  : data.primaryDex}
              </span>
            </div>

            <div className="text-right hidden 2xl:block">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                VOL/LIQ
              </div>
              <div className="text-xs xl:text-sm font-semibold text-foreground">
                {data.viralMetrics.volumeToLiquidityRatio.toFixed(2)}
              </div>
            </div>

            <div className="text-right hidden 2xl:block">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                PAIRS
              </div>
              <div className="text-xs xl:text-sm font-semibold text-foreground">
                {data.totalPairs}
              </div>
            </div>
          </div>

          {/* Trend Indicator */}
          <div className="hidden sm:block shrink-0">
            <div className="text-xs text-muted-foreground font-medium mb-1">
              {trendingScore ? "SCORE" : "TREND"}
            </div>
            {trendingScore ? (
              <div className="text-xs font-bold px-2 py-1 rounded whitespace-nowrap bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                🔥 {trendingScore}
              </div>
            ) : (
              <div
                className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                  isPositive24h
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive24h ? "BULLISH" : "BEARISH"}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout - Vertical Card */}
        <div className="sm:hidden space-y-3">
          {/* Top Row: Rank, Token Info, Trend Badge */}
          <div className="flex items-start gap-3">
            {/* Rank */}
            {rank && (
              <div className="text-center shrink-0">
                <div className="text-[10px] text-muted-foreground font-medium mb-0.5">
                  RANK
                </div>
                <div className="text-xs font-bold text-foreground bg-muted px-2 py-1 rounded">
                  #{rank}
                </div>
              </div>
            )}

            {/* Token Info */}
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="relative shrink-0">
                <Image
                  src={data.imageUrl || "/image.png"}
                  alt={data.name}
                  width={36}
                  height={36}
                  className="rounded-full border border-border"
                />
                {data.viralMetrics?.multiChainPresence > 1 && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[9px] font-bold px-1 py-0.5 rounded-full border-2 border-card">
                    {data.viralMetrics.multiChainPresence}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {data.name}
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
                    {data.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[10px] text-muted-foreground/60 font-mono">
                    {data.address.slice(0, 6)}...{data.address.slice(-4)}
                  </p>
                  <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                    {data.viralMetrics.ageInDays}d
                  </span>
                </div>
              </div>
            </div>

            {/* Trend Badge */}
            {trendingScore ? (
              <div className="text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap shrink-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                🔥 {trendingScore}
              </div>
            ) : (
              <div
                className={`text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap shrink-0 ${
                  isPositive24h
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive24h ? "↑" : "↓"} {data.priceChange24h.toFixed(1)}%
              </div>
            )}
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
            <div>
              <div className="text-[10px] text-muted-foreground font-medium mb-0.5">
                PRICE
              </div>
              <div className="text-sm font-bold text-foreground">
                ${formatPrice(data.priceUSD)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground font-medium mb-0.5">
                MARKET CAP
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatNumber(data.marketCap)}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-muted/30 rounded">
              <div className="text-[10px] text-muted-foreground font-medium mb-0.5">
                1H
              </div>
              <div
                className={`text-xs font-bold ${
                  isPositive1h
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive1h ? "+" : ""}
                {data.priceChange1h.toFixed(1)}%
              </div>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <div className="text-[10px] text-muted-foreground font-medium mb-0.5">
                6H
              </div>
              <div
                className={`text-xs font-bold ${
                  isPositive6h
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive6h ? "+" : ""}
                {data.priceChange6h.toFixed(1)}%
              </div>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <div className="text-[10px] text-muted-foreground font-medium mb-0.5">
                VOL 24H
              </div>
              <div className="text-xs font-semibold text-foreground">
                {formatNumber(data.volume24h)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default TrendingTokenCard;
