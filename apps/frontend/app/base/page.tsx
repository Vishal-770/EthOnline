import QueryProvider from "@/components/QueryClientProvider";
import TrendingTokens from "@/components/TrendingTokens";
import { CHAINS } from "@/lib/chains";
import React from "react";

const BasePage = () => {
  return (
    <QueryProvider>
      <TrendingTokens chain={CHAINS.base} />
    </QueryProvider>
  );
};

export default BasePage;
