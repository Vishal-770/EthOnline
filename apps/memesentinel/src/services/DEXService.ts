import axios from 'axios';
import { MemecoinData } from '../types';

export class DEXService {
  private uniswapV2Endpoint: string;
  private uniswapV3Endpoint: string;
  private saucerswapEndpoint: string;

  constructor() {
    this.uniswapV2Endpoint = process.env.UNISWAP_V2_SUBGRAPH || 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
    this.uniswapV3Endpoint = process.env.UNISWAP_V3_SUBGRAPH || 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
    this.saucerswapEndpoint = process.env.SAUCERSWAP_API || 'https://api.saucerswap.finance';
  }

  async getNewPairs(timeframe: number = 3600000): Promise<MemecoinData[]> {
    const since = Date.now() - timeframe;
    const pairs: MemecoinData[] = [];

    try {
      // Get new Uniswap V2 pairs
      const v2Pairs = await this.getUniswapV2NewPairs(since);
      pairs.push(...v2Pairs);

      // Get new Uniswap V3 pools
      const v3Pairs = await this.getUniswapV3NewPairs(since);
      pairs.push(...v3Pairs);

      // Get new SaucerSwap pairs (Hedera)
      const saucerPairs = await this.getSaucerSwapNewPairs(since);
      pairs.push(...saucerPairs);

      console.log(`🔍 Found ${pairs.length} new pairs in the last ${timeframe / 60000} minutes`);
      return pairs;
    } catch (error) {
      console.error('❌ Error fetching new pairs:', error);
      return [];
    }
  }

  private async getUniswapV2NewPairs(since: number): Promise<MemecoinData[]> {
    const query = `
      query GetNewPairs($timestamp: Int!) {
        pairs(
          first: 100
          orderBy: createdAtTimestamp
          orderDirection: desc
          where: { createdAtTimestamp_gte: $timestamp }
        ) {
          id
          token0 {
            id
            symbol
            name
          }
          token1 {
            id
            symbol
            name
          }
          createdAtTimestamp
          createdAtBlockNumber
        }
      }
    `;

    try {
      const response = await axios.post(this.uniswapV2Endpoint, {
        query,
        variables: { timestamp: Math.floor(since / 1000) }
      });

      return response.data.data.pairs.map((pair: any) => ({
        address: pair.token0.id,
        symbol: pair.token0.symbol,
        name: pair.token0.name,
        dex: 'uniswap-v2',
        pairAddress: pair.id,
        token0: pair.token0.id,
        token1: pair.token1.id,
        createdAt: pair.createdAtTimestamp * 1000,
        discoveredAt: Date.now()
      }));
    } catch (error) {
      console.error('❌ Error fetching Uniswap V2 pairs:', error);
      return [];
    }
  }

  private async getUniswapV3NewPairs(since: number): Promise<MemecoinData[]> {
    const query = `
      query GetNewPools($timestamp: Int!) {
        pools(
          first: 100
          orderBy: createdAtTimestamp
          orderDirection: desc
          where: { createdAtTimestamp_gte: $timestamp }
        ) {
          id
          token0 {
            id
            symbol
            name
          }
          token1 {
            id
            symbol
            name
          }
          createdAtTimestamp
          createdAtBlockNumber
        }
      }
    `;

    try {
      const response = await axios.post(this.uniswapV3Endpoint, {
        query,
        variables: { timestamp: Math.floor(since / 1000) }
      });

      return response.data.data.pools.map((pool: any) => ({
        address: pool.token0.id,
        symbol: pool.token0.symbol,
        name: pool.token0.name,
        dex: 'uniswap-v3',
        pairAddress: pool.id,
        token0: pool.token0.id,
        token1: pool.token1.id,
        createdAt: pool.createdAtTimestamp * 1000,
        discoveredAt: Date.now()
      }));
    } catch (error) {
      console.error('❌ Error fetching Uniswap V3 pools:', error);
      return [];
    }
  }

  private async getSaucerSwapNewPairs(since: number): Promise<MemecoinData[]> {
    try {
      const response = await axios.get(`${this.saucerswapEndpoint}/tokens`);
      const tokens = response.data.filter((token: any) => 
        new Date(token.createdAt).getTime() > since
      );

      return tokens.map((token: any) => ({
        address: token.id,
        symbol: token.symbol,
        name: token.name,
        dex: 'saucerswap',
        pairAddress: token.pairId || token.id,
        token0: token.id,
        token1: 'HBAR', // Most pairs on SaucerSwap are with HBAR
        createdAt: new Date(token.createdAt).getTime(),
        discoveredAt: Date.now()
      }));
    } catch (error) {
      console.error('❌ Error fetching SaucerSwap pairs:', error);
      return [];
    }
  }

  async getPairDetails(pairAddress: string, dex: string): Promise<any> {
    try {
      switch (dex) {
        case 'uniswap-v2':
          return await this.getUniswapV2PairDetails(pairAddress);
        case 'uniswap-v3':
          return await this.getUniswapV3PoolDetails(pairAddress);
        case 'saucerswap':
          return await this.getSaucerSwapPairDetails(pairAddress);
        default:
          throw new Error(`Unsupported DEX: ${dex}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching pair details for ${pairAddress}:`, error);
      return null;
    }
  }

  private async getUniswapV2PairDetails(pairAddress: string): Promise<any> {
    const query = `
      query GetPairDetails($pairId: ID!) {
        pair(id: $pairId) {
          id
          reserve0
          reserve1
          reserveUSD
          volumeUSD
          token0Price
          token1Price
          liquidityProviderCount
        }
      }
    `;

    const response = await axios.post(this.uniswapV2Endpoint, {
      query,
      variables: { pairId: pairAddress.toLowerCase() }
    });

    return response.data.data.pair;
  }

  private async getUniswapV3PoolDetails(poolAddress: string): Promise<any> {
    const query = `
      query GetPoolDetails($poolId: ID!) {
        pool(id: $poolId) {
          id
          liquidity
          totalValueLockedUSD
          volumeUSD
          token0Price
          token1Price
          tick
        }
      }
    `;

    const response = await axios.post(this.uniswapV3Endpoint, {
      query,
      variables: { poolId: poolAddress.toLowerCase() }
    });

    return response.data.data.pool;
  }

  private async getSaucerSwapPairDetails(pairAddress: string): Promise<any> {
    const response = await axios.get(`${this.saucerswapEndpoint}/pairs/${pairAddress}`);
    return response.data;
  }
}