"use client";
import React, { useEffect, useRef } from "react";
import { env } from "@/lib/env";

const PRICE_CHART_ID = "price-chart-widget-container";

export const PriceChartWidget = ({
  tokenAddress,
}: {
  tokenAddress: string;
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadWidget = () => {
      if (typeof (window as any).createMyWidget === "function") {
        (window as any).createMyWidget(PRICE_CHART_ID, {
          autoSize: true,
          chainId: "0x1",
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
  }, []);

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
