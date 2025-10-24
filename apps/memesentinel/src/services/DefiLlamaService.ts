import axios, { AxiosResponse } from 'axios';

export interface DefiLlamaProtocol {
  id: string;
  name: string;
  symbol: string;
  category: string;
  chains: string[];
  tvl: number;
  chainTvls: Record<string, number>;
  change_1d: number;
  change_7d: number;
}

export interface YieldPool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  rewardTokens: string[];
  underlyingTokens: string[];
  poolMeta: string;
  url: string;
  predictions?: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  };
}

export interface ChainTVL {
  gecko_id: string;
  tvl: number;
  tokenSymbol: string;
  cmcId: string;
  name: string;
  chainId: number;
}

export interface TokenPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
  };
}

export interface BridgeVolume {
  id: number;
  name: string;
  displayName: string;
  volumePrevDay: number;
  volumePrev2Day: number;
  lastHourlyVolume: number;
  last24hVolume: number;
  weeklyVolume: number;
  monthlyVolume: number;
  chains: string[];
  destinationChain: string;
  url: string;
}

export class DefiLlamaService {
  private baseUrl = 'https://api.llama.fi';
  private yieldsUrl = 'https://yields.llama.fi';
  private coinsUrl = 'https://coins.llama.fi';
  private bridgesUrl = 'https://bridges.llama.fi';

  constructor() {
    // No API key required for basic endpoints
  }

  private async makeRequest<T>(url: string): Promise<T> {
    try {
      const config: any = {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MemeSentinel/1.0.0'
        }
      };

      const response: AxiosResponse<T> = await axios.get(url, config);
      return response.data;
    } catch (error: any) {
      console.error(`❌ DefiLlama API Error for ${url}:`, error.message);
      throw new Error(`DefiLlama API request failed: ${error.message}`);
    }
  }

  // TVL & Protocol Data
  async getAllProtocols(): Promise<DefiLlamaProtocol[]> {
    return this.makeRequest<DefiLlamaProtocol[]>(`${this.baseUrl}/protocols`);
  }

  async getProtocol(protocol: string): Promise<any> {
    return this.makeRequest(`${this.baseUrl}/protocol/${protocol}`);
  }

  async getProtocolTVL(protocol: string): Promise<number> {
    return this.makeRequest<number>(`${this.baseUrl}/tvl/${protocol}`);
  }

  async getAllChainTVLs(): Promise<ChainTVL[]> {
    return this.makeRequest<ChainTVL[]>(`${this.baseUrl}/v2/chains`);
  }

  async getChainTVL(chain: string): Promise<any[]> {
    return this.makeRequest(`${this.baseUrl}/v2/historicalChainTvl/${chain}`);
  }

  async getHistoricalTVL(): Promise<any[]> {
    return this.makeRequest(`${this.baseUrl}/v2/historicalChainTvl`);
  }

  // Yields & APY Data
  async getAllYieldPools(): Promise<{ status: string; data: YieldPool[] }> {
    return this.makeRequest(`${this.yieldsUrl}/pools`);
  }

  async getPoolChart(poolId: string): Promise<any> {
    return this.makeRequest(`${this.yieldsUrl}/chart/${poolId}`);
  }

  async getBorrowPools(): Promise<any> {
    console.log('⚠️  Note: Borrow pools endpoint may require premium access');
    return this.makeRequest(`${this.yieldsUrl}/poolsBorrow`);
  }

  async getLSDRates(): Promise<any> {
    console.log('⚠️  Note: LSD rates endpoint may require premium access');
    return this.makeRequest(`${this.yieldsUrl}/lsdRates`);
  }

  async getPerpetuals(): Promise<any> {
    console.log('⚠️  Note: Perpetuals endpoint may require premium access');
    return this.makeRequest(`${this.yieldsUrl}/perps`);
  }

  // Token & Price Data
  async getCurrentPrices(tokenIds: string[]): Promise<TokenPrice> {
    const idsString = tokenIds.join(',');
    return this.makeRequest(`${this.coinsUrl}/prices/current/${idsString}`);
  }

  async getHistoricalPrices(timestamp: number, tokenIds: string[]): Promise<any> {
    const idsString = tokenIds.join(',');
    return this.makeRequest(`${this.coinsUrl}/prices/historical/${timestamp}/${idsString}`);
  }

  async getTokenChart(tokenId: string): Promise<any> {
    return this.makeRequest(`${this.coinsUrl}/chart/${tokenId}`);
  }

  async getFirstTokenPrices(tokenIds: string[]): Promise<any> {
    const idsString = tokenIds.join(',');
    return this.makeRequest(`${this.coinsUrl}/prices/first/${idsString}`);
  }

  // Bridge Data
  async getAllBridges(): Promise<{ bridges: BridgeVolume[] }> {
    return this.makeRequest(`${this.bridgesUrl}/bridges`);
  }

  async getBridge(bridgeId: number): Promise<any> {
    return this.makeRequest(`${this.bridgesUrl}/bridge/${bridgeId}`);
  }

  async getBridgeVolume(chain: string, bridgeId?: number): Promise<any> {
    const url = bridgeId 
      ? `${this.bridgesUrl}/bridgevolume/${chain}?id=${bridgeId}`
      : `${this.bridgesUrl}/bridgevolume/${chain}`;
    return this.makeRequest(url);
  }

  // Advanced Analytics
  async getTokenProtocols(symbol: string): Promise<any> {
    console.log('⚠️  Note: Token protocols endpoint may require premium access');
    return this.makeRequest(`${this.baseUrl}/api/tokenProtocols/${symbol}`);
  }

  async getProtocolInflows(protocol: string, timestamp: number): Promise<any> {
    console.log('⚠️  Note: Protocol inflows endpoint may require premium access');
    return this.makeRequest(`${this.baseUrl}/api/inflows/${protocol}/${timestamp}`);
  }

  async getChainAssets(): Promise<any> {
    console.log('⚠️  Note: Chain assets endpoint may require premium access');
    return this.makeRequest(`${this.baseUrl}/api/chainAssets`);
  }

  // DEX & Volume Data
  async getDEXOverview(): Promise<any> {
    return this.makeRequest(`${this.baseUrl}/overview/dexs`);
  }

  async getChainDEXs(chain: string): Promise<any> {
    return this.makeRequest(`${this.baseUrl}/overview/dexs/${chain}`);
  }

  async getDEXSummary(protocol: string): Promise<any> {
    return this.makeRequest(`${this.baseUrl}/summary/dexs/${protocol}`);
  }

  // Fees & Revenue
  async getFeesOverview(): Promise<any> {
    return this.makeRequest(`${this.baseUrl}/overview/fees`);
  }

  async getChainFees(chain: string): Promise<any> {
    return this.makeRequest(`${this.baseUrl}/overview/fees/${chain}`);
  }

  async getProtocolFees(protocol: string): Promise<any> {
    return this.makeRequest(`${this.baseUrl}/summary/fees/${protocol}`);
  }

  // Helper Methods for MemeSentinel
  async getTopMemecoinsByTVL(limit = 20): Promise<DefiLlamaProtocol[]> {
    try {
      const protocols = await this.getAllProtocols();
      
      // Filter for potential memecoins (could be enhanced with more sophisticated filtering)
      const memeProtocols = protocols.filter(p => 
        p.category?.toLowerCase().includes('meme') ||
        p.name?.toLowerCase().includes('meme') ||
        p.symbol?.toLowerCase().includes('doge') ||
        p.symbol?.toLowerCase().includes('shib') ||
        p.symbol?.toLowerCase().includes('pepe')
      );

      return memeProtocols
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Error fetching memecoin TVL data:', error);
      return [];
    }
  }

  async getHighYieldPools(minAPY = 10, chains = ['Ethereum', 'Polygon', 'Arbitrum']): Promise<YieldPool[]> {
    try {
      const response = await this.getAllYieldPools();
      
      return response.data
        .filter(pool => 
          pool.apy >= minAPY && 
          chains.includes(pool.chain) &&
          pool.tvlUsd > 1000000 // At least $1M TVL
        )
        .sort((a, b) => b.apy - a.apy)
        .slice(0, 50);
    } catch (error) {
      console.error('❌ Error fetching high yield pools:', error);
      return [];
    }
  }

  async getChainMetrics(chains = ['Ethereum', 'Polygon', 'Arbitrum', 'Base']): Promise<ChainTVL[]> {
    try {
      const allChains = await this.getAllChainTVLs();
      return allChains.filter(chain => chains.includes(chain.name));
    } catch (error) {
      console.error('❌ Error fetching chain metrics:', error);
      return [];
    }
  }

  async getCrossChainActivity(): Promise<BridgeVolume[]> {
    try {
      const response = await this.getAllBridges();
      return response.bridges
        .sort((a, b) => b.last24hVolume - a.last24hVolume)
        .slice(0, 20);
    } catch (error) {
      console.error('❌ Error fetching bridge activity:', error);
      return [];
    }
  }
}

export default DefiLlamaService;