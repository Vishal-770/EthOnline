import "dotenv/config";
import fs from "fs/promises";
import type { Transaction } from "./multichain-transaction.ts";

export interface TokenData {
  address: string;
  chainId: number;
  chainName: string;
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
    ageInHours: number;
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

  // NEW: Multichain specific metrics
  chainDistribution: Record<string, number>;
  crossChainActivity: boolean;
  dominantChain: string;
}

export interface CombinedAnalysis {
  token: {
    address: string;
    name: string;
    symbol: string;
    chainId?: number;
    isMultichain: boolean;
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
  confidence: number;

  keyFindings: string[];
  warnings: string[];
  opportunities: string[];
}

export class MultichainAggregator {
  private transactions: Transaction[] = [];
  private tokenData: TokenData | null = null;

  addTransactions(txs: Transaction[]): void {
    this.transactions = txs.sort((a, b) => a.timestamp - b.timestamp);
    console.log(`📦 Added ${txs.length} transactions for analysis`);
  }

  addTokenData(data: TokenData): void {
    this.tokenData = data;
    console.log(`📦 Added token data for ${data.symbol} (${data.name})`);
  }

  /**
   * Main analysis function - analyzes all on-chain metrics
   */
  analyzeOnChain(): OnChainMetrics {
    console.log(`\n📊 Analyzing ${this.transactions.length} on-chain transactions...`);

    const now = Math.floor(Date.now() / 1000);
    const day = 86400;
    const hour = 3600;

    // Parse transaction values
    const txValues = this.transactions
      .map((tx) => {
        if (!tx.eventData?.value) return 0;
        const value = parseFloat(tx.eventData.value) / Math.pow(10, 18);
        return isNaN(value) ? 0 : value;
      })
      .filter((v) => v > 0);

    // Time-based filtering
    const last24h = this.transactions.filter((tx) => tx.timestamp > now - day);
    const last7d = this.transactions.filter((tx) => tx.timestamp > now - 7 * day);
    const last30d = this.transactions.filter((tx) => tx.timestamp > now - 30 * day);

    // Volume calculations
    const totalVolume = txValues.reduce((sum, v) => sum + v, 0);
    const volume24h = this.calculateVolume(last24h);
    const volume7d = this.calculateVolume(last7d);
    const volume30d = this.calculateVolume(last30d);

    // Address metrics
    const uniqueAddresses = this.getUniqueAddresses();

    // Transaction value statistics
    const avgTxValue = txValues.length > 0 ? totalVolume / txValues.length : 0;
    const medianTxValue = this.calculateMedian(txValues);

    // Whale analysis
    const whaleThreshold = Math.max(totalVolume * 0.01, 10000);
    const whaleTransactions = txValues.filter((v) => v > whaleThreshold).length;
    const whaleVolume = txValues
      .filter((v) => v > whaleThreshold)
      .reduce((sum, v) => sum + v, 0);
    const largestTransaction = Math.max(...txValues, 0);

    // Activity rates
    const firstTxTimestamp = this.transactions[0]?.timestamp || now;
    const txPerDay =
      this.transactions.length / Math.max(1, (now - firstTxTimestamp) / day);
    const txPerHour = last24h.length / 24;
    const activeAddressesPerDay = this.getActiveAddressesPerDay(last24h);

    // Buy/Sell pressure
    const { buyVsSellRatio, avgBuySize, avgSellSize } = this.analyzeBuySellPressure();

    // Distribution analysis
    const { holderConcentration, giniCoefficient, top10HoldersVolume } =
      this.analyzeDistribution();

    // Time patterns
    const { peakActivityHour, mostActiveDay } = this.analyzeTimePatterns();
    const recentActivityTrend = this.detectTrend(last7d, last30d);

    // Risk detection
    const { suspiciousPatterns, riskScore } = this.detectRisks();

    // Scoring
    const liquidityHealthScore = this.calculateLiquidityHealth();
    const activityScore = this.calculateActivityScore(txPerDay, uniqueAddresses);
    const distributionScore = this.calculateDistributionScore(holderConcentration);
    const momentumScore = this.calculateMomentum(volume24h, volume7d);

    // NEW: Multichain metrics
    const { chainDistribution, crossChainActivity, dominantChain } =
      this.analyzeChainDistribution();

    console.log("✅ On-chain analysis complete");

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
      chainDistribution,
      crossChainActivity,
      dominantChain,
    };
  }

  /**
   * NEW: Analyze chain distribution for multichain tokens
   */
  private analyzeChainDistribution(): {
    chainDistribution: Record<string, number>;
    crossChainActivity: boolean;
    dominantChain: string;
  } {
    const chainCounts = new Map<string, number>();

    this.transactions.forEach((tx) => {
      const chain = tx.chainName || "Unknown";
      chainCounts.set(chain, (chainCounts.get(chain) || 0) + 1);
    });

    const chainDistribution = Object.fromEntries(chainCounts);
    const crossChainActivity = chainCounts.size > 1;

    let dominantChain = "Unknown";
    let maxCount = 0;
    chainCounts.forEach((count, chain) => {
      if (count > maxCount) {
        maxCount = count;
        dominantChain = chain;
      }
    });

    return { chainDistribution, crossChainActivity, dominantChain };
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
      if (tx.eventData?.from) addresses.add(tx.eventData.from.toLowerCase());
      if (tx.eventData?.to) addresses.add(tx.eventData.to.toLowerCase());
      if (tx.eventData?.owner) addresses.add(tx.eventData.owner.toLowerCase());
      if (tx.eventData?.spender) addresses.add(tx.eventData.spender.toLowerCase());
    });
    addresses.delete("0x0000000000000000000000000000000000000000");
    return addresses.size;
  }

  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
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
      if (tx.eventType !== "Transfer" || !tx.eventData?.value) return;

      const value = parseFloat(tx.eventData.value) / Math.pow(10, 18);
      if (isNaN(value) || value <= 0) return;

      const from = tx.eventData.from?.toLowerCase() || "";
      const to = tx.eventData.to?.toLowerCase() || "";

      // Mint (buy)
      if (from === "0x0000000000000000000000000000000000000000") {
        buyVolume += value;
        buyCount++;
      }
      // Burn (sell)
      else if (to === "0x0000000000000000000000000000000000000000") {
        sellVolume += value;
        sellCount++;
      }
      // Heuristic: Check for DEX addresses
      else {
        const isDexFrom = this.isDexAddress(from);
        const isDexTo = this.isDexAddress(to);

        if (isDexFrom && !isDexTo) {
          buyVolume += value;
          buyCount++;
        } else if (!isDexFrom && isDexTo) {
          sellVolume += value;
          sellCount++;
        }
      }
    });

    return {
      buyVsSellRatio:
        sellVolume > 0 ? buyVolume / sellVolume : buyVolume > 0 ? 999 : 1,
      avgBuySize: buyCount > 0 ? buyVolume / buyCount : 0,
      avgSellSize: sellCount > 0 ? sellVolume / sellCount : 0,
    };
  }

  private isDexAddress(addr: string): boolean {
    // Common DEX router patterns
    const dexPatterns = [
      "uniswap",
      "sushiswap",
      "pancakeswap",
      "1inch",
      "0x",
      "curve",
      "balancer",
    ];
    return dexPatterns.some((pattern) => addr.includes(pattern));
  }

  private analyzeDistribution(): {
    holderConcentration: number;
    giniCoefficient: number;
    top10HoldersVolume: number;
  } {
    const holdings = new Map<string, number>();

    this.transactions.forEach((tx) => {
      if (tx.eventType !== "Transfer" || !tx.eventData?.value) return;

      const from = tx.eventData.from?.toLowerCase() || "";
      const to = tx.eventData.to?.toLowerCase() || "";
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

    // Gini coefficient calculation
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
    const dayCounts: Record<string, number> = {};

    this.transactions.forEach((tx) => {
      const date = new Date(tx.timestamp * 1000);
      const hour = date.getUTCHours();
      const day = date.toISOString().split("T")[0];

      if (hour >= 0 && hour < 24) {
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

    const recentRate = recent.length / 7;
    const olderRate = older.length / 30;
    const change = (recentRate - olderRate) / Math.max(olderRate, 1);

    if (change > 0.2) return "increasing";
    if (change < -0.2) return "decreasing";
    return "stable";
  }

  private detectRisks(): { suspiciousPatterns: string[]; riskScore: number } {
    const patterns: string[] = [];
    let riskScore = 0;

    // Wash trading detection
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

    // Honeypot detection
    const { buyVsSellRatio } = this.analyzeBuySellPressure();
    if (buyVsSellRatio > 10) {
      patterns.push("Very high buy/sell ratio - potential honeypot");
      riskScore += 40;
    }

    // Concentration risk
    const { holderConcentration } = this.analyzeDistribution();
    if (holderConcentration > 80) {
      patterns.push("Extreme holder concentration (>80%)");
      riskScore += 25;
    }

    // Sudden activity spike
    const now = Math.floor(Date.now() / 1000);
    const last24h = this.transactions.filter((tx) => tx.timestamp > now - 86400);
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

    if (totalLiquidityUSD < 10000) return 20;
    if (ratio > 2) return 40; // Too much volume vs liquidity
    if (ratio < 0.001) return 30; // Too little activity
    return Math.min(100, 50 + Math.log10(totalLiquidityUSD) * 10);
  }

  private calculateActivityScore(txPerDay: number, uniqueAddresses: number): number {
    const txScore = Math.min(50, Math.log10(txPerDay + 1) * 20);
    const addressScore = Math.min(50, Math.log10(uniqueAddresses + 1) * 15);
    return txScore + addressScore;
  }

  private calculateDistributionScore(concentration: number): number {
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
      if (tx.eventData.from) addresses.add(tx.eventData.from);
      if (tx.eventData.to) addresses.add(tx.eventData.to);
    });
    return addresses.size;
  }

  /**
   * Generate combined analysis with investment signals
   */
  generateCombinedAnalysis(onChainMetrics: OnChainMetrics): CombinedAnalysis {
    if (!this.tokenData) {
      throw new Error("Token data not provided. Call addTokenData() first.");
    }

    // Calculate overall score
    const scores = [
      onChainMetrics.liquidityHealthScore,
      onChainMetrics.activityScore,
      onChainMetrics.distributionScore,
      Math.max(0, 50 + onChainMetrics.momentumScore / 2),
    ];
    const overallScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const adjustedScore = Math.max(0, overallScore - onChainMetrics.riskScore / 2);

    // Determine investment signal
    let investmentSignal: CombinedAnalysis["investmentSignal"];
    if (onChainMetrics.riskScore > 70) {
      investmentSignal = "avoid";
    } else if (adjustedScore > 75 && onChainMetrics.momentumScore > 20) {
      investmentSignal = "strong_buy";
    } else if (adjustedScore > 60) {
      investmentSignal = "buy";
    } else if (adjustedScore > 40) {
      investmentSignal = "hold";
    } else {
      investmentSignal = "sell";
    }

    // Determine risk level
    let riskLevel: CombinedAnalysis["riskLevel"];
    if (onChainMetrics.riskScore > 70) riskLevel = "extreme";
    else if (onChainMetrics.riskScore > 50) riskLevel = "high";
    else if (onChainMetrics.riskScore > 30) riskLevel = "medium";
    else riskLevel = "low";

    // Generate insights
    const keyFindings: string[] = [];
    const warnings: string[] = [];
    const opportunities: string[] = [];

    // Key findings
    if (onChainMetrics.crossChainActivity) {
      keyFindings.push(
        `Multi-chain token active on: ${Object.keys(onChainMetrics.chainDistribution).join(", ")}`
      );
    }
    if (onChainMetrics.momentumScore > 30) {
      keyFindings.push(
        `Strong positive momentum: +${onChainMetrics.momentumScore.toFixed(1)}%`
      );
    }
    if (onChainMetrics.txPerHour > 10) {
      keyFindings.push(
        `High activity: ${onChainMetrics.txPerHour.toFixed(1)} transactions per hour`
      );
    }

    // Opportunities
    if (onChainMetrics.buyVsSellRatio > 2) {
      opportunities.push(
        `High buy pressure: ${onChainMetrics.buyVsSellRatio.toFixed(2)}x more buys than sells`
      );
    }
    if (onChainMetrics.recentActivityTrend === "increasing") {
      opportunities.push("Activity trending upward in recent days");
    }
    if (this.tokenData.viralMetrics.multiChainPresence > 2) {
      opportunities.push("Strong multi-chain presence suggests growing adoption");
    }

    // Warnings
    if (onChainMetrics.holderConcentration > 60) {
      warnings.push(
        `High concentration: Top 10 holders own ${onChainMetrics.holderConcentration.toFixed(1)}% of supply`
      );
    }
    if (onChainMetrics.whaleVolume / onChainMetrics.totalVolume > 0.5) {
      warnings.push("Whale-dominated: Large holders control majority of volume");
    }
    if (this.tokenData.totalLiquidityUSD < 50000) {
      warnings.push("Low liquidity - high slippage risk");
    }
    if (onChainMetrics.uniqueAddresses < 50) {
      warnings.push("Very small holder base - liquidity risk");
    }

    warnings.push(...onChainMetrics.suspiciousPatterns);

    const confidence = Math.min(
      1,
      (onChainMetrics.uniqueAddresses / 100) * (onChainMetrics.totalTransactions / 1000)
    );

    return {
      token: {
        address: this.tokenData.address,
        name: this.tokenData.name,
        symbol: this.tokenData.symbol,
        chainId: this.tokenData.chainId,
        isMultichain: onChainMetrics.crossChainActivity,
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
      confidence,
      keyFindings,
      warnings,
      opportunities,
    };
  }

  /**
   * Export analysis to JSON
   */
  async exportToJSON(analysis: CombinedAnalysis, filename?: string): Promise<void> {
    const output = filename || `./analysis_${analysis.token.symbol}_${Date.now()}.json`;
    await fs.writeFile(output, JSON.stringify(analysis, null, 2));
    console.log(`\n💾 Analysis saved to: ${output}`);
  }

  /**
   * Print formatted analysis to console
   */
  printAnalysis(analysis: CombinedAnalysis): void {
    console.log("\n" + "═".repeat(70));
    console.log(`📊 COMPREHENSIVE ANALYSIS: ${analysis.token.name} (${analysis.token.symbol})`);
    console.log("═".repeat(70));

    console.log(`\n🎯 INVESTMENT SIGNAL: ${analysis.investmentSignal.toUpperCase()}`);
    console.log(`📈 Overall Score: ${analysis.overallScore.toFixed(1)}/100`);
    console.log(`⚠️  Risk Level: ${analysis.riskLevel.toUpperCase()}`);
    console.log(`🎲 Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);

    if (analysis.token.isMultichain) {
      console.log(`\n🌐 MULTICHAIN: Active on ${Object.keys(analysis.onChainMetrics.chainDistribution).length} chains`);
      console.table(analysis.onChainMetrics.chainDistribution);
    }

    console.log("\n💰 MARKET DATA:");
    console.table(analysis.marketData);

    console.log("\n📊 ON-CHAIN METRICS:");
    console.table({
      "Total Transactions": analysis.onChainMetrics.totalTransactions,
      "Unique Addresses": analysis.onChainMetrics.uniqueAddresses,
      "TX per Hour": analysis.onChainMetrics.txPerHour.toFixed(2),
      "Buy/Sell Ratio": analysis.onChainMetrics.buyVsSellRatio.toFixed(2),
      "Holder Concentration": `${analysis.onChainMetrics.holderConcentration.toFixed(1)}%`,
      "Momentum": `${analysis.onChainMetrics.momentumScore.toFixed(1)}%`,
    });

    if (analysis.keyFindings.length > 0) {
      console.log("\n✅ KEY FINDINGS:");
      analysis.keyFindings.forEach((f) => console.log(`   • ${f}`));
    }

    if (analysis.opportunities.length > 0) {
      console.log("\n💡 OPPORTUNITIES:");
      analysis.opportunities.forEach((o) => console.log(`   • ${o}`));
    }

    if (analysis.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:");
      analysis.warnings.forEach((w) => console.log(`   • ${w}`));
    }

    console.log("\n" + "═".repeat(70));
  }
}

  async function main() {
    const aggregator = new MultichainAggregator();

    // Load transaction data
    const transactionData = JSON.parse(
      await fs.readFile("./multichain_transactions.json", "utf8")
    );

    // Load token metadata
    const tokenData = JSON.parse(
      await fs.readFile("./token_metadata.json", "utf8")
    );

    aggregator.addTransactions(transactionData.transactions);
    aggregator.addTokenData(tokenData);

    console.log("🔗 Starting Multichain Analysis...\n");

    const onChainMetrics = aggregator.analyzeOnChain();
    const combinedAnalysis = aggregator.generateCombinedAnalysis(onChainMetrics);

    aggregator.printAnalysis(combinedAnalysis);
    await aggregator.exportToJSON(combinedAnalysis);
  }

  main().catch(console.error);


// export { MultichainAggregator };