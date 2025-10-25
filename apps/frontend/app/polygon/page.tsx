import QueryProvider from "@/components/QueryClientProvider";
import TrendingTokens from "@/components/TrendingTokens";
import { CHAINS } from "@/lib/chains";
import React from "react";

const PolygonPage = () => {
  return (
    <QueryProvider>
      <TrendingTokens chain={CHAINS.polygon} />
    </QueryProvider>
  );
};

export default PolygonPage;
