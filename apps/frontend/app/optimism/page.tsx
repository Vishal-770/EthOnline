import QueryProvider from "@/components/QueryClientProvider";
import TrendingTokens from "@/components/TrendingTokens";
import { CHAINS } from "@/lib/chains";
import React from "react";

const OptimismPage = () => {
  return (
    <QueryProvider>
      <TrendingTokens chain={CHAINS.optimism} />
    </QueryProvider>
  );
};

export default OptimismPage;
