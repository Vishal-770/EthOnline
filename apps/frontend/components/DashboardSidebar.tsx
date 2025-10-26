"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoaderDemo } from "@/components/Loader";
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  PieChart,
  BarChart3,
} from "lucide-react";

interface DashboardData {
  totalTokensTracked: number;
  activeAlerts: Array<{
    symbol: string;
    alertType: string;
    confidence: number;
  }>;
  topPerformers: Array<{
    symbol: string;
    address: string;
    apy: number;
    riskScore: number;
  }>;
  riskHeatmap: Array<{
    symbol: string;
    risk: number;
    yield: number;
  }>;
}

export function DashboardSidebar() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_DASHBOARD_API_URL || "http://localhost:4007";
      const response = await fetch(`${apiUrl}/api/dashboard-data`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      console.error("Dashboard data error:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-80 border-r border-border bg-card p-6 flex flex-col items-center justify-center">
        <LoaderDemo number={3} />
        <p className="text-sm text-muted-foreground mt-4">
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Analytics</h2>
            <p className="text-sm text-muted-foreground">Real-time insights</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pb-6">
        {error ? (
          <Card className="p-4 border-destructive">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </Card>
        ) : (
          <>
            {/* Market Overview */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Market Overview
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tokens Tracked:</span>
                  <span className="font-medium">
                    {data?.totalTokensTracked || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Alerts:</span>
                  <span className="font-medium">
                    {data?.activeAlerts?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top Performers:</span>
                  <span className="font-medium">
                    {data?.topPerformers?.length || 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* Recent Alerts */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Recent Alerts
              </h3>
              <div className="space-y-2">
                {data?.activeAlerts?.map((alert, index) => (
                  <div
                    key={index}
                    className="p-2 rounded bg-secondary/20 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{alert.symbol}</span>
                      <Badge
                        variant={
                          alert.alertType === "BUY"
                            ? "default"
                            : alert.alertType === "WATCH"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {alert.alertType}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      Confidence: {alert.confidence}%
                    </div>
                  </div>
                )) || (
                  <div className="text-xs text-muted-foreground p-2 text-center">
                    No recent alerts
                  </div>
                )}
              </div>
            </Card>

            {/* Top Performers */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Top Performers
              </h3>
              <div className="space-y-2">
                {data?.topPerformers?.map((token, index) => (
                  <div
                    key={index}
                    className="p-2 rounded bg-secondary/20 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{token.symbol}</span>
                      <div className="text-green-600 font-medium">
                        {token.apy.toFixed(1)}% APY
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      Risk Score: {token.riskScore}/100
                    </div>
                  </div>
                )) || (
                  <div className="text-xs text-muted-foreground p-2 text-center">
                    No performance data
                  </div>
                )}
              </div>
            </Card>

            {/* Risk Analysis */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Risk Analysis
              </h3>
              <div className="space-y-2">
                {data?.riskHeatmap?.map((token, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-medium">{token.symbol}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          token.risk < 30
                            ? "bg-green-500"
                            : token.risk < 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <span className="text-muted-foreground">
                        {token.risk}/100
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className="text-xs text-muted-foreground p-2 text-center">
                    No risk data available
                  </div>
                )}
              </div>
            </Card>

            {/* Status */}
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-muted-foreground">
                  Live data stream active
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
