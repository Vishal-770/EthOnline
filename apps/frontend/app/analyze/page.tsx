"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderDemo } from "@/components/Loader";
import {
  Search,
  Wallet,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Copy,
  Check,
  Users,
  Coins,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface WalletData {
  address: string;
  totalBought: string;
  totalSold: string;
  profit: string;
  chain: string;
}

interface OtherToken {
  token: string;
  chain: string;
}

interface AnalysisData {
  topWallets: WalletData[];
  otherTokens: Record<string, OtherToken[]>;
}

export default function AnalyzePage() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toFixed(6);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const analyzeToken = async () => {
    if (!tokenAddress.trim()) {
      toast.error("Please enter a token address");
      return;
    }

    if (!tokenAddress.startsWith("0x") || tokenAddress.length !== 42) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const response = await fetch(
        `http://localhost:3001/analyze-wallets/${tokenAddress}`
      );

      if (!response.ok) {
        throw new Error(`Failed to analyze token: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisData(data);
      toast.success("Analysis completed successfully!");
    } catch (err) {
      console.error("Error analyzing token:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze token");
      toast.error("Failed to analyze token");
    } finally {
      setLoading(false);
    }
  };

  const getProfitColor = (profit: string) => {
    const profitNum = parseFloat(profit);
    if (profitNum > 0) return "text-green-600 dark:text-green-400";
    if (profitNum < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const getProfitIcon = (profit: string) => {
    const profitNum = parseFloat(profit);
    if (profitNum > 0) return <TrendingUp className="w-4 h-4" />;
    if (profitNum < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Token Wallet Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Analyze the top wallets holding any ERC-20 token and discover their
            trading patterns
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Token Contract Address
                </label>
                <Input
                  placeholder="Enter 0x address..."
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="font-mono h-12 text-base"
                />
              </div>
              <Button
                onClick={analyzeToken}
                disabled={loading}
                size="lg"
                className="h-12 px-8 min-w-[140px]"
              >
                {loading ? (
                  <>
                    <LoaderDemo number={2} />
                    <span className="ml-2">Analyzing</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-destructive/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-destructive shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Analysis Failed
                  </h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {analysisData && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Top Wallets
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {analysisData.topWallets.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Profitable Wallets
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {
                          analysisData.topWallets.filter(
                            (w) => parseFloat(w.profit) > 0
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                      <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Related Tokens
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {Object.values(analysisData.otherTokens).reduce(
                          (acc, tokens) => acc + tokens.length,
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Analysis Tabs */}
            <Tabs defaultValue="wallets" className="w-full">
              <TabsList className="w-full max-w-md grid grid-cols-2">
                <TabsTrigger
                  value="wallets"
                  className="flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Wallet Analysis
                </TabsTrigger>
                <TabsTrigger value="tokens" className="flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Token Portfolio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="wallets" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Wallet className="w-5 h-5" />
                      Wallet Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisData.topWallets.map((wallet, index) => (
                        <Card
                          key={wallet.address}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="secondary"
                                    className="font-mono"
                                  >
                                    #{index + 1}
                                  </Badge>
                                  <div className="flex items-center gap-2">
                                    <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded-md border">
                                      {formatAddress(wallet.address)}
                                    </code>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          copyToClipboard(
                                            wallet.address,
                                            "Address"
                                          )
                                        }
                                        className="h-8 w-8 p-0"
                                      >
                                        {copiedAddress === "Address" ? (
                                          <Check className="w-3 h-3" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          window.open(
                                            `https://etherscan.io/address/${wallet.address}`,
                                            "_blank"
                                          )
                                        }
                                        className="h-8 w-8 p-0"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground font-medium">
                                      Total Bought
                                    </p>
                                    <p className="font-semibold text-foreground">
                                      {formatNumber(wallet.totalBought)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground font-medium">
                                      Total Sold
                                    </p>
                                    <p className="font-semibold text-foreground">
                                      {formatNumber(wallet.totalSold)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground font-medium">
                                      Net P&L
                                    </p>
                                    <div className="flex items-center gap-1">
                                      {getProfitIcon(wallet.profit)}
                                      <p
                                        className={`font-semibold ${getProfitColor(wallet.profit)}`}
                                      >
                                        {formatNumber(wallet.profit)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground font-medium">
                                      Network
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="capitalize font-medium"
                                    >
                                      {wallet.chain}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tokens" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Coins className="w-5 h-5" />
                      Wallet Token Portfolios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(analysisData.otherTokens).map(
                        ([walletAddress, tokens]) => (
                          <Card key={walletAddress}>
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Wallet className="w-4 h-4 text-muted-foreground" />
                                  <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded-md border">
                                    {formatAddress(walletAddress)}
                                  </code>
                                  <Badge variant="secondary">
                                    {tokens.length} token
                                    {tokens.length !== 1 ? "s" : ""}
                                  </Badge>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(walletAddress, "Wallet")
                                  }
                                >
                                  {copiedAddress === "Wallet" ? (
                                    <Check className="w-3 h-3 mr-2" />
                                  ) : (
                                    <Copy className="w-3 h-3 mr-2" />
                                  )}
                                  Copy
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {tokens.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {tokens.map((token, index) => (
                                    <div
                                      key={`${token.token}-${index}`}
                                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <code className="text-xs font-mono text-foreground">
                                          {formatAddress(token.token)}
                                        </code>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="text-xs capitalize"
                                        >
                                          {token.chain}
                                        </Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            copyToClipboard(
                                              token.token,
                                              "Token"
                                            )
                                          }
                                          className="h-6 w-6 p-0"
                                        >
                                          {copiedAddress === "Token" ? (
                                            <Check className="w-3 h-3" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                  <p className="font-medium">
                                    No other tokens found for this wallet
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Instructions */}
        {!analysisData && !loading && (
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="w-5 h-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      1
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Enter Address
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Paste any ERC-20 token contract address starting with 0x
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      2
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Analyze Wallets
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    System analyzes top wallets and their trading patterns
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      3
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">
                    View Insights
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    See wallet performance and portfolio composition
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      4
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">Take Action</h3>
                  <p className="text-sm text-muted-foreground">
                    Copy addresses or explore further on block explorers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
