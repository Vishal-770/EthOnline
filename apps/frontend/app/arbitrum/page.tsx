import QueryProvider from "@/components/QueryClientProvider";
import TrendingTokens from "@/components/TrendingTokens";
import { CHAINS } from "@/lib/chains";
import React from "react";

const ArbitrumPage = () => {
  return (
    <QueryProvider>
      <TrendingTokens chain={CHAINS.arbitrum} />
    </QueryProvider>
  );
};

export default ArbitrumPage;
