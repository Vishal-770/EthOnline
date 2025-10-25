"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Loader2, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { getEtherscanLink } from "@/lib/env";
import type { ChainConfig } from "@/lib/chains";
import axios from "axios";
import { getApiEndpoint } from "@/lib/env";

interface Transfer {
  from: string;
  to: string;
  amount: string;
  amountFormatted: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  logIndex: number;
}

interface TransactionsListProps {
  tokenAddress: string;
  decimals?: number;
  chain?: ChainConfig;
}

export default function TokenTransactionsList({
  tokenAddress,
  decimals = 18,
  chain,
}: TransactionsListProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextFromBlock, setNextFromBlock] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = async (fromBlock?: number) => {
    setLoading(true);
    setError(null);

    try {
      let data;
      const chainSlug = chain?.slug || "ethereum";

      if (chainSlug !== "ethereum" && chain?.hypersyncUrl) {
        // Use POST endpoint for non-ethereum chains with pagination
        const response = await axios.post("/api/erc20-transfers", {
          tokenAddress,
          decimals,
          fromBlock,
          limit: 10,
          hypersyncUrl: chain.hypersyncUrl,
        });
        data = response.data;
      } else {
        // Use GET endpoint for ethereum with pagination
        const params = new URLSearchParams({
          tokenAddress,
          decimals: decimals.toString(),
          limit: "10",
        });

        if (fromBlock !== undefined) {
          params.append("fromBlock", fromBlock.toString());
        }

        const response = await fetch(`/api/erc20-transfers?${params}`);
        data = await response.json();
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch transactions");
      }

      setTransfers((prev) => [...prev, ...data.data.transfers]);
      setNextFromBlock(data.data.nextFromBlock);
      setHasMore(data.data.nextFromBlock !== null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch transactions"
      );
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [tokenAddress]);

  const loadMore = () => {
    if (nextFromBlock !== null && !loading) {
      fetchTransactions(nextFromBlock);
    }
  };
  function formatAmount(amount: number) {
    if (amount === null || amount === undefined) return "0";

    const num = Number(amount);

    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(3) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(3) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(3) + "K";

    return num.toFixed(3);
  }

  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Transactions
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Latest token transfers on-chain
        </p>
      </div> */}

      {error && (
        <div className="p-4 bg-destructive/10 border-b border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Block
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                From
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                To
              </th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">
                Amount
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Time
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Tx Hash
              </th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No transactions found
                </td>
              </tr>
            )}
            {transfers.map((transfer, index) => (
              <tr
                key={`${transfer.blockNumber}-${transfer.logIndex}-${index}`}
                className="border-b border-border hover:bg-card/50 transition-colors"
              >
                {/* Block */}
                <td className="px-4 py-3 text-foreground font-mono text-blue-500">
                  {transfer.blockNumber.toLocaleString()}
                </td>

                {/* From */}
                <td className="px-4 py-3">
                  <a
                    href={
                      chain
                        ? `${chain.explorerUrl}/address/${transfer.from}`
                        : getEtherscanLink("address", transfer.from)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-500 hover:underline font-mono text-xs flex items-center gap-1"
                  >
                    {formatAddress(transfer.from)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>

                {/* To */}
                <td className="px-4 py-3">
                  <a
                    href={
                      chain
                        ? `${chain.explorerUrl}/address/${transfer.to}`
                        : getEtherscanLink("address", transfer.to)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:underline font-mono text-xs flex items-center gap-1"
                  >
                    {formatAddress(transfer.to)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>

                {/* Amount */}
                <td
                  className={`px-4 py-3 text-right font-mono ${
                    parseFloat(transfer.amount) >= 0
                      ? "text-green-500 font-semibold"
                      : "text-red-500 font-semibold"
                  }`}
                >
                  {formatAmount(parseFloat(transfer.amountFormatted))}
                </td>

                {/* Timestamp */}
                <td className="px-4 py-3 text-xs text-indigo-400">
                  {formatTimestamp(transfer.timestamp)}
                </td>

                {/* Tx Hash */}
                <td className="px-4 py-3">
                  <a
                    href={
                      chain
                        ? `${chain.explorerUrl}/tx/${transfer.transactionHash}`
                        : getEtherscanLink("tx", transfer.transactionHash)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline font-mono text-xs flex items-center gap-1"
                  >
                    {formatAddress(transfer.transactionHash)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="p-4 border-t border-border flex justify-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {!hasMore && transfers.length > 0 && (
        <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
          No more transactions to load
        </div>
      )}
    </div>
  );
}
function formatAmount(amount: number) {
  if (amount === null || amount === undefined) return "0";

  const num = Number(amount);

  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(3) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(3) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(3) + "K";

  return num.toFixed(3);
}
