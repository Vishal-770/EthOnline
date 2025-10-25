import QueryProvider from "@/components/QueryClientProvider";
import TrendingEthereumToken from "@/components/TrendingEthereumToken";
import React from "react";

const TrendingPage = () => {
  return (
    <div>
      <QueryProvider>
        <TrendingEthereumToken />
      </QueryProvider>
    </div>
  );
};

export default TrendingPage;
