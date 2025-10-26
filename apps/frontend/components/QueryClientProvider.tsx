"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: any }) {
  // ⚡️ Create QueryClient with optimized global cache settings
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Global cache settings
            staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes - garbage collection after 30 minutes
            retry: 2, // Retry failed requests twice
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
            refetchOnWindowFocus: true, // Refetch when window regains focus
            refetchOnReconnect: true, // Refetch when network reconnects
            refetchOnMount: false, // Don't refetch on mount if data is fresh
            // Network mode
            networkMode: "online", // Only fetch when online
          },
          mutations: {
            // Global mutation settings
            retry: 1,
            networkMode: "online",
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
