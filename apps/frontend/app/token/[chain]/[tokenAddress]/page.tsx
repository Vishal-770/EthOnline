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
import { CompactTrading } from "@/components/CompactTrading";

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

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center bg-accent/20 rounded-md px-2 py-1">
    <span className="text-[11px] text-muted-foreground">{label}</span>
    <span className="text-[11px] font-semibold text-foreground">{value}</span>
  </div>
);


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
      <div>
        {/* Minimal Key Metrics Section */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Price */}
          <div className="rounded-lg bg-accent/30 p-2 flex flex-col justify-between border border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium uppercase">
                Price
              </span>
              <DollarSign className="w-3 h-3 text-blue-500" />
            </div>
            <div className="text-xs md:text-sm font-semibold text-foreground">
              ${tokenData.priceUSD.toFixed(6)}
            </div>
            <div className="flex justify-between text-[10px]">
              <span
                className={
                  tokenData.priceChange1h >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {tokenData.priceChange1h >= 0 ? "+" : ""}
                {tokenData.priceChange1h.toFixed(2)}%
              </span>
              <span
                className={
                  tokenData.priceChange24h >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {tokenData.priceChange24h >= 0 ? "+" : ""}
                {tokenData.priceChange24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Market Cap */}
          <div className="rounded-lg bg-accent/30 p-2 flex flex-col justify-between border border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium uppercase">
                MCap
              </span>
              <TrendingUp className="w-3 h-3 text-purple-500" />
            </div>
            <div className="text-xs md:text-sm font-semibold text-foreground">
              {formatCurrency(tokenData.marketCap)}
            </div>
            <span className="text-[10px] text-muted-foreground">
              FDV: {formatCurrency(tokenData.fullyDilutedValuation)}
            </span>
          </div>

          {/* Volume */}
          <div className="rounded-lg bg-accent/30 p-2 flex flex-col justify-between border border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium uppercase">
                24H Vol
              </span>
              <BarChart3 className="w-3 h-3 text-green-500" />
            </div>
            <div className="text-xs md:text-sm font-semibold text-foreground">
              {formatCurrency(tokenData.volume24h)}
            </div>
            <div className="text-[10px] text-muted-foreground flex justify-between">
              <span>6h: {formatCurrency(tokenData.volume6h)}</span>
              <span>1h: {formatCurrency(tokenData.volume1h)}</span>
            </div>
          </div>

          {/* Liquidity */}
          <div className="rounded-lg bg-accent/30 p-2 flex flex-col justify-between border border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium uppercase">
                Liquidity
              </span>
              <Activity className="w-3 h-3 text-orange-500" />
            </div>
            <div className="text-xs md:text-sm font-semibold text-foreground">
              {formatCurrency(tokenData.totalLiquidityUSD)}
            </div>
            <span className="text-[10px] text-muted-foreground">
              Vol/Liq:{" "}
              {(tokenData.viralMetrics.volumeToLiquidityRatio * 100).toFixed(2)}
              %
            </span>
          </div>
        </div>
      </div>
      
      {/* Compact Trading Interface */}
      <CompactTrading
        tokenAddress={tokenData.address}
        tokenSymbol={tokenData.symbol}
        tokenDecimals={tokenData.decimals}
        tokenPrice={tokenData.priceUSD}
        tokenName={tokenData.name}
      />

      {/* Token Sidebar */}
{/* Token Sidebar */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  {/* Token Info */}
  <Card className="bg-card border border-border/40 rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <Layers className="w-4 h-4 text-blue-500" />
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
        Token Info
      </h3>
    </div>
    <div className="space-y-1.5 text-[0.9rem]">
      <InfoRow label="Decimals" value={tokenData.decimals} />
      <InfoRow label="Supply" value={formatNumber(tokenData.totalSupply)} />
      <InfoRow label="Block" value={tokenData.creationBlock} />
      <InfoRow label="Age" value={`${tokenData.viralMetrics.ageInDays}d`} />
    </div>
  </Card>

  {/* DEX Presence */}
  <Card className="bg-card border border-border/40 rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <Activity className="w-4 h-4 text-purple-500" />
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
        DEX Presence
      </h3>
    </div>
    <div className="space-y-1.5 text-[0.9rem]">
      <InfoRow label="Pairs" value={tokenData.totalPairs} />
      <InfoRow label="Primary DEX" value={tokenData.primaryDex} />
      <InfoRow label="Chains" value={tokenData.viralMetrics.multiChainPresence} />
      <InfoRow label="Diversity" value={tokenData.viralMetrics.dexDiversity} />
    </div>
  </Card>

  {/* Viral Metrics */}
  <Card className="bg-card border border-border/40 rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <TrendingUp className="w-4 h-4 text-green-500" />
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
        Viral
      </h3>
    </div>
    <div className="space-y-1.5 text-[0.9rem]">
      <InfoRow
        label="Liquidity Score"
        value={formatCurrency(tokenData.viralMetrics.liquidityScore)}
      />
      <InfoRow
        label="Stability"
        value={`${tokenData.viralMetrics.priceStability.toFixed(1)}/100`}
      />
      <InfoRow label="Media" value={tokenData.viralMetrics.hasMedia ? "✅" : "❌"} />
      <InfoRow
        label="Multi-Chain"
        value={tokenData.viralMetrics.multiChainPresence > 1 ? "✅" : "❌"}
      />
    </div>
  </Card>

  {/* Performance */}
  <Card className="bg-card border border-border/40 rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <BarChart3 className="w-4 h-4 text-orange-500" />
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
        Performance
      </h3>
    </div>
    <div className="space-y-1.5 text-[0.9rem]">
      <InfoRow label="Vol (6h)" value={formatCurrency(tokenData.volume6h)} />
      <InfoRow label="Vol (1h)" value={formatCurrency(tokenData.volume1h)} />
      <InfoRow
        label="Change (6h)"
        value={
          <span
            className={`font-bold ${
              tokenData.priceChange6h >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {tokenData.priceChange6h >= 0 ? "+" : ""}
            {tokenData.priceChange6h.toFixed(2)}%
          </span>
        }
      />
      <InfoRow
        label="Vol/Liq"
        value={`${(tokenData.viralMetrics.volumeToLiquidityRatio * 100).toFixed(2)}%`}
      />
    </div>
  </Card>
</div>


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
      <div className="max-w-[1400px] mx-auto px-1 sm:px-4 lg:px-2">
        {/* Back Button */}
        <div className="py-2 md:py-2">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-accent/50 hover:bg-accent px-3 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {chain?.name || "Ethereum"} Tokens
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-1 lg:gap-1">
          {/* Left Content - Main content area */}
          <div className="flex-1 min-w-0 lg:max-w-[calc(100%-18rem)] xl:max-w-[calc(100%-20rem)] 2xl:max-w-[calc(100%-22rem)]">
            {/* Token Header Section */}
            <div className="bg-card rounded-lg p-2 md:p-3 mb-4 border border-border">
              <div className="flex items-center gap-3 md:gap-4">
                {/* Token Image */}
                {tokenData.imageUrl && (
                  <div className="relative w-12 h-12 md:w-12 md:h-12 rounded-xl overflow-hidden border border-border flex-shrink-0">
                    <Image
                      src={tokenData.imageUrl}
                      alt={tokenData.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                {/* Token Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
                      {tokenData.name}
                    </h1>
                    <span className="text-xs font-semibold text-muted-foreground bg-accent px-2 py-0.5 rounded-md border border-border">
                      {tokenData.symbol}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-md">
                      #{tokenData.viralMetrics.marketCapRank}
                    </span>
                    {chain && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {chain.name}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-muted-foreground font-mono bg-accent/30 px-2 py-0.5 rounded-md inline-block mb-1 break-all">
                    {tokenAddress.slice(0, 8)}...{tokenAddress.slice(-6)}
                  </p>

                  {/* Social Links */}
                  {(tokenData.websites || tokenData.socials) && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tokenData.websites?.map((website, idx) => (
                        <a
                          key={idx}
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors bg-accent/20 px-1.5 py-0.5 rounded-md hover:bg-accent/40"
                        >
                          <Globe className="w-3 h-3" />
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                      {tokenData.socials?.map((social, idx) => (
                        <a
                          key={idx}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors bg-accent/20 px-1.5 py-0.5 rounded-md hover:bg-accent/40"
                        >
                          {getSocialIcon(social.type)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full Width Chart */}
            <div className="mb-4 md:mb-6">
              <div className="bg-card rounded-md border border-border p-2 md:p-2">
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
                <div className="border-b border-border bg-accent/30 ">
                  <TabsList className="h-auto bg-transparent p-0 space-x-1 w-full overflow-x-auto">
                    <TabsTrigger
                      value="pairs"
                      className="relative rounded-none border-b-2 border-transparent  py-0 md:py-0 font-semibold transition-all hover:bg-accent/50 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none whitespace-nowrap"
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
                      className="relative rounded-none border-b-2 border-transparent  py-3 md:py-4 font-semibold transition-all hover:bg-accent/50 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none whitespace-nowrap"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Recent Transactions
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="pairs" className="p-0 md:p-0 m-0">
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
