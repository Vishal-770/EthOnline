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
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LoaderDemo } from "@/components/Loader";

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

export default function TokenDetailsPage() {
  const params = useParams();
  const tokenAddress = params.tokenAddress as string;
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
      <div className="flex items-center justify-center ">
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Token Image */}
      {tokenData.headerImage && (
        <div className="relative w-full h-48 bg-linear-to-r from-purple-500/20 to-blue-500/20">
          <Image
            src={tokenData.headerImage}
            alt={`${tokenData.name} header`}
            fill
            className="object-cover opacity-50"
          />
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tokens
          </Link>
        </div>

        {/* Token Header Section */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex items-start gap-6">
            {tokenData.imageUrl && (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-border ">
                <Image
                  src={tokenData.imageUrl}
                  alt={tokenData.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-4xl font-bold text-foreground">
                  {tokenData.name}
                </h1>
                <span className="text-lg font-semibold text-muted-foreground bg-accent px-4 py-1.5 rounded-full border border-border">
                  {tokenData.symbol}
                </span>
                <span className="text-xs font-medium text-muted-foreground bg-primary/10 px-3 py-1.5 rounded-full">
                  {tokenData.viralMetrics.marketCapRank}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono bg-accent/50 px-3 py-2 rounded-lg inline-block mb-4 break-all">
                {tokenAddress}
              </p>

              {/* Social Links */}
              {(tokenData.websites || tokenData.socials) && (
                <div className="flex items-center gap-4 flex-wrap">
                  {tokenData.websites?.map((website, idx) => (
                    <a
                      key={idx}
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-accent/30 px-4 py-2 rounded-lg hover:bg-accent/50"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                  {tokenData.socials?.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-accent/30 px-4 py-2 rounded-lg hover:bg-accent/50"
                    >
                      {getSocialIcon(social.type)}
                      {social.type}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Price USD
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-3">
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

          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Market Cap
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-3">
              {formatCurrency(tokenData.marketCap)}
            </p>
            <p className="text-xs text-muted-foreground">
              FDV:{" "}
              <span className="font-semibold">
                {formatCurrency(tokenData.fullyDilutedValuation)}
              </span>
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  24H Volume
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-3">
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

          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Total Liquidity
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-3">
              {formatCurrency(tokenData.totalLiquidityUSD)}
            </p>
            <p className="text-xs text-muted-foreground">
              Vol/Liq Ratio:{" "}
              <span className="font-semibold">
                {(tokenData.viralMetrics.volumeToLiquidityRatio * 100).toFixed(
                  2
                )}
                %
              </span>
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Token Info Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Layers className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Token Information
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">
                    Decimals
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {tokenData.decimals}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">
                    Total Supply
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatNumber(tokenData.totalSupply)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">
                    Creation Block
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {tokenData.creationBlock}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Age</span>
                  <span className="text-sm font-semibold text-foreground">
                    {tokenData.viralMetrics.ageInDays} days
                  </span>
                </div>
              </div>
            </div>

            {/* DEX Presence Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Layers className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  DEX Presence
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">
                    Total Pairs
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {tokenData.totalPairs}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">
                    Primary DEX
                  </span>
                  <span className="text-sm font-semibold text-foreground capitalize">
                    {tokenData.primaryDex}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Chains</span>
                  <span className="text-sm font-semibold text-foreground">
                    {tokenData.viralMetrics.multiChainPresence}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">
                    DEX Diversity
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {tokenData.viralMetrics.dexDiversity}
                  </span>
                </div>
              </div>
            </div>

            {/* Viral Metrics Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Viral Metrics
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">
                    Liquidity Score
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(tokenData.viralMetrics.liquidityScore)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">
                    Price Stability
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {tokenData.viralMetrics.priceStability.toFixed(1)}/100
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">
                    Has Media
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {tokenData.viralMetrics.hasMedia ? "✅ Yes" : "❌ No"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">
                    Multi-Chain
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {tokenData.viralMetrics.multiChainPresence > 1
                      ? "✅ Yes"
                      : "❌ No"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Chart */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-6 h-full">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Price Chart
              </h3>
              <div style={{ height: "600px" }}>
                <PriceChartWidget tokenAddress={tokenAddress} />
              </div>
            </div>
          </div>
        </div>

        {/* Trading Pairs & Transactions Tabs */}
        <Card className="bg-card rounded-xl border border-border overflow-hidden">
          <Tabs defaultValue="pairs" className="w-full">
            <div className="border-b border-border bg-accent/30 px-6">
              <TabsList className="h-auto bg-transparent p-0 space-x-1">
                <TabsTrigger
                  value="pairs"
                  className="relative rounded-none border-b-2 border-transparent px-6 py-4 font-semibold transition-all hover:bg-accent/50 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Trading Pairs Across Chains
                  {tokenData.chains && (
                    <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                      {tokenData.chains.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="transactions"
                  className="relative rounded-none border-b-2 border-transparent px-6 py-4 font-semibold transition-all hover:bg-accent/50 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Recent Transactions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="pairs" className="p-6 m-0">
              {tokenData.chains && tokenData.chains.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider py-4 px-4">
                          Chain
                        </th>
                        <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider py-4 px-4">
                          DEX
                        </th>
                        <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider py-4 px-4">
                          Price
                        </th>
                        <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider py-4 px-4">
                          Liquidity
                        </th>
                        <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider py-4 px-4">
                          24h Volume
                        </th>
                        <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider py-4 px-4">
                          Labels
                        </th>
                        <th className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-4 px-4">
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
                          <td className="py-4 px-4">
                            <span className="text-sm font-semibold capitalize bg-linear-to-r from-blue-500/10 to-purple-500/10 px-3 py-1.5 rounded-full border border-border">
                              {chain.chainId}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-semibold capitalize text-foreground">
                              {chain.dexId}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm font-bold text-right text-foreground">
                            ${chain.priceUSD.toFixed(6)}
                          </td>
                          <td className="py-4 px-4 text-sm font-bold text-right text-green-500">
                            {formatCurrency(chain.liquidityUSD)}
                          </td>
                          <td className="py-4 px-4 text-sm font-bold text-right text-blue-500">
                            {formatCurrency(chain.volume24h)}
                          </td>
                          <td className="py-4 px-4 text-xs text-right">
                            <div className="flex flex-wrap gap-1.5 justify-end">
                              {chain.labels.map((label, i) => (
                                <span
                                  key={i}
                                  className="bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <a
                              href={chain.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-all group-hover:scale-110"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No trading pairs available
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transactions" className="p-6 m-0">
              <TokenTransactionsList
                tokenAddress={tokenAddress}
                decimals={tokenData.decimals}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
