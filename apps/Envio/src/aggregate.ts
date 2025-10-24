import "dotenv/config";
import fs from "fs";

export interface Transaction {
  blockNumber: number;
  timestamp: number;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  eventType: string;
  eventData: {
    from: string;
    to: string;
    value: string;
  };
}

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  marketCap: number;
  priceUSD: number;
  totalLiquidityUSD: number;
  volume24h: number;
  volume6h: number;
  volume1h: number;
  priceChange1h: number;
  priceChange6h: number;
  priceChange24h: number;
  viralMetrics: {
    multiChainPresence: number;
    liquidityScore: number;
    volumeToLiquidityRatio: number;
    priceStability: number;
    dexDiversity: number;
    hasMedia: boolean;
    ageInDays: number;
    marketCapRank: string;
  };
  chains: Array<{
    chainId: string;
    dexId: string;
    pairAddress: string;
    liquidityUSD: number;
    volume24h: number;
    priceUSD: number;
  }>;
}

export interface OnChainMetrics {
  totalTransactions: number;
  uniqueAddresses: number;
  avgTransactionValue: number;
  medianTransactionValue: number;

  totalVolume: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;

  txPerDay: number;
  txPerHour: number;
  activeAddressesPerDay: number;

  whaleTransactions: number;
  whaleVolume: number;
  largestTransaction: number;
  top10HoldersVolume: number;

  holderConcentration: number;
  giniCoefficient: number;

  buyVsSellRatio: number;
  avgBuySize: number;
  avgSellSize: number;

  peakActivityHour: number;
  mostActiveDay: string;
  recentActivityTrend: "increasing" | "decreasing" | "stable";

  suspiciousPatterns: string[];
  riskScore: number;

  liquidityHealthScore: number;
  activityScore: number;
  distributionScore: number;
  momentumScore: number;
}

export interface CombinedAnalysis {
  token: {
    address: string;
    name: string;
    symbol: string;
  };
  timestamp: string;

  onChainMetrics: OnChainMetrics;

  marketData: {
    priceUSD: number;
    marketCap: number;
    liquidityUSD: number;
    volume24h: number;
    priceChange24h: number;
  };

  overallScore: number;
  investmentSignal: "strong_buy" | "buy" | "hold" | "sell" | "avoid";
  riskLevel: "low" | "medium" | "high" | "extreme";
  confidence: number; // 0-1

  keyFindings: string[];
  warnings: string[];
  opportunities: string[];
}

class OnChainAggregator {
  private transactions: Transaction[] = [];
  private tokenData: TokenData | null = null;

  addTransactions(txs: Transaction[]): void {
    this.transactions = txs.sort((a, b) => a.timestamp - b.timestamp);
  }

  addTokenData(data: TokenData): void {
    this.tokenData = data;
  }

  analyzeOnChain(): OnChainMetrics {
    console.log(
      `📊 Analyzing ${this.transactions.length} on-chain transactions...`
    );

    const now = Math.floor(Date.now() / 1000);
    const day = 86400;
    const hour = 3600;

    const txValues = this.transactions
      .map((tx) => {
        if (!tx.eventData?.value) return 0;
        const value = parseFloat(tx.eventData.value) / Math.pow(10, 18);
        return isNaN(value) ? 0 : value;
      })
      .filter((v) => v > 0);

    const last24h = this.transactions.filter((tx) => tx.timestamp > now - day);
    const last7d = this.transactions.filter(
      (tx) => tx.timestamp > now - 7 * day
    );
    const last30d = this.transactions.filter(
      (tx) => tx.timestamp > now - 30 * day
    );

    const totalVolume = txValues.reduce((sum, v) => sum + v, 0);
    const volume24h = this.calculateVolume(last24h);
    const volume7d = this.calculateVolume(last7d);
    const volume30d = this.calculateVolume(last30d);

    const uniqueAddresses = this.getUniqueAddresses();

    const avgTxValue = txValues.length > 0 ? totalVolume / txValues.length : 0;
    const medianTxValue = this.calculateMedian(txValues);

    const whaleThreshold = Math.max(totalVolume * 0.01, 10000);
    const whaleTransactions = txValues.filter((v) => v > whaleThreshold).length;
    const whaleVolume = txValues
      .filter((v) => v > whaleThreshold)
      .reduce((sum, v) => sum + v, 0);
    const largestTransaction = Math.max(...txValues, 0);

    const firstTxTimestamp = this.transactions[0]?.timestamp || now;
    const txPerDay =
      this.transactions.length / Math.max(1, (now - firstTxTimestamp) / day);
    const txPerHour = last24h.length / 24;
    const activeAddressesPerDay = this.getActiveAddressesPerDay(last24h);

    const { buyVsSellRatio, avgBuySize, avgSellSize } =
      this.analyzeBuySellPressure();

    const { holderConcentration, giniCoefficient, top10HoldersVolume } =
      this.analyzeDistribution();

    const { peakActivityHour, mostActiveDay } = this.analyzeTimePatterns();
    const recentActivityTrend = this.detectTrend(last7d, last30d);

    const { suspiciousPatterns, riskScore } = this.detectRisks();

    const liquidityHealthScore = this.calculateLiquidityHealth();
    const activityScore = this.calculateActivityScore(
      txPerDay,
      uniqueAddresses
    );
    const distributionScore =
      this.calculateDistributionScore(holderConcentration);
    const momentumScore = this.calculateMomentum(volume24h, volume7d);

    return {
      totalTransactions: this.transactions.length,
      uniqueAddresses,
      avgTransactionValue: avgTxValue,
      medianTransactionValue: medianTxValue,
      totalVolume,
      volume24h,
      volume7d,
      volume30d,
      txPerDay,
      txPerHour,
      activeAddressesPerDay,
      whaleTransactions,
      whaleVolume,
      largestTransaction,
      top10HoldersVolume,
      holderConcentration,
      giniCoefficient,
      buyVsSellRatio,
      avgBuySize,
      avgSellSize,
      peakActivityHour,
      mostActiveDay,
      recentActivityTrend,
      suspiciousPatterns,
      riskScore,
      liquidityHealthScore,
      activityScore,
      distributionScore,
      momentumScore,
    };
  }

