"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LoaderDemo } from "./Loader";

interface TrendingTokenCardProps {
  tokenAddress: string;
  rank?: number;
  viewMode?: "list" | "grid";
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
    `http://localhost:3001/token-metadata/${tokenAddress}`
  );
  return data;
}

const formatNumber = (num: number): string => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const TrendingTokenCard: React.FC<TrendingTokenCardProps> = ({
  tokenAddress,
  rank,
  viewMode = "list",
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["token-metadata", tokenAddress],
    queryFn: () => fetchTokenMetadata(tokenAddress),
  });

  if (isLoading) {
    return (
      <div
        className={`w-full ${
          viewMode === "grid" ? "h-64" : "h-28"
        } flex items-center justify-center bg-card/50 border border-border rounded-lg animate-pulse`}
      >
        <LoaderDemo number={1} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className={`w-full ${
          viewMode === "grid" ? "h-64" : "h-28"
        } flex items-center justify-center bg-card/50 border border-border rounded-lg`}
      >
        <span className="text-destructive text-sm">Failed to load token</span>
      </div>
    );
  }

  const isPositive = data.priceChange24h >= 0;

  // Grid View Layout
  if (viewMode === "grid") {
    return (
      <Link href={`/token/${tokenAddress}`} className="block w-full group">
        <Card className="relative flex flex-col h-full p-5 border border-border bg-card hover:bg-accent/5 hover:border-primary/20 rounded-lg transition-all duration-150">
          {/* Rank Badge */}
          {rank && (
            <div className="absolute top-3 right-3 bg-muted text-muted-foreground text-xs font-semibold px-2 py-1 rounded-md">
              #{rank}
            </div>
          )}

          {/* Token Info */}
          <div className="flex items-start gap-3 mb-4">
            <div className="relative shrink-0">
              <Image
                src={data.imageUrl || "/image.png"}
                alt={data.name}
                width={48}
                height={48}
                className="rounded-full border border-border"
              />
              {data.viralMetrics?.multiChainPresence > 1 && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-card">
                  {data.viralMetrics.multiChainPresence}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-foreground mb-0.5">
                {data.name}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {data.symbol}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-2">
            <div className="text-lg font-bold text-foreground mb-1">
              $
              {data.priceUSD < 0.000001
                ? data.priceUSD.toExponential(2)
                : data.priceUSD.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}
            </div>
            <div
              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                isPositive
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? "↑" : "↓"}
              {Math.abs(data.priceChange24h).toFixed(2)}%
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 mt-auto pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Market Cap</span>
              <span className="font-semibold text-foreground">
                {formatNumber(data.marketCap)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Liquidity</span>
              <span className="font-semibold text-foreground">
                {formatNumber(data.totalLiquidityUSD)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Volume 24h</span>
              <span className="font-semibold text-foreground">
                {formatNumber(data.volume24h)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground">DEX</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                {data.primaryDex}
              </span>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // List View Layout
  return (
    <Link href={`/token/${tokenAddress}`} className="block w-full group">
      <Card className="relative flex items-center gap-4 w-full p-4 border border-border bg-card hover:bg-accent/5 hover:border-primary/20 rounded-lg transition-all duration-150">
        {/* Rank */}
        {rank && (
          <div className="hidden sm:flex items-center justify-center w-8 text-sm font-semibold text-muted-foreground">
            {rank}
          </div>
        )}

        {/* Left: Logo + Name/Symbol */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <Image
              src={data.imageUrl || "/image.png"}
              alt={data.name}
              width={44}
              height={44}
              className="rounded-full border border-border"
            />
            {data.viralMetrics?.multiChainPresence > 1 && (
              <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold px-1 py-0.5 rounded-full border border-card">
                {data.viralMetrics.multiChainPresence}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-foreground">
              {data.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-muted-foreground font-medium">
                {data.symbol}
              </p>
              <span className="text-xs text-muted-foreground/40">•</span>
              <p className="text-xs text-muted-foreground/60 font-mono hidden sm:block">
                {data.address.slice(0, 6)}...{data.address.slice(-4)}
              </p>
            </div>
          </div>
        </div>

        {/* Price & Change */}
        <div className="flex flex-col items-end gap-1 min-w-[120px]">
          <div className="text-sm font-bold text-foreground">
            $
            {data.priceUSD < 0.000001
              ? data.priceUSD.toExponential(2)
              : data.priceUSD.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}
          </div>
          <div
            className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded ${
              isPositive
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {isPositive ? "↑" : "↓"}
            {Math.abs(data.priceChange24h).toFixed(2)}%
          </div>
        </div>

        {/* Market Data - Desktop */}
        <div className="hidden lg:flex items-center gap-6 text-right">
          <div className="flex flex-col items-end min-w-[90px]">
            <span className="text-xs text-muted-foreground mb-0.5">
              Market Cap
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatNumber(data.marketCap)}
            </span>
          </div>
          <div className="flex flex-col items-end min-w-[90px]">
            <span className="text-xs text-muted-foreground mb-0.5">
              Liquidity
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatNumber(data.totalLiquidityUSD)}
            </span>
          </div>
          <div className="flex flex-col items-end min-w-[90px]">
            <span className="text-xs text-muted-foreground mb-0.5">
              Volume 24h
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatNumber(data.volume24h)}
            </span>
          </div>
          <div className="flex flex-col items-end min-w-[70px]">
            <span className="text-xs text-muted-foreground mb-0.5">DEX</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
              {data.primaryDex}
            </span>
          </div>
        </div>

        {/* Mobile: Compact stats */}
        <div className="flex lg:hidden flex-col gap-1 text-right min-w-[85px]">
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatNumber(data.marketCap)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatNumber(data.totalLiquidityUSD)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default TrendingTokenCard;
