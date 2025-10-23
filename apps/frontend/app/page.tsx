"use client";

import { useState } from "react";

import TokenTable from "@/components/token-table";
import FilterBar from "@/components/filter-bar";
import StatsHeader from "@/components/stats-header";

export default function Home() {
  const [timeframe, setTimeframe] = useState("24H");
  const [sortBy, setSortBy] = useState("trending");
  const [filterType, setFilterType] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      {/* Stats Header */}
      <StatsHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Filter Bar */}
        <FilterBar
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterType={filterType}
          setFilterType={setFilterType}
        />

        {/* Token Table */}
        <TokenTable
          timeframe={timeframe}
          sortBy={sortBy}
          filterType={filterType}
        />
      </div>
    </div>
  );
}
