import QueryProvider from "@/components/QueryClientProvider";
import TrendingTokens from "@/components/TrendingTokens";
import React, { useState } from "react";

const HomePage = () => {
  return (
    <QueryProvider>
      <TrendingTokens />
    </QueryProvider>
  );
};

export default HomePage;