  private calculateVolume(txs: Transaction[]): number {
    return txs.reduce((sum, tx) => {
      if (!tx.eventData?.value) return sum;
      const value = parseFloat(tx.eventData.value) / Math.pow(10, 18);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }

  private getUniqueAddresses(): number {
    const addresses = new Set<string>();
    this.transactions.forEach((tx) => {
      if (tx.eventData?.from) {
        addresses.add(tx.eventData.from.toLowerCase());
      }
      if (tx.eventData?.to) {
        addresses.add(tx.eventData.to.toLowerCase());
      }
    });
    addresses.delete("0x0000000000000000000000000000000000000000");
    return addresses.size;
  }

  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      const val1 = sorted[mid - 1];
      const val2 = sorted[mid];
      if (val1 === undefined || val2 === undefined) return 0;
      return (val1 + val2) / 2;
    }
    return sorted[mid] ?? 0;
  }

  private analyzeBuySellPressure(): {
    buyVsSellRatio: number;
    avgBuySize: number;
    avgSellSize: number;
  } {
    let buyVolume = 0,
      sellVolume = 0,
      buyCount = 0,
      sellCount = 0;

    this.transactions.forEach((tx) => {
      if (!tx.eventData?.value || !tx.eventData?.from || !tx.eventData?.to)
        return;

      const value = parseFloat(tx.eventData.value) / Math.pow(10, 18);
      if (isNaN(value) || value <= 0) return;

      const from = tx.eventData.from.toLowerCase();
      const to = tx.eventData.to.toLowerCase();

      const isDexAddress = (addr: string) =>
        addr.includes("uniswap") ||
        addr.includes("sushiswap") ||
        addr.includes("pancakeswap") ||
        addr.length < 42;

      if (from === "0x0000000000000000000000000000000000000000") {
        buyVolume += value;
        buyCount++;
      } else if (isDexAddress(to)) {
        sellVolume += value;
        sellCount++;
      } else if (isDexAddress(from)) {
        buyVolume += value;
        buyCount++;
      }
    });

    return {
      buyVsSellRatio:
        sellVolume > 0 ? buyVolume / sellVolume : buyVolume > 0 ? 999 : 1,
      avgBuySize: buyCount > 0 ? buyVolume / buyCount : 0,
      avgSellSize: sellCount > 0 ? sellVolume / sellCount : 0,
    };
  }

