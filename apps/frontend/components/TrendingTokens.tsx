"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import TrendingTokenCard from "./TrendingTokenCard";
import { Button } from "@/components/ui/button";
import { LoaderDemo } from "./Loader";
import { getApiEndpoint } from "@/lib/env";

interface Token {
  address: string;
  firstSeenBlock: number;
  firstSeenTimestamp: number;
}

async function getTokens(): Promise<Token[]> {
  const { data } = await axios.get(getApiEndpoint("/token-addresses"));
  return data;
}

const TrendingTokens = () => {
  const {
    data: tokens,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["trending-tokens"],
    queryFn: getTokens,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const [page, setPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

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
    <div className="w-full max-w-full mx-auto space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-6 sm:h-8 w-1 bg-primary rounded-full"></div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Trending Tokens
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
                Discover the hottest tokens in the crypto market
              </p>
            </div>
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

      {/* Token Display - List Only */}
      <div className="space-y-2 sm:space-y-3">
        {paginatedTokens.map((token, index) => (
          <TrendingTokenCard
            key={token.address}
            tokenAddress={token.address}
            rank={startIndex + index + 1}
          />
        ))}
      </div>

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
