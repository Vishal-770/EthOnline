"use client";

import { useState } from "react";
import {
  Search,
  TrendingUp,
  Activity,
  Blocks,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  ArrowRight,
  Coins,
  BarChart3,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEtherscanLink } from "@/lib/env";

interface Transfer {
  blockNumber: number;
  timestamp: number;
  transactionHash: string;
  logIndex: number;
  from: string;
  to: string;
  amount: string;
  amountFormatted: string;
}

interface ERC20Response {
  success: boolean;
  data?: {
    tokenAddress: string;
    decimals: number;
    totalVolume: string;
    totalBlocks: number;
    totalTransfers: number;
    validTransfers: number;
    nextBlock: number;
    archiveHeight: number;
    transfers: Transfer[];
  };
  message?: string;
  error?: string;
  availableTokens?: string[];
}

const PRESET_TOKENS = ["USDC", "USDT", "DAI", "WETH", "LINK", "AAVE"];
const TIME_RANGES = [
  { label: "Last 1 minute", value: "1m" },
  { label: "Last 10 minutes", value: "10m" },
  { label: "Last 1 hour", value: "1h" },
  { label: "Last 1 day", value: "1d" },
  { label: "All time", value: "all" },
];

export default function ERC20Dashboard() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ERC20Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("USDC");
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [customDecimals, setCustomDecimals] = useState("18");
  const [timeRange, setTimeRange] = useState("all");
  const [fromBlock, setFromBlock] = useState("0");
  const [toBlock, setToBlock] = useState("");

  const handleQuery = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (useCustomAddress) {
        if (!customTokenAddress) {
          setError("Please enter a token address");
          setLoading(false);
          return;
        }
        params.append("tokenAddress", customTokenAddress);
        params.append("decimals", customDecimals);
      } else {
        params.append("token", tokenInput);
      }

      params.append("timeRange", timeRange);

      if (fromBlock !== "0") {
        params.append("fromBlock", fromBlock);
      }
      if (toBlock) {
        params.append("toBlock", toBlock);
      }

      const res = await fetch(`/api/erc20?${params.toString()}`);
      const data: ERC20Response = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch data");
      } else {
        setResponse(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Hero Header */}
      <div className="w-full border-b border-border bg-linear-to-r from-background via-accent/5 to-background backdrop-blur-sm">
        <div className="w-full px-4 lg:px-6 xl:px-8 py-12">
          <div className="max-w-4xl">
            <Badge className="mb-4" variant="secondary">
              <Zap className="w-3 h-3 mr-1" />
              Powered by HyperSync
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              ERC20 Transfer Tracker
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Track and analyze ERC20 token transfers across Ethereum in
              real-time with lightning-fast indexing
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 lg:px-6 xl:px-8 py-8 space-y-6">
        {/* Query Configuration Card */}
        <Card className="w-full border-border bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              <CardTitle>Query Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure your token query parameters to fetch transfer data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Token Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Coins className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">
                  Token Selection
                </h3>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <input
                    type="radio"
                    checked={!useCustomAddress}
                    onChange={() => setUseCustomAddress(false)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Preset Token
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <input
                    type="radio"
                    checked={useCustomAddress}
                    onChange={() => setUseCustomAddress(true)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Custom Address
                  </span>
                </label>
              </div>

              {!useCustomAddress ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {PRESET_TOKENS.map((token) => (
                    <button
                      key={token}
                      onClick={() => setTokenInput(token)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 font-semibold ${
                        tokenInput === token
                          ? "border-primary bg-primary/10 text-primary scale-105 shadow-md"
                          : "border-border bg-card hover:bg-accent hover:border-primary/50"
                      }`}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <ExternalLink className="w-3 h-3" />
                      Token Address
                    </label>
                    <input
                      type="text"
                      value={customTokenAddress}
                      onChange={(e) => setCustomTokenAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Decimals
                    </label>
                    <input
                      type="number"
                      value={customDecimals}
                      onChange={(e) => setCustomDecimals(e.target.value)}
                      min="0"
                      max="18"
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Time Range Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">
                  Time Range
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {TIME_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    variant={timeRange === range.value ? "default" : "outline"}
                    className={`h-auto py-3 text-sm font-semibold transition-all ${
                      timeRange === range.value ? "shadow-md scale-105" : ""
                    }`}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Block Range */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Blocks className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">
                  Custom Block Range
                </h3>
                <Badge variant="secondary" className="text-xs">
                  Optional
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    From Block
                  </label>
                  <input
                    type="number"
                    value={fromBlock}
                    onChange={(e) => setFromBlock(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    To Block
                  </label>
                  <input
                    type="number"
                    value={toBlock}
                    onChange={(e) => setToBlock(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder="Latest"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleQuery}
              disabled={loading}
              size="lg"
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Querying Transfers...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Query Transfers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {response && response.success && response.data && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border bg-linear-to-br from-blue-500/10 to-cyan-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-lg bg-background/80 backdrop-blur-sm text-blue-500 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Total Volume
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground truncate">
                    {response.data.totalVolume === "0"
                      ? "0"
                      : (
                          Number(response.data.totalVolume) /
                          Math.pow(10, response.data.decimals)
                        ).toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border bg-linear-to-br from-green-500/10 to-emerald-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-lg bg-background/80 backdrop-blur-sm text-green-500 group-hover:scale-110 transition-transform">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Total Transfers
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {response.data.totalTransfers.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border bg-linear-to-br from-purple-500/10 to-pink-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-lg bg-background/80 backdrop-blur-sm text-purple-500 group-hover:scale-110 transition-transform">
                      <Blocks className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Blocks Queried
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {response.data.totalBlocks.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border bg-linear-to-br from-orange-500/10 to-yellow-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-lg bg-background/80 backdrop-blur-sm text-orange-500 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Valid Transfers
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {response.data.validTransfers.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Token Info */}
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <CardTitle>Token Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Token Address
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono text-foreground break-all bg-accent/50 px-3 py-2 rounded-md">
                        {response.data.tokenAddress}
                      </p>
                      <a
                        href={getEtherscanLink(
                          "token",
                          response.data.tokenAddress
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Decimals
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-base font-mono px-4 py-2"
                    >
                      {response.data.decimals}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Archive Height
                    </p>
                    <Badge
                      variant="outline"
                      className="text-base font-mono px-4 py-2"
                    >
                      {response.data.archiveHeight.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Query Result
                    </p>
                    <p className="text-sm text-foreground bg-accent/50 px-3 py-2 rounded-md">
                      {response.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transfers Table */}
            {response.data.transfers.length > 0 && (
              <Card className="border-border bg-card/50 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <CardTitle>Recent Transfers</CardTitle>
                    </div>
                    <Badge variant="secondary">
                      First 50 of {response.data.transfers.length}
                    </Badge>
                  </div>
                  <CardDescription>
                    Latest token transfer transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-accent/30 backdrop-blur-sm sticky top-0 z-10">
                        <tr className="border-b border-border">
                          <th className="px-4 py-4 text-left font-bold text-foreground uppercase tracking-wider text-xs">
                            Block
                          </th>
                          <th className="px-4 py-4 text-left font-bold text-foreground uppercase tracking-wider text-xs">
                            Transaction
                          </th>
                          <th className="px-4 py-4 text-left font-bold text-foreground uppercase tracking-wider text-xs">
                            From
                          </th>
                          <th className="px-4 py-4 text-left font-bold text-foreground uppercase tracking-wider text-xs">
                            To
                          </th>
                          <th className="px-4 py-4 text-right font-bold text-foreground uppercase tracking-wider text-xs">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {response.data.transfers
                          .slice(0, 50)
                          .map((transfer, idx) => (
                            <tr
                              key={idx}
                              className="group hover:bg-accent/50 transition-all duration-200"
                            >
                              <td className="px-4 py-4">
                                <Badge variant="outline" className="font-mono">
                                  {transfer.blockNumber.toLocaleString()}
                                </Badge>
                              </td>
                              <td className="px-4 py-4">
                                <a
                                  href={getEtherscanLink(
                                    "tx",
                                    transfer.transactionHash
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-primary hover:text-primary/80 font-mono text-xs group-hover:underline"
                                >
                                  {transfer.transactionHash.slice(0, 10)}...
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                              <td className="px-4 py-4">
                                <a
                                  href={getEtherscanLink(
                                    "address",
                                    transfer.from
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-primary hover:text-primary/80 font-mono text-xs group-hover:underline"
                                >
                                  {transfer.from.slice(0, 10)}...
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                              <td className="px-4 py-4">
                                <a
                                  href={getEtherscanLink(
                                    "address",
                                    transfer.to
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-primary hover:text-primary/80 font-mono text-xs group-hover:underline"
                                >
                                  {transfer.to.slice(0, 10)}...
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className="font-mono font-semibold text-foreground bg-accent/30 px-3 py-1 rounded-md">
                                  {transfer.amountFormatted}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!response && !loading && (
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-accent/50">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Ready to Track Transfers
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Configure a token and time range above, then click "Query
                    Transfers" to get started
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