  private analyzeDistribution(): {
    holderConcentration: number;
    giniCoefficient: number;
    top10HoldersVolume: number;
  } {
    const holdings = new Map<string, number>();

    this.transactions.forEach((tx) => {
      if (!tx.eventData?.from || !tx.eventData?.to || !tx.eventData?.value)
        return;

      const from = tx.eventData.from.toLowerCase();
      const to = tx.eventData.to.toLowerCase();
      const value = parseFloat(tx.eventData.value) / Math.pow(10, 18);

      if (isNaN(value)) return;

      if (from !== "0x0000000000000000000000000000000000000000") {
        holdings.set(from, (holdings.get(from) || 0) - value);
      }
      if (to !== "0x0000000000000000000000000000000000000000") {
        holdings.set(to, (holdings.get(to) || 0) + value);
      }
    });

    const balances = Array.from(holdings.values())
      .filter((b) => b > 0)
      .sort((a, b) => b - a);

    const totalBalance = balances.reduce((sum, b) => sum + b, 0);
    const top10Volume = balances.slice(0, 10).reduce((sum, b) => sum + b, 0);
    const holderConcentration =
      totalBalance > 0 ? (top10Volume / totalBalance) * 100 : 0;

    let gini = 0;
    if (balances.length > 0 && totalBalance > 0) {
      const n = balances.length;
      let sum = 0;
      balances.forEach((b, i) => {
        sum += (2 * (i + 1) - n - 1) * b;
      });
      gini = sum / (n * totalBalance);
    }

    return {
      holderConcentration,
      giniCoefficient: Math.abs(gini),
      top10HoldersVolume: top10Volume,
    };
  }

