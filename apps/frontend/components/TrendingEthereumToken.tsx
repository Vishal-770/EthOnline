"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import TrendingTokenCard from "./TrendingTokenCard";
import TrendingTokenCardGrid from "./TrendingTokenCardGrid";
import { Button } from "@/components/ui/button";
import { LoaderDemo } from "./Loader";
import { LayoutGrid, List } from "lucide-react";
import { CHAINS } from "@/lib/chains";

interface TrendingToken {
  address: string;
  trendingscore: number;
  rank: number;
  block?: number;
  timestamp?: number;
}

async function fetchTrendingEthereumTokens(): Promise<TrendingToken[]> {
  const apiUrl =
    process.env.NEXT_PUBLIC_OFFCHAIN_API_URL || "http://localhost:3002";
  const { data } = await axios.get(`${apiUrl}/top-tokens`);
  return data;
}

const TrendingEthereumToken = () => {
  const {
    data: tokens,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["trending-ethereum-tokens"],
    queryFn: fetchTrendingEthereumTokens,
    staleTime: 3 * 60 * 1000, // Data stays fresh for 3 minutes (trending data changes more frequently)
    gcTime: 15 * 60 * 1000, // Cache persists for 15 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when window regains focus (trending data should be current)
    refetchOnMount: false, // Don't refetch on component mount if data is fresh
    refetchOnReconnect: true, // Refetch when network reconnects
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes for trending data
  });

  const [page, setPage] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  const ITEMS_PER_PAGE = viewMode === "grid" ? 9 : 10;

  if (isLoading)
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <LoaderDemo number={3} />
        <p className="text-muted-foreground text-sm animate-pulse">
          Loading trending Ethereum tokens...
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
                🔥 Trending Ethereum Tokens
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
                Top performing tokens ranked by trending score
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => handleViewModeChange("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => handleViewModeChange("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-card border border-border rounded-lg text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                {tokens.length}
              </span>{" "}
              Tokens
            </span>
          </div>
          <div className="h-3 w-px bg-border"></div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalPages}
              </span>
            </span>
          </div>
          <div className="h-3 w-px bg-border hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2">
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

      {/* Token Display */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {paginatedTokens.map((token) => (
            <TrendingTokenCard
              key={token.address}
              tokenAddress={token.address}
              rank={token.rank}
              chain={CHAINS.ethereum}
              trendingScore={token.trendingscore}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedTokens.map((token) => (
            <TrendingTokenCardGrid
              key={token.address}
              tokenAddress={token.address}
              rank={token.rank}
              chain={CHAINS.ethereum}
              trendingScore={token.trendingscore}
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

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
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

export default TrendingEthereumToken;
