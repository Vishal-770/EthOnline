"use client";

import { PriceChartWidget } from "@/components/PriceChartWidget";
import TokenTransactionsList from "@/components/TokenTransactionsList";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Twitter,
  MessageCircle,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Layers,
  BarChart3,
  Clock,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LoaderDemo } from "@/components/Loader";
import { getChainBySlug, type ChainConfig } from "@/lib/chains";

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

// Right Sidebar Component
function TokenSidebar({ tokenData }: { tokenData: TokenMetadata }) {
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  return (
    <div className="w-full space-y-3">
      {/* Buy/Sell Buttons */}
      <Card className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
        <div className="p-3">
          <div className="space-y-2">
            <div className="flex gap-2">
              <button className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-xs shadow-lg hover:shadow-green-500/25 hover:scale-[1.02]">
                <ShoppingCart className="w-3.5 h-3.5" />
                Buy
              </button>
              <button className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-xs shadow-lg hover:shadow-red-500/25 hover:scale-[1.02]">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Sell
              </button>
            </div>
            <div className="text-center">
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 mx-auto px-2 py-1.5 rounded-md hover:bg-accent/50">
                View on DexScreener
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Token Information */}
      <Card className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-500/10 rounded-md">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Token Information
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1.5 px-2.5 bg-accent/30 rounded-md">
              <span className="text-xs text-muted-foreground">Decimals</span>
              <span className="text-xs font-bold text-foreground bg-primary/10 px-1.5 py-0.5 rounded-sm">
                {tokenData.decimals}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-2.5 bg-accent/30 rounded-md">
              <span className="text-xs text-muted-foreground">
                Total Supply
              </span>
              <span className="text-xs font-bold text-foreground bg-primary/10 px-1.5 py-0.5 rounded-sm">
                {formatNumber(tokenData.totalSupply)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-2.5 bg-accent/30 rounded-md">
              <span className="text-xs text-muted-foreground">
                Creation Block
              </span>
              <span className="text-xs font-bold text-foreground bg-primary/10 px-1.5 py-0.5 rounded-sm">
                {tokenData.creationBlock}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-2.5 bg-accent/30 rounded-md">
              <span className="text-xs text-muted-foreground">Age</span>
              <span className="text-xs font-bold text-foreground bg-primary/10 px-1.5 py-0.5 rounded-sm">
                {tokenData.viralMetrics.ageInDays} days
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DEX Presence */}
      <Card className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              DEX Presence
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 px-3 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Total Pairs</span>
              <span className="text-sm font-bold text-foreground bg-primary/10 px-2 py-1 rounded-md">
                {tokenData.totalPairs}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Primary DEX</span>
              <span className="text-sm font-bold text-foreground bg-primary/10 px-2 py-1 rounded-md capitalize">
                {tokenData.primaryDex}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Chains</span>
              <span className="text-sm font-bold text-foreground bg-primary/10 px-2 py-1 rounded-md">
                {tokenData.viralMetrics.multiChainPresence}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">
                DEX Diversity
              </span>
              <span className="text-sm font-bold text-foreground bg-primary/10 px-2 py-1 rounded-md">
                {tokenData.viralMetrics.dexDiversity}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Viral Metrics */}
      <Card className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Viral Metrics
            </h3>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center py-2 px-3 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Liquidity Score
              </span>
              <span className="text-sm font-bold text-foreground bg-primary/10 px-2 py-1 rounded-md">
                {formatCurrency(tokenData.viralMetrics.liquidityScore)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Price Stability
              </span>
              <span className="text-sm font-bold text-foreground bg-primary/10 px-2 py-1 rounded-md">
                {tokenData.viralMetrics.priceStability.toFixed(1)}/100
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center py-2 px-3 bg-accent/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  Has Media
                </div>
                <div className="text-sm font-bold">
                  {tokenData.viralMetrics.hasMedia ? "✅ Yes" : "❌ No"}
                </div>
              </div>
              <div className="text-center py-2 px-3 bg-accent/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  Multi-Chain
                </div>
                <div className="text-sm font-bold">
                  {tokenData.viralMetrics.multiChainPresence > 1
                    ? "✅ Yes"
                    : "❌ No"}
                </div>
              </div>
              <div className="text-center py-2 px-3 bg-accent/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  DEX Diversity
                </div>
                <div className="text-sm font-bold">
                  {tokenData.viralMetrics.dexDiversity}
                </div>
              </div>
              <div className="text-center py-2 px-3 bg-accent/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Age</div>
                <div className="text-sm font-bold">
                  {tokenData.viralMetrics.ageInDays}d
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <BarChart3 className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Performance Metrics
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 px-3 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">6h Volume</span>
              <span className="text-sm font-bold text-foreground bg-primary/10 px-2 py-1 rounded-md">
                {formatCurrency(tokenData.volume6h)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">1h Volume</span>
              <span className="text-sm font-bold text-foreground bg-primary/10 px-2 py-1 rounded-md">
                {formatCurrency(tokenData.volume1h)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">6h Change</span>
              <span
                className={`text-sm font-bold px-2 py-1 rounded-md ${
                  tokenData.priceChange6h >= 0
                    ? "text-green-500 bg-green-500/10"
                    : "text-red-500 bg-red-500/10"
                }`}
              >
                {tokenData.priceChange6h >= 0 ? "+" : ""}
                {tokenData.priceChange6h.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Vol/Liq Ratio
              </span>
              <span className="text-sm font-bold text-foreground bg-primary/10 px-2 py-1 rounded-md">
                {(tokenData.viralMetrics.volumeToLiquidityRatio * 100).toFixed(
                  2
                )}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TokenDetailsPage() {
  const params = useParams();
  const tokenAddress = params.tokenAddress as string;
  const chainSlug = (params.chain as string) || "ethereum";
  const chain = getChainBySlug(chainSlug);

  const [tokenData, setTokenData] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/token-metadata/${tokenAddress}`);

        if (!response.ok) {
          throw new Error("Failed to fetch token metadata");
        }

        const data = await response.json();
        setTokenData(data);
      } catch (err) {
        console.error("Error fetching token metadata:", err);
        setError("Failed to load token data");
      } finally {
        setLoading(false);
      }
    };

    if (tokenAddress) {
      fetchTokenMetadata();
    }
  }, [tokenAddress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-full h-[80vh] flex items-center justify-center">
          <LoaderDemo number={3} />
        </div>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error || "Token not found"}</div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const getSocialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "twitter":
        return <Twitter className="w-4 h-4" />;
      case "telegram":
        return <MessageCircle className="w-4 h-4" />;
      case "discord":
        return <Users className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const backUrl = chainSlug === "ethereum" ? "/" : `/${chainSlug}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Token Image */}
      {tokenData.headerImage && (
        <div className="relative w-full h-32 md:h-48 bg-linear-to-r from-purple-500/20 to-blue-500/20">
          <Image
            src={tokenData.headerImage}
            alt={`${tokenData.name} header`}
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
        {/* Back Button */}
        <div className="py-4 md:py-6">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-accent/50 hover:bg-accent px-3 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {chain?.name || "Ethereum"} Tokens
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
          {/* Left Content - Main content area */}
          <div className="flex-1 min-w-0 lg:max-w-[calc(100%-18rem)] xl:max-w-[calc(100%-20rem)] 2xl:max-w-[calc(100%-22rem)]">
            {/* Token Header Section */}
            <div className="bg-card rounded-xl border border-border p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                {tokenData.imageUrl && (
                  <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-border flex-shrink-0">
                    <Image
                      src={tokenData.imageUrl}
                      alt={tokenData.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-3 flex-wrap">
                    <h1 className="text-2xl md:text-4xl font-bold text-foreground break-words">
                      {tokenData.name}
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm md:text-lg font-semibold text-muted-foreground bg-accent px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-border">
                        {tokenData.symbol}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground bg-primary/10 px-2 py-1 md:px-3 md:py-1.5 rounded-full">
                        {tokenData.viralMetrics.marketCapRank}
                      </span>
                      {chain && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 md:px-3 md:py-1.5 rounded-full">
                          {chain.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono bg-accent/50 px-2 py-1.5 md:px-3 md:py-2 rounded-lg inline-block mb-3 md:mb-4 break-all">
                    {tokenAddress}
                  </p>

                  {/* Social Links */}
                  {(tokenData.websites || tokenData.socials) && (
                    <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                      {tokenData.websites?.map((website, idx) => (
                        <a
                          key={idx}
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors bg-accent/30 px-2 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-accent/50"
                        >
                          <Globe className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                      {tokenData.socials?.map((social, idx) => (
                        <a
                          key={idx}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors bg-accent/30 px-2 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-accent/50"
                        >
                          {getSocialIcon(social.type)}
                          <span className="hidden sm:inline">
                            {social.type}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              {/* Price Card */}
              <div className="bg-card rounded-xl border border-border p-4 md:p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-1.5 md:p-2 bg-blue-500/10 rounded-lg">
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Price
                    </p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <p className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground mb-2 md:mb-3">
                    ${tokenData.priceUSD.toFixed(6)}
                  </p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">1h:</span>
                      <span
                        className={
                          tokenData.priceChange1h >= 0
                            ? "text-green-500 font-semibold"
                            : "text-red-500 font-semibold"
                        }
                      >
                        {tokenData.priceChange1h >= 0 ? "+" : ""}
                        {tokenData.priceChange1h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">24h:</span>
                      <span
                        className={
                          tokenData.priceChange24h >= 0
                            ? "text-green-500 font-semibold"
                            : "text-red-500 font-semibold"
                        }
                      >
                        {tokenData.priceChange24h >= 0 ? "+" : ""}
                        {tokenData.priceChange24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Cap Card */}
              <div className="bg-card rounded-xl border border-border p-4 md:p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-1.5 md:p-2 bg-purple-500/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Market Cap
                    </p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <p className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground mb-2 md:mb-3">
                    {formatCurrency(tokenData.marketCap)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    FDV:{" "}
                    <span className="font-semibold">
                      {formatCurrency(tokenData.fullyDilutedValuation)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Volume Card */}
              <div className="bg-card rounded-xl border border-border p-4 md:p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      24H Volume
                    </p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <p className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground mb-2 md:mb-3">
                    {formatCurrency(tokenData.volume24h)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      6h:{" "}
                      <span className="font-semibold">
                        {formatCurrency(tokenData.volume6h)}
                      </span>
                    </span>
                    <span>
                      1h:{" "}
                      <span className="font-semibold">
                        {formatCurrency(tokenData.volume1h)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Liquidity Card */}
              <div className="bg-card rounded-xl border border-border p-4 md:p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-1.5 md:p-2 bg-orange-500/10 rounded-lg">
                    <Activity className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Liquidity
                    </p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <p className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground mb-2 md:mb-3">
                    {formatCurrency(tokenData.totalLiquidityUSD)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vol/Liq:{" "}
                    <span className="font-semibold">
                      {(
                        tokenData.viralMetrics.volumeToLiquidityRatio * 100
                      ).toFixed(2)}
                      %
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Full Width Chart */}
            <div className="mb-4 md:mb-6">
              <div className="bg-card rounded-xl border border-border p-4 md:p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 md:mb-4">
                  Price Chart
                </h3>
                <div className="h-[300px] md:h-[350px] lg:h-[400px]">
                  <PriceChartWidget tokenAddress={tokenAddress} chain={chain} />
                </div>
              </div>
            </div>

            {/* Trading Pairs & Transactions Tabs */}
            <Card className="bg-card rounded-xl border border-border overflow-hidden">
              <Tabs defaultValue="transactions" className="w-full">
                <div className="border-b border-border bg-accent/30 px-4 md:px-6">
                  <TabsList className="h-auto bg-transparent p-0 space-x-1 w-full overflow-x-auto">
                    <TabsTrigger
                      value="pairs"
                      className="relative rounded-none border-b-2 border-transparent px-4 md:px-6 py-3 md:py-4 font-semibold transition-all hover:bg-accent/50 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none whitespace-nowrap"
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Trading Pairs
                      {tokenData.chains && (
                        <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                          {tokenData.chains.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="transactions"
                      className="relative rounded-none border-b-2 border-transparent px-4 md:px-6 py-3 md:py-4 font-semibold transition-all hover:bg-accent/50 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none whitespace-nowrap"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Recent Transactions
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="pairs" className="p-4 md:p-6 m-0">
                  {tokenData.chains && tokenData.chains.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider py-3 md:py-4 px-2 md:px-4">
                              Chain
                            </th>
                            <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider py-3 md:py-4 px-2 md:px-4">
                              DEX
                            </th>
                            <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider py-3 md:py-4 px-2 md:px-4">
                              Price
                            </th>
                            <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider py-3 md:py-4 px-2 md:px-4">
                              Liquidity
                            </th>
                            <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider py-3 md:py-4 px-2 md:px-4">
                              24h Volume
                            </th>
                            <th className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-3 md:py-4 px-2 md:px-4">
                              View
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {tokenData.chains.map((chain, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-accent/30 transition-colors group"
                            >
                              <td className="py-3 md:py-4 px-2 md:px-4">
                                <span className="text-xs md:text-sm font-semibold capitalize bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-border">
                                  {chain.chainId}
                                </span>
                              </td>
                              <td className="py-3 md:py-4 px-2 md:px-4">
                                <span className="text-xs md:text-sm font-semibold capitalize text-foreground">
                                  {chain.dexId}
                                </span>
                              </td>
                              <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm font-bold text-right text-foreground">
                                ${chain.priceUSD.toFixed(6)}
                              </td>
                              <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm font-bold text-right text-green-500">
                                {formatCurrency(chain.liquidityUSD)}
                              </td>
                              <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm font-bold text-right text-blue-500">
                                {formatCurrency(chain.volume24h)}
                              </td>
                              <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                                <a
                                  href={chain.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center p-1.5 md:p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-all group-hover:scale-110"
                                >
                                  <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 md:py-12">
                      <p className="text-muted-foreground">
                        No trading pairs available
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="transactions" className="p-4 md:p-6 m-0">
                  <TokenTransactionsList
                    tokenAddress={tokenAddress}
                    chain={chain}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Sidebar - Proper two-column layout */}
          <div className="w-full lg:w-64 xl:w-72 2xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto scrollbar-hide">
              <TokenSidebar tokenData={tokenData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