  private analyzeTimePatterns(): {
    peakActivityHour: number;
    mostActiveDay: string;
  } {
    const hourCounts = new Array(24).fill(0);
    const dayCounts: { [key: string]: number } = {};

    this.transactions.forEach((tx) => {
      const date = new Date(tx.timestamp * 1000);
      const hour = date.getUTCHours();
      const day = date.toISOString().split("T")[0];

      if (hour !== undefined && hour >= 0 && hour < 24) {
        hourCounts[hour]++;
      }
      if (day) {
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });

    const peakActivityHour = hourCounts.indexOf(Math.max(...hourCounts));
    const mostActiveDay =
      Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

    return { peakActivityHour, mostActiveDay };
  }

  private detectTrend(
    recent: Transaction[],
    older: Transaction[]
  ): "increasing" | "decreasing" | "stable" {
    if (recent.length === 0 || older.length === 0) return "stable";

    const recentRate = recent.length / 7; // per day
    const olderRate = older.length / 30; // per day

    const change = (recentRate - olderRate) / olderRate;

    if (change > 0.2) return "increasing";
    if (change < -0.2) return "decreasing";
    return "stable";
  }

  private detectRisks(): { suspiciousPatterns: string[]; riskScore: number } {
    const patterns: string[] = [];
    let riskScore = 0;

    const tradePairs = new Map<string, number>();
    this.transactions.forEach((tx) => {
      if (!tx.eventData?.from || !tx.eventData?.to) return;
      const pair = [tx.eventData.from, tx.eventData.to].sort().join("-");
      tradePairs.set(pair, (tradePairs.get(pair) || 0) + 1);
    });

    const maxPairTrades = Math.max(...Array.from(tradePairs.values()), 0);
    if (maxPairTrades > this.transactions.length * 0.1) {
      patterns.push("Potential wash trading detected");
      riskScore += 30;
    }

    const { buyVsSellRatio } = this.analyzeBuySellPressure();
    if (buyVsSellRatio > 10) {
      patterns.push("Very high buy/sell ratio - potential honeypot");
      riskScore += 40;
    }

    const { holderConcentration } = this.analyzeDistribution();
    if (holderConcentration > 80) {
      patterns.push("Extreme holder concentration (>80%)");
      riskScore += 25;
    }

    const now = Math.floor(Date.now() / 1000);
    const last24h = this.transactions.filter(
      (tx) => tx.timestamp > now - 86400
    );
    const prev24h = this.transactions.filter(
      (tx) => tx.timestamp > now - 172800 && tx.timestamp <= now - 86400
    );

    if (last24h.length > prev24h.length * 5 && prev24h.length > 0) {
      patterns.push("Sudden activity spike (>5x)");
      riskScore += 20;
    }

    return {
      suspiciousPatterns: patterns,
      riskScore: Math.min(100, riskScore),
    };
  }

  private calculateLiquidityHealth(): number {
    if (!this.tokenData) return 50;

    const { totalLiquidityUSD, volume24h } = this.tokenData;
    const ratio = volume24h / Math.max(1, totalLiquidityUSD);

    if (ratio > 0.5) return 40;
    if (ratio < 0.001) return 30;
    return Math.min(100, 50 + ratio * 100);
  }

  private calculateActivityScore(
    txPerDay: number,
    uniqueAddresses: number
  ): number {
    const txScore = Math.min(50, txPerDay * 2);
    const addressScore = Math.min(50, uniqueAddresses / 10);
    return txScore + addressScore;
  }

  private calculateDistributionScore(concentration: number): number {
    // Lower concentration = better score
    return Math.max(0, 100 - concentration);
  }

  private calculateMomentum(volume24h: number, volume7d: number): number {
    if (volume7d === 0) return 0;
    const dailyAvg7d = volume7d / 7;
    const change = ((volume24h - dailyAvg7d) / dailyAvg7d) * 100;
    return Math.max(-100, Math.min(100, change));
  }

  private getActiveAddressesPerDay(txs: Transaction[]): number {
    const addresses = new Set<string>();
    txs.forEach((tx) => {
      addresses.add(tx.eventData.from);
      addresses.add(tx.eventData.to);
    });
    return addresses.size;
  }

  generateCombinedAnalysis(onChainMetrics: OnChainMetrics): CombinedAnalysis {
    if (!this.tokenData) {
      throw new Error("Token data not provided. Call addTokenData() first.");
    }

    const scores = [
      onChainMetrics.liquidityHealthScore,
      onChainMetrics.activityScore,
      onChainMetrics.distributionScore,
      Math.max(0, 50 + onChainMetrics.momentumScore / 2),
    ];
    const overallScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const adjustedScore = Math.max(
      0,
      overallScore - onChainMetrics.riskScore / 2
    );

    let investmentSignal: CombinedAnalysis["investmentSignal"];
    if (onChainMetrics.riskScore > 70) investmentSignal = "avoid";
    else if (adjustedScore > 75 && onChainMetrics.momentumScore > 20)
      investmentSignal = "strong_buy";
    else if (adjustedScore > 60) investmentSignal = "buy";
    else if (adjustedScore > 40) investmentSignal = "hold";
    else investmentSignal = "sell";

    let riskLevel: CombinedAnalysis["riskLevel"];
    if (onChainMetrics.riskScore > 70) riskLevel = "extreme";
    else if (onChainMetrics.riskScore > 50) riskLevel = "high";
    else if (onChainMetrics.riskScore > 30) riskLevel = "medium";
    else riskLevel = "low";

    const keyFindings: string[] = [];
    const warnings: string[] = [];
    const opportunities: string[] = [];

    if (onChainMetrics.momentumScore > 30) {
      keyFindings.push(
        `Strong positive momentum: +${onChainMetrics.momentumScore.toFixed(1)}%`
      );
    }
    if (onChainMetrics.buyVsSellRatio > 2) {
      opportunities.push(
        `High buy pressure: ${onChainMetrics.buyVsSellRatio.toFixed(2)}x more buys than sells`
      );
    }
    if (onChainMetrics.holderConcentration > 60) {
      warnings.push(
        `High concentration: Top 10 holders own ${onChainMetrics.holderConcentration.toFixed(1)}% of supply`
      );
    }
    if (onChainMetrics.recentActivityTrend === "increasing") {
      opportunities.push("Activity trending upward in recent days");
    }
    if (onChainMetrics.whaleVolume / onChainMetrics.totalVolume > 0.5) {
      warnings.push(
        "Whale-dominated: Large holders control majority of volume"
      );
    }
    if (this.tokenData.viralMetrics.liquidityScore < 100000) {
      warnings.push("Low liquidity - high slippage risk");
    }

    warnings.push(...onChainMetrics.suspiciousPatterns);

    return {
      token: {
        address: this.tokenData.address,
        name: this.tokenData.name,
        symbol: this.tokenData.symbol,
      },
      timestamp: new Date().toISOString(),
      onChainMetrics,
      marketData: {
        priceUSD: this.tokenData.priceUSD,
        marketCap: this.tokenData.marketCap,
        liquidityUSD: this.tokenData.totalLiquidityUSD,
        volume24h: this.tokenData.volume24h,
        priceChange24h: this.tokenData.priceChange24h,
      },
      overallScore: adjustedScore,
      investmentSignal,
      riskLevel,
      confidence: Math.min(1, onChainMetrics.uniqueAddresses / 100),
      keyFindings,
      warnings,
      opportunities,
    };
  }

  exportToJSON(analysis: CombinedAnalysis): string {
    return JSON.stringify(analysis, null, 2);
  }
}

async function main() {
  const aggregator = new OnChainAggregator();

  const transactionData = JSON.parse(
    fs.readFileSync("./token_transactions.json", "utf8")
  ); // Your 5000+ transactions
  const tokenData = JSON.parse(
    fs.readFileSync("./token_analysis.json", "utf8")
  ); // Your token market data

  aggregator.addTransactions(transactionData.transactions);
  aggregator.addTokenData(tokenData);

  console.log("🔗 Starting On-Chain Analysis...\n");

  const onChainMetrics = aggregator.analyzeOnChain();
  const combinedAnalysis = aggregator.generateCombinedAnalysis(onChainMetrics);

  console.log("\n📊 ON-CHAIN ANALYSIS RESULTS:\n");
  console.log(aggregator.exportToJSON(combinedAnalysis));
}

  // main().catch(console.error);


export { OnChainAggregator };
