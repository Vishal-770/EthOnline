"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import TrendingTokenCard from "./TrendingTokenCard";
import TrendingTokenCardGrid from "./TrendingTokenCardGrid";
import { Button } from "@/components/ui/button";
import { LoaderDemo } from "./Loader";
import { getApiEndpoint } from "@/lib/env";
import { LayoutGrid, List } from "lucide-react";
import type { ChainConfig } from "@/lib/chains";

interface Token {
  address: string;
  firstSeenBlock: number;
  firstSeenTimestamp: number;
  chainId?: number;
  chainName?: string;
}

interface TrendingTokensProps {
  chain?: ChainConfig;
}

async function getTokens(chainSlug?: string): Promise<Token[]> {
  if (chainSlug && chainSlug !== "ethereum") {
    // For non-ethereum chains, use POST endpoint with hypersync URL
    const { data } = await axios.post(getApiEndpoint("/token-addresses"), {
      hypersyncurl: getHypersyncUrl(chainSlug),
      days: 365,
    });
    return data;
  }
  // For ethereum, use the default GET endpoint
  const { data } = await axios.get(getApiEndpoint("/token-addresses"));
  return data;
}

function getHypersyncUrl(chainSlug: string): string {
  const urls: Record<string, string> = {
    base:
      process.env.NEXT_PUBLIC_HYPERSYNC_BASE || "https://base.hypersync.xyz",
    polygon:
      process.env.NEXT_PUBLIC_HYPERSYNC_POLYGON ||
      "https://polygon.hypersync.xyz",
    arbitrum:
      process.env.NEXT_PUBLIC_HYPERSYNC_ARBITRUM ||
      "https://arbitrum.hypersync.xyz",
    optimism:
      process.env.NEXT_PUBLIC_HYPERSYNC_OPTIMISM ||
      "https://optimism.hypersync.xyz",
    ethereum:
      process.env.NEXT_PUBLIC_HYPERSYNC_ETH || "https://eth.hypersync.xyz",
  };
  return urls[chainSlug] || urls.ethereum;
}

const TrendingTokens: React.FC<TrendingTokensProps> = ({ chain }) => {
  const {
    data: tokens,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["trending-tokens", chain?.slug || "ethereum"],
    queryFn: () => getTokens(chain?.slug),
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache persists for 30 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data is fresh
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  const [page, setPage] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  const ITEMS_PER_PAGE = viewMode === "grid" ? 9 : 10;

  if (isLoading)
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <LoaderDemo number={3} />
        <p className="text-muted-foreground text-sm animate-pulse">
          Loading trending tokens...
        </p>
      </div>
    );

  if (isError || !tokens)
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="text-destructive text-6xl">⚠️</div>
        <p className="text-destructive font-semibold text-lg">
          Failed to load tokens
        </p>
        <p className="text-muted-foreground text-sm">
          Please try again later or check your connection.
        </p>
      </div>
    );

  // Pagination logic
  const totalPages = Math.ceil(tokens.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedTokens = tokens.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode);
    setPage(1); // Reset to first page when changing view mode
  };

  return (
    <div className="w-full max-w-full mx-auto space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-6 sm:h-8 w-1 bg-primary rounded-full"></div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {chain ? `${chain.name} ` : ""} Tokens
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
                Discover the hottest tokens on {chain?.name || "Ethereum"}
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("list")}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">List</span>
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("grid")}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-card border border-border rounded-lg text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                {tokens.length}
              </span>{" "}
              Tokens
            </span>
          </div>
          <div className="h-3 w-px bg-border"></div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span>{" "}
              /{" "}
              <span className="font-semibold text-foreground">
                {totalPages}
              </span>
            </span>
          </div>
          <div className="h-3 w-px bg-border hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            <span className="text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {startIndex + 1}
              </span>
              -
              <span className="font-semibold text-foreground">
                {Math.min(startIndex + ITEMS_PER_PAGE, tokens.length)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Token Display - List or Grid */}
      {viewMode === "list" ? (
        <div className="space-y-2 sm:space-y-3">
          {paginatedTokens.map((token, index) => (
            <TrendingTokenCard
              key={token.address}
              tokenAddress={token.address}
              rank={startIndex + index + 1}
              chain={chain}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {paginatedTokens.map((token, index) => (
            <TrendingTokenCardGrid
              key={token.address}
              tokenAddress={token.address}
              rank={startIndex + index + 1}
              chain={chain}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border border-border rounded-lg">
        <Button
          variant="outline"
          size="default"
          onClick={handlePrev}
          disabled={page === 1}
          className="w-full sm:w-auto min-w-[110px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </Button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNum)}
                className="w-9 h-9 text-sm"
              >
                {pageNum}
              </Button>
            );
          })}
          {totalPages > 5 && page < totalPages - 2 && (
            <>
              <span className="text-muted-foreground px-1">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages)}
                className="w-9 h-9 text-sm"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="default"
          onClick={handleNext}
          disabled={page === totalPages}
          className="w-full sm:w-auto min-w-[110px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default TrendingTokens;
