"use client";

import { PriceChartWidget } from "@/components/PriceChartWidget";
import TokenTransactionsList from "@/components/TokenTransactionsList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface TokenData {
  name: string;
  symbol: string;
  price: number;
  priceChange: number;
  marketCap: string;
  volume24h: string;
  liquidity: string;
  holders: number;
  transactions: number;
  age: string;
}

const mockTokenData: Record<string, TokenData> = {
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0": {
    name: "trust me bro",
    symbol: "TMB",
    price: 0.001799,
    priceChange: 5.23,
    marketCap: "$1.7M",
    volume24h: "$15.5M",
    liquidity: "$316K",
    holders: 9044,
    transactions: 45506,
    age: "7 hours",
  },
  "0x6982508145454Ce325dDbE47a25d4ec3d2311933": {
    name: "Bullseus Maximus",
    symbol: "SOL",
    price: 0.001059,
    priceChange: 9.78,
    marketCap: "$1.0M",
    volume24h: "$2.8M",
    liquidity: "$128K",
    holders: 8046,
    transactions: 30677,
    age: "22 hours",
  },
};

export default function TokenDetailsPage() {
  const params = useParams();
  const tokenAddress = params.tokenAddress as string;
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  useEffect(() => {
    // Simulate fetching token data based on address
    const data =
      mockTokenData[tokenAddress] ||
      mockTokenData["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"];
    setTokenData(data);
  }, [tokenAddress]);

  if (!tokenData) {
    return <div className="text-foreground">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header with Back Button */}

      {/* Main Content */}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 w-full">
        {/* Token Info Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">
              {tokenData.name}
            </h1>
            <span className="text-sm text-muted-foreground bg-card px-3 py-1 rounded">
              {tokenData.symbol}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Address:{" "}
            <code className="bg-card px-2 py-1 rounded font-mono text-xs">
              {tokenAddress}
            </code>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
              Price
            </p>
            <p className="text-2xl font-bold text-foreground">
              ${tokenData.price.toFixed(6)}
            </p>
            <p
              className={`text-xs mt-2 ${tokenData.priceChange >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {tokenData.priceChange >= 0 ? "+" : ""}
              {tokenData.priceChange.toFixed(2)}%
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
              Market Cap
            </p>
            <p className="text-2xl font-bold text-foreground">
              {tokenData.marketCap}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Fully diluted</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
              24H Volume
            </p>
            <p className="text-2xl font-bold text-foreground">
              {tokenData.volume24h}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Trading volume</p>
          </div>
        </div>

        {/* Chart Container */}
        <div
          className="rounded-lg border border-border bg-card p-6 overflow-hidden"
          style={{ height: "500px" }}
        >
          <PriceChartWidget tokenAddress={tokenAddress} />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Liquidity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Liquidity</span>
                <span className="font-semibold text-foreground">
                  {tokenData.liquidity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holders</span>
                <span className="font-semibold text-foreground">
                  {tokenData.holders.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Activity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">24H Transactions</span>
                <span className="font-semibold text-foreground">
                  {tokenData.transactions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age</span>
                <span className="font-semibold text-foreground">
                  {tokenData.age}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <TokenTransactionsList tokenAddress={tokenAddress} decimals={18} />
      </div>
    </div>
  );
}
