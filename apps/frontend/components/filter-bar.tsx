"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  Activity,
  Settings,
} from "lucide-react";

interface FilterBarProps {
  timeframe: string;
  setTimeframe: (tf: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
}

export default function FilterBar({
  timeframe,
  setTimeframe,
  sortBy,
  setSortBy,
  filterType,
  setFilterType,
}: FilterBarProps) {
  const timeframes = ["5M", "1H", "6H", "24H"];
  const sortOptions = ["Trending", "Top", "Gainers", "New Pairs"];

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-border bg-card/30">
      {/* Time Period Selector */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="  text-foreground text-xs font-semibold"
        >
          <ChevronDown className="w-4 h-4 mr-1" />
          Last 24 hours
        </Button>
      </div>

      {/* Trending with timeframes */}
      <div className="flex items-center gap-2 pl-2 border-l border-border">
        <Button
          variant="outline"
          size="sm"
          className="  text-foreground text-xs font-semibold"
        >
          <Zap className="w-4 h-4 mr-1" />
          Trending
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full  text-xs">
            ℹ
          </span>
        </Button>

        {timeframes.map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe(tf)}
            className={`text-xs font-semibold ${
              timeframe === tf
                ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                : "bg-card hover:bg-card/80 text-muted-foreground border-border"
            }`}
          >
            {tf}
          </Button>
        ))}
      </div>

      {/* View Options */}
      <div className="flex items-center gap-2 pl-2 border-l border-border">
        <Button
          variant="outline"
          size="sm"
          className="bg-card hover:bg-card/80 text-muted-foreground border-border text-xs font-semibold"
        >
          <Activity className="w-4 h-4 mr-1" />
          Top
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-card hover:bg-card/80 text-muted-foreground border-border text-xs font-semibold"
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Gainers
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-card hover:bg-card/80 text-muted-foreground border-border text-xs font-semibold"
        >
          <Zap className="w-4 h-4 mr-1" />
          New Pairs
        </Button>
      </div>

      {/* Right side controls */}
      <div className="ml-auto flex items-center gap-2 pl-2 border-l border-border">
        <Button
          variant="outline"
          size="sm"
          className="bg-card hover:bg-card/80 text-muted-foreground border-border text-xs font-semibold"
        >
          <Users className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-card hover:bg-card/80 text-muted-foreground border-border text-xs font-semibold"
        >
          <Zap className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-card hover:bg-card/80 text-muted-foreground border-border text-xs font-semibold"
        >
          <Activity className="w-4 h-4" />
        </Button>
      </div>

      {/* Rank and Filters */}
      <div className="w-full flex items-center gap-2 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="bg-card hover:bg-card/80 text-muted-foreground border-border text-xs font-semibold"
        >
          <TrendingDown className="w-4 h-4 mr-1" />
          Rank by: Trending 6H
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-card hover:bg-card/80 text-muted-foreground border-border text-xs font-semibold"
        >
          Filters
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-card hover:bg-card/80 text-muted-foreground border-border text-xs font-semibold"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
