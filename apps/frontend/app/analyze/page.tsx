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
      const apiUrl =
        process.env.NEXT_PUBLIC_ENVIO_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/analyze-wallets/${tokenAddress}`);

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
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-full 2xl:max-w-8xl">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Token Wallet Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Analyze the top wallets holding any ERC-20 token and discover their
            trading patterns
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-6 lg:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-medium text-foreground">
                  Token Contract Address
                </label>
                <Input
                  placeholder="Enter 0x address..."
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="font-mono h-12 text-base w-full"
                />
              </div>
              <Button
                onClick={analyzeToken}
                disabled={loading}
                size="lg"
                className="h-12 px-6 sm:px-8 min-w-[120px] sm:min-w-[140px] w-full sm:w-auto"
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
          <Card className="mb-6 lg:mb-8 border-destructive/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Analysis Failed
                  </h3>
                  <p className="text-muted-foreground text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {analysisData && (
          <div className="space-y-6 lg:space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Users className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs lg:text-sm text-muted-foreground font-medium">
                        Top Wallets
                      </p>
                      <p className="text-xl lg:text-2xl font-bold text-foreground">
                        {analysisData.topWallets.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs lg:text-sm text-muted-foreground font-medium">
                        Profitable Wallets
                      </p>
                      <p className="text-xl lg:text-2xl font-bold text-foreground">
                        {
                          analysisData.topWallets.filter(
                            (w) => parseFloat(w.profit) > 0
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card> */}

              <Card className="hover:shadow-lg transition-shadow sm:col-span-2 xl:col-span-1">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                      <PieChart className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs lg:text-sm text-muted-foreground font-medium">
                        Related Tokens
                      </p>
                      <p className="text-xl lg:text-2xl font-bold text-foreground">
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
              <TabsList className="w-full max-w-full sm:max-w-md grid grid-cols-2">
                <TabsTrigger
                  value="wallets"
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">Wallet Analysis</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tokens"
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">Token Portfolio</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="wallets" className="space-y-4 mt-4 lg:mt-6">
                <Card>
                  <CardHeader className="pb-3 lg:pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                      <Wallet className="w-4 h-4 lg:w-5 lg:h-5" />
                      Wallet Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6">
                    <div className="space-y-3 lg:space-y-4 max-h-[600px] lg:max-h-[800px] overflow-y-auto pr-2">
                      {analysisData.topWallets.map((wallet, index) => (
                        <Card
                          key={wallet.address}
                          className="hover:shadow-md transition-shadow border"
                        >
                          <CardContent className="p-4 lg:p-6">
                            <div className="space-y-3 lg:space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <Badge
                                  variant="secondary"
                                  className="font-mono w-fit"
                                >
                                  #{index + 1}
                                </Badge>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <code className="text-xs sm:text-sm font-mono bg-muted px-2 sm:px-3 py-1.5 rounded-md border flex-1 truncate">
                                    {formatAddress(wallet.address)}
                                  </code>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        copyToClipboard(
                                          wallet.address,
                                          "Address"
                                        )
                                      }
                                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
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
                                      onClick={() => {
                                        const explorerUrl =
                                          process.env
                                            .NEXT_PUBLIC_ETHERSCAN_URL ||
                                          "https://etherscan.io";
                                        window.open(
                                          `${explorerUrl}/address/${wallet.address}`,
                                          "_blank"
                                        );
                                      }}
                                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground font-medium">
                                    Bought
                                  </p>
                                  <p className="font-semibold text-foreground text-sm sm:text-base">
                                    {formatNumber(wallet.totalBought)}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground font-medium">
                                    Sold
                                  </p>
                                  <p className="font-semibold text-foreground text-sm sm:text-base">
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
                                      className={`font-semibold text-sm sm:text-base ${getProfitColor(wallet.profit)}`}
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
                                    className="capitalize font-medium text-xs"
                                  >
                                    {wallet.chain}
                                  </Badge>
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

              <TabsContent value="tokens" className="space-y-4 mt-4 lg:mt-6">
                <Card>
                  <CardHeader className="pb-3 lg:pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                      <Coins className="w-4 h-4 lg:w-5 lg:h-5" />
                      Wallet Token Portfolios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6">
                    <div className="space-y-4 lg:space-y-6 max-h-[600px] lg:max-h-[800px] overflow-y-auto pr-2">
                      {Object.entries(analysisData.otherTokens).map(
                        ([walletAddress, tokens]) => (
                          <Card key={walletAddress} className="border">
                            <CardHeader className="pb-3 lg:pb-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Wallet className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <code className="text-xs sm:text-sm font-mono bg-muted px-2 sm:px-3 py-1.5 rounded-md border flex-1 truncate">
                                    {formatAddress(walletAddress)}
                                  </code>
                                  <Badge
                                    variant="secondary"
                                    className="flex-shrink-0"
                                  >
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
                                  className="flex-shrink-0"
                                >
                                  {copiedAddress === "Wallet" ? (
                                    <Check className="w-3 h-3 mr-2" />
                                  ) : (
                                    <Copy className="w-3 h-3 mr-2" />
                                  )}
                                  <span className="hidden sm:inline">Copy</span>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {tokens.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-3">
                                  {tokens.map((token, index) => (
                                    <div
                                      key={`${token.token}-${index}`}
                                      className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg border"
                                    >
                                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                        <code className="text-xs font-mono text-foreground truncate flex-1">
                                          {formatAddress(token.token)}
                                        </code>
                                      </div>
                                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
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
                                <div className="text-center py-6 lg:py-8 text-muted-foreground">
                                  <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 lg:mb-3 opacity-50" />
                                  <p className="font-medium text-sm lg:text-base">
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
          <Card className="mt-8 lg:mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                <div className="space-y-3 text-center sm:text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                    <span className="text-sm font-semibold text-primary">
                      1
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm lg:text-base">
                    Enter Address
                  </h3>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    Paste any ERC-20 token contract address starting with 0x
                  </p>
                </div>
                <div className="space-y-3 text-center sm:text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                    <span className="text-sm font-semibold text-primary">
                      2
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm lg:text-base">
                    Analyze Wallets
                  </h3>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    System analyzes top wallets and their trading patterns
                  </p>
                </div>
                <div className="space-y-3 text-center sm:text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                    <span className="text-sm font-semibold text-primary">
                      3
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm lg:text-base">
                    View Insights
                  </h3>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    See wallet performance and portfolio composition
                  </p>
                </div>
                <div className="space-y-3 text-center sm:text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                    <span className="text-sm font-semibold text-primary">
                      4
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm lg:text-base">
                    Take Action
                  </h3>
                  <p className="text-xs lg:text-sm text-muted-foreground">
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
