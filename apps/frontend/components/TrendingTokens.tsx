"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import TrendingTokenCard from "./TrendingTokenCard";
import { Button } from "@/components/ui/button";
import { LoaderDemo } from "./Loader";

interface Token {
  address: string;
  firstSeenBlock: number;
  firstSeenTimestamp: number;
}

async function getTokens(): Promise<Token[]> {
  const { data } = await axios.get("http://localhost:3001/token-addresses");
  return data;
}

type ViewMode = "list" | "grid";

const TrendingTokens = () => {
  const {
    data: tokens,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["trending-tokens"],
    queryFn: getTokens,
  });

  const [page, setPage] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const ITEMS_PER_PAGE = viewMode === "grid" ? 10 : 10; // Grid: 2x5, List: 10

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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Trending Tokens
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Discover the hottest tokens in the crypto market
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => {
                setViewMode("list");
                setPage(1);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              List
            </button>
            <button
              onClick={() => {
                setViewMode("grid");
                setPage(1);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              Grid
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {tokens.length}
              </span>{" "}
              Tokens
            </span>
          </div>
          <div className="h-3 w-px bg-border"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalPages}
              </span>
            </span>
          </div>
          <div className="h-3 w-px bg-border hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
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
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedTokens.map((token, index) => (
            <TrendingTokenCard
              key={token.address}
              tokenAddress={token.address}
              rank={startIndex + index + 1}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedTokens.map((token, index) => (
            <TrendingTokenCard
              key={token.address}
              tokenAddress={token.address}
              rank={startIndex + index + 1}
              viewMode="list"
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
