import axios from 'axios';
import { LiquidityData } from '../types';

export class YieldService {
  private coingeckoApiKey: string;
  private defiLlamaBaseUrl: string;

  constructor() {
    this.coingeckoApiKey = process.env.COINGECKO_API_KEY || '';
    this.defiLlamaBaseUrl = 'https://api.llama.fi';
  }

  async getLiquidityData(tokenAddress: string, pairAddress: string): Promise<LiquidityData | null> {
    try {
      // Get data from multiple sources and aggregate
      const [coingeckoData, defiLlamaData] = await Promise.allSettled([
        this.getCoingeckoData(tokenAddress),
        this.getDefiLlamaData(tokenAddress)
      ]);

      const cgData = coingeckoData.status === 'fulfilled' ? coingeckoData.value : null;
      const dlData = defiLlamaData.status === 'fulfilled' ? defiLlamaData.value : null;

      return this.aggregateLiquidityData(tokenAddress, pairAddress, cgData, dlData);
    } catch (error) {
      console.error(`❌ Error fetching liquidity data for ${tokenAddress}:`, error);
      return null;
    }
  }

  private async getCoingeckoData(tokenAddress: string): Promise<any> {
    const headers = this.coingeckoApiKey ? { 'X-CG-Pro-API-Key': this.coingeckoApiKey } : {};
    
    try {
      // Get token info
      const tokenResponse = await axios.get(
        `https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenAddress}`,
        { headers }
      );

      // Get market data
      const marketResponse = await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum`,
        {
          headers,
          params: {
            contract_addresses: tokenAddress,
            vs_currencies: 'usd',
            include_market_cap: true,
            include_24hr_vol: true,
            include_24hr_change: true
          }
        }
      );

      return {
        token: tokenResponse.data,
        market: marketResponse.data[tokenAddress.toLowerCase()]
      };
    } catch (error) {
      console.error('❌ CoinGecko API error:', error);
      return null;
    }
  }

  private async getDefiLlamaData(tokenAddress: string): Promise<any> {
    try {
      // Get TVL data
      const tvlResponse = await axios.get(`${this.defiLlamaBaseUrl}/tvl`);
      
      // Get yield data for DeFi protocols
      const yieldResponse = await axios.get(`${this.defiLlamaBaseUrl}/yields`);
      
      return {
        tvl: tvlResponse.data,
        yields: yieldResponse.data.data || []
      };
    } catch (error) {
      console.error('❌ DefiLlama API error:', error);
      return null;
    }
  }

  private aggregateLiquidityData(
    tokenAddress: string,
    pairAddress: string,
    coingeckoData: any,
    defiLlamaData: any
  ): LiquidityData {
    const timestamp = Date.now();
    
    // Extract price from CoinGecko
    const priceUSD = coingeckoData?.market?.usd || 0;
    const volume24h = coingeckoData?.market?.usd_24h_vol || 0;
    const marketCap = coingeckoData?.market?.usd_market_cap || 0;

    // Calculate estimated TVL (simplified calculation)
    const estimatedLiquidity = marketCap * 0.1; // Assume 10% of market cap is in liquidity

    // Find relevant yield data from DefiLlama
    const relevantYield = defiLlamaData?.yields?.find((pool: any) => 
      pool.pool?.toLowerCase().includes(tokenAddress.toLowerCase()) ||
      pool.symbol?.toLowerCase().includes(coingeckoData?.token?.symbol?.toLowerCase())
    );

    const apy = relevantYield?.apy || this.estimateAPY(volume24h, estimatedLiquidity);

    return {
      tokenAddress,
      pairAddress,
      tvl: estimatedLiquidity,
      apy,
      liquidity: estimatedLiquidity,
      volume24h,
      priceUSD,
      timestamp
    };
  }

  private estimateAPY(volume24h: number, liquidity: number): number {
    if (liquidity === 0) return 0;
    
    // Estimate APY based on volume/liquidity ratio
    // Assume 0.3% fee and calculate annual return
    const dailyFees = volume24h * 0.003;
    const dailyYield = dailyFees / liquidity;
    const apy = (Math.pow(1 + dailyYield, 365) - 1) * 100;
    
    // Cap at reasonable maximum
    return Math.min(apy, 1000);
  }

  async getHistoricalAPY(tokenAddress: string, days: number = 7): Promise<Array<{date: string, apy: number}>> {
    try {
      const headers = this.coingeckoApiKey ? { 'X-CG-Pro-API-Key': this.coingeckoApiKey } : {};
      
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenAddress}/market_chart`,
        {
          headers,
          params: {
            vs_currency: 'usd',
            days: days
          }
        }
      );

      const prices = response.data.prices || [];
      const volumes = response.data.total_volumes || [];

      return prices.map((price: number[], index: number) => {
        const date = new Date(price[0]).toISOString().split('T')[0];
        const volume = volumes[index] ? volumes[index][1] : 0;
        const estimatedLiquidity = price[1] * 1000000; // Rough estimate
        const apy = this.estimateAPY(volume, estimatedLiquidity);
        
        return { date, apy };
      });
    } catch (error) {
      console.error(`❌ Error fetching historical APY for ${tokenAddress}:`, error);
      return [];
    }
  }

  async getTopYieldPairs(limit: number = 10): Promise<LiquidityData[]> {
    try {
      // Get top yield pools from DefiLlama
      const response = await axios.get(`${this.defiLlamaBaseUrl}/yields`, {
        params: {
          orderBy: 'apy',
          order: 'desc',
          offset: 0,
          limit: limit * 2 // Get more to filter memecoins
        }
      });

      const pools = response.data.data || [];
      
      // Filter for likely memecoins (new tokens, high volatility)
      const memecoinPools = pools.filter((pool: any) => 
        pool.project !== 'ethereum' && 
        pool.project !== 'bitcoin' &&
        pool.apy > 10 && // High yield threshold
        pool.apy < 1000 // Exclude extremely high/suspicious yields
      );

      return memecoinPools.slice(0, limit).map((pool: any) => ({
        tokenAddress: pool.pool || '',
        pairAddress: pool.pool || '',
        tvl: pool.tvlUsd || 0,
        apy: pool.apy || 0,
        liquidity: pool.tvlUsd || 0,
        volume24h: 0, // Not available in this endpoint
        priceUSD: 0, // Not available in this endpoint
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('❌ Error fetching top yield pairs:', error);
      return [];
    }
  }
}