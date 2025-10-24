"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LoaderDemo } from "./Loader";
import { getApiEndpoint } from "@/lib/env";

interface TrendingTokenCardGridProps {
  tokenAddress: string;
  rank?: number;
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

const TrendingTokenCardGrid: React.FC<TrendingTokenCardGridProps> = ({
  tokenAddress,
  rank,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["token-metadata", tokenAddress],
    queryFn: () => fetchTokenMetadata(tokenAddress),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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

  return (
    <Link href={`/token/${tokenAddress}`} className="block w-full group">
      <Card className="relative w-full h-full p-4 border border-border bg-card hover:bg-accent/5 hover:border-primary/20 rounded-lg transition-all duration-150 overflow-hidden">
        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full z-10">
            #{rank}
          </div>
        )}

        {/* Trend Badge */}
        <div
          className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded whitespace-nowrap z-10 ${
            isPositive24h
              ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
          }`}
        >
          {isPositive24h ? "↑" : "↓"} {data.priceChange24h.toFixed(2)}%
        </div>

        <div className="flex flex-col items-center space-y-4 pt-8">
          {/* Token Image */}
          <div className="relative">
            <Image
              src={data.imageUrl || "/image.png"}
              alt={data.name}
              width={64}
              height={64}
              className="rounded-full border-2 border-border"
            />
            {data.viralMetrics?.multiChainPresence > 1 && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-card">
                {data.viralMetrics.multiChainPresence}
              </div>
            )}
          </div>

          {/* Token Name & Symbol */}
          <div className="text-center w-full">
            <h3 className="text-lg font-bold text-foreground truncate">
              {data.name}
            </h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground font-medium bg-muted px-2 py-1 rounded">
                {data.symbol}
              </span>
              <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                {data.viralMetrics.ageInDays}d
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-center w-full py-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground font-medium mb-1">
              PRICE
            </div>
            <div className="text-xl font-bold text-foreground">
              ${formatPrice(data.priceUSD)}
            </div>
          </div>

          {/* Price Changes */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                1H
              </div>
              <div
                className={`text-sm font-bold ${
                  isPositive1h
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive1h ? "+" : ""}
                {data.priceChange1h.toFixed(2)}%
              </div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                6H
              </div>
              <div
                className={`text-sm font-bold ${
                  isPositive6h
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive6h ? "+" : ""}
                {data.priceChange6h.toFixed(2)}%
              </div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                24H
              </div>
              <div
                className={`text-sm font-bold ${
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
          <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-border">
            <div className="text-center">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                MARKET CAP
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatNumber(data.marketCap)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                VOLUME 24H
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatNumber(data.volume24h)}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="text-center">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                LIQUIDITY
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatNumber(data.totalLiquidityUSD)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                DEX
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium inline-block">
                {data.primaryDex}
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="text-xs text-muted-foreground/60 font-mono pt-2 border-t border-border w-full text-center">
            {data.address.slice(0, 8)}...{data.address.slice(-8)}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default TrendingTokenCardGrid;
