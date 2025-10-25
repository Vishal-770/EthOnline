import QueryProvider from "@/components/QueryClientProvider";
import TrendingTokens from "@/components/TrendingTokens";
import { CHAINS } from "@/lib/chains";
import React from "react";

const HomePage = () => {
  return (
    <QueryProvider>
      <TrendingTokens chain={CHAINS.ethereum} />
    </QueryProvider>
  );
};

export default HomePage;
