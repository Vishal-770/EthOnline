"use client";
import React, { useEffect, useRef } from "react";
import { env } from "@/lib/env";
import type { ChainConfig } from "@/lib/chains";

const PRICE_CHART_ID = "price-chart-widget-container";

// Map chain slugs to Moralis chain IDs
const getChainIdHex = (chain?: ChainConfig): string => {
  if (!chain) return "0x1"; // Default to Ethereum

  const chainIdMap: Record<number, string> = {
    1: "0x1", // Ethereum
    8453: "0x2105", // Base
    42161: "0xa4b1", // Arbitrum
    137: "0x89", // Polygon
    10: "0xa", // Optimism
  };

  return chainIdMap[chain.id] || "0x1";
};

export const PriceChartWidget = ({
  tokenAddress,
  chain,
}: {
  tokenAddress: string;
  chain?: ChainConfig;
}) => {
  const containerRef = useRef(null);
  const chainIdHex = getChainIdHex(chain);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadWidget = () => {
      if (typeof (window as any).createMyWidget === "function") {
        (window as any).createMyWidget(PRICE_CHART_ID, {
          autoSize: true,
          chainId: chainIdHex,
          tokenAddress: tokenAddress,
          showHoldersChart: true,
          defaultInterval: "1D",
          timeZone:
            Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Etc/UTC",
          theme: "moralis",
          locale: "en",
          showCurrencyToggle: true,
          hideLeftToolbar: false,
          hideTopToolbar: false,
          hideBottomToolbar: false,
        });
      } else {
        console.error("createMyWidget function is not defined.");
      }
    };

    if (!document.getElementById("moralis-chart-widget")) {
      const script = document.createElement("script");
      script.id = "moralis-chart-widget";
      script.src = env.moralisChartUrl;
      script.type = "text/javascript";
      script.async = true;
      script.onload = loadWidget;
      script.onerror = () => {
        console.error("Failed to load the chart widget script.");
      };
      document.body.appendChild(script);
    } else {
      loadWidget();
    }
  }, [tokenAddress, chainIdHex]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        id={PRICE_CHART_ID}
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
