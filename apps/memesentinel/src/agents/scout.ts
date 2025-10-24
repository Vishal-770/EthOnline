import * as dotenv from 'dotenv';
import * as cron from 'node-cron';
import { BaseAgent } from '../shared/BaseAgent';
import { DEXService } from '../services/DEXService';
import { MockDEXService } from '../services/MockDEXService';
import DefiLlamaService from '../services/DefiLlamaService';
import CoinGeckoService from '../services/CoinGeckoService';
import { AgentConfig, MemecoinData, A2AMessagePayload, AlertSignal } from '../types';
import { ExecutionEventBus } from '@a2a-js/sdk/server';
import { Message } from '@a2a-js/sdk';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export class MemecoinScoutAgent extends BaseAgent {
  private dexService: DEXService;
  private defiLlamaService: DefiLlamaService;
  private coinGeckoService: CoinGeckoService;
  private receivedAlerts: Map<string, any> = new Map();
  private discoveredTokens: Set<string> = new Set();
  private scanInterval: NodeJS.Timeout | null = null;
  private demoMode: boolean = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';

  constructor() {
    const config: AgentConfig = {
      id: 'memecoin-scout',
      name: 'Memecoin Scout Agent',
      description: 'Detects new token pairs on DEX platforms like Uniswap and SaucerSwap',
      port: parseInt(process.env.SCOUT_AGENT_PORT || '4001'),
      baseUrl: `http://localhost:${process.env.SCOUT_AGENT_PORT || '4001'}`,
      skills: [
        {
          id: 'dex-monitoring',
          name: 'DEX Monitoring',
          description: 'Monitor DEX platforms for new token pairs',
          tags: ['dex', 'monitoring', 'tokens']
        },
        {
          id: 'token-discovery',
          name: 'Token Discovery',
          description: 'Discover and analyze new memecoin tokens',
          tags: ['discovery', 'memecoin', 'analysis']
        }
      ]
    };

    super(config);
    this.dexService = new DEXService();
    this.defiLlamaService = new DefiLlamaService();
    this.coinGeckoService = new CoinGeckoService();
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    console.log('🔍 Memecoin Scout Agent initialized');
    console.log('📊 Starting DEX monitoring...');
    
    // Start periodic scanning
    this.startPeriodicScanning();
    
    // Perform initial scan
    await this.scanForNewTokens();
  }

  private startPeriodicScanning(): void {
    // Scan every 5 minutes for new tokens
    cron.schedule('*/5 * * * *', async () => {
      console.log('🔄 Starting scheduled DEX scan...');
      await this.scanForNewTokens();
    });

    console.log('⏰ Scheduled scanning every 5 minutes');
  }

  private async scanForNewTokens(): Promise<void> {
    try {
      console.log('🔍 Scanning DEX platforms for new tokens...');
      
      let newPairs: MemecoinData[] = [];
      
      if (this.demoMode) {
        console.log('🧪 Demo Mode: Using mock data for testing');
        // Use mock data for testing
        const mockToken = MockDEXService.simulateNewTokenDiscovery();
        if (mockToken) {
          newPairs = [mockToken];
          console.log('🎲 Generated mock token for testing:', mockToken.symbol);
        }
      } else {
        // Use real data sources
        newPairs = await this.discoverNewTokensFromRealData();
        
        // If real data fails, fall back to mock
        if (newPairs.length === 0) {
          console.log('⚠️  Real APIs returned no data, falling back to demo mode...');
          const mockToken = MockDEXService.simulateNewTokenDiscovery();
          if (mockToken) {
            newPairs = [mockToken];
            console.log('🎲 Generated mock token for testing:', mockToken.symbol);
          }
        }
      }
      
      if (newPairs.length === 0) {
        console.log('📈 No new pairs found in the last hour');
        return;
      }

      console.log(`🎯 Found ${newPairs.length} new pairs`);

      for (const pair of newPairs) {
        // Check if we've already discovered this token
        if (this.discoveredTokens.has(pair.address)) {
          continue;
        }

        // Add to discovered tokens
        this.discoveredTokens.add(pair.address);
        
        console.log(`🪙 New memecoin discovered: ${pair.symbol} (${pair.address}) on ${pair.dex}`);

        // Create A2A message for token discovery
        const payload: A2AMessagePayload = {
          messageType: 'token_discovery',
          data: pair,
          agentId: this.config.id,
          timestamp: Date.now(),
          contextId: pair.address // Use token address as conversation thread ID
        };

        // Broadcast discovery to all agents
        await this.sendA2AMessage(payload);

        // Small delay to avoid overwhelming other agents
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('❌ Error during token scanning:', error);
    }
  }

  private async discoverNewTokensFromRealData(): Promise<MemecoinData[]> {
    const discoveredTokens: MemecoinData[] = [];

    try {
      console.log('🚀 Fetching real data from DefiLlama and CoinGecko...');

      // Get DefiLlama data first (more reliable, no rate limits)
      try {
        console.log('📊 Fetching DefiLlama protocols...');
        const topProtocols = await this.defiLlamaService.getTopMemecoinsByTVL(3);
        for (const protocol of topProtocols) {
          discoveredTokens.push({
            symbol: protocol.symbol,
            name: protocol.name,
            address: `dl-${protocol.id}`,
            priceUSD: 0,
            liquidity: protocol.tvl * 0.1,
            marketCap: protocol.tvl,
            dex: 'DefiLlama',
            timestamp: Date.now(),
            volume24h: protocol.tvl * 0.05,
            priceChange24h: protocol.change_1d,
            holders: 0,
            socialScore: Math.round(Math.min(protocol.tvl / 1000000, 100)),
            riskLevel: protocol.tvl > 100000000 ? 'low' : protocol.tvl > 10000000 ? 'medium' : 'high'
          });
        }
        console.log(`✅ DefiLlama: Found ${topProtocols.length} protocols`);
      } catch (error) {
        console.log('⚠️  DefiLlama request failed, continuing...');
      }

      // Get basic CoinGecko data (with rate limit handling)
      try {
        console.log('💰 Fetching CoinGecko memecoins...');
        const memecoins = await this.coinGeckoService.getMemecoins(5);
        for (const memecoin of memecoins.slice(0, 2)) { // Limit to 2 to avoid rate limits
          if (!this.discoveredTokens.has(`cg-${memecoin.symbol}`)) {
            discoveredTokens.push({
              symbol: memecoin.symbol.toUpperCase(),
              name: memecoin.name,
              address: `cg-${memecoin.symbol}`,
              priceUSD: memecoin.current_price,
              liquidity: memecoin.total_volume,
              marketCap: memecoin.market_cap,
              dex: 'CoinGecko Meme',
              timestamp: Date.now(),
              volume24h: memecoin.total_volume,
              priceChange24h: memecoin.price_change_percentage_24h || 0,
              holders: 0,
              socialScore: Math.round(memecoin.market_cap_rank ? (1000 - memecoin.market_cap_rank) / 10 : 50),
              riskLevel: memecoin.market_cap < 10000000 ? 'high' : memecoin.market_cap < 100000000 ? 'medium' : 'low'
            });
          }
        }
        console.log(`✅ CoinGecko: Found ${memecoins.length} memecoins`);
      } catch (error: any) {
        if (error?.message === 'RATE_LIMITED' || error?.message === 'UNAUTHORIZED') {
          console.log('⚠️  CoinGecko rate limited, skipping for now...');
        } else {
          console.log('⚠️  CoinGecko request failed, continuing...');
        }
      }

      // Only try trending if we have few discoveries and haven't been rate limited recently
      if (discoveredTokens.length < 3) {
        try {
          console.log('🔥 Fetching trending tokens...');
          const trending = await this.coinGeckoService.getTrendingTokens();
          for (const trendingToken of trending.coins.slice(0, 1)) { // Only 1 trending token
            discoveredTokens.push({
              symbol: trendingToken.item.symbol.toUpperCase(),
              name: trendingToken.item.name,
              address: `cg-trending-${trendingToken.item.id}`,
              priceUSD: trendingToken.item.price_btc * 70000,
              liquidity: 0,
              marketCap: 0,
              dex: 'CoinGecko Trending',
              timestamp: Date.now(),
              volume24h: 0,
              priceChange24h: 0,
              holders: 0,
              socialScore: trendingToken.item.score || 50,
              riskLevel: 'medium'
            });
          }
          console.log(`✅ Trending: Found ${trending.coins.length} tokens`);
        } catch (error: any) {
          if (error?.message === 'RATE_LIMITED' || error?.message === 'UNAUTHORIZED') {
            console.log('⚠️  Trending API rate limited, skipping...');
          } else {
            console.log('⚠️  Trending request failed, continuing...');
          }
        }
      }

      console.log(`📊 Real data discovery completed: ${discoveredTokens.length} tokens found`);
      return discoveredTokens;

    } catch (error) {
      console.error('❌ Error in real data discovery:', error);
      return [];
    }
  }

  private async calculateSocialScore(tokenDetails: any): Promise<number> {
    try {
      const sentiment = await this.coinGeckoService.analyzeTokenSentiment(tokenDetails.id);
      return sentiment.social_score;
    } catch (error) {
      return 50; // Default score
    }
  }

  private calculateRiskLevel(tokenDetails: any): 'low' | 'medium' | 'high' {
    const marketCap = tokenDetails.market_data.market_cap.usd;
    const volume = tokenDetails.market_data.total_volume.usd;
    const age = Date.now() - new Date(tokenDetails.market_data.ath_date).getTime();
    
    // Risk factors
    const lowMarketCap = marketCap < 10000000; // < $10M
    const lowVolume = volume < marketCap * 0.01; // < 1% of market cap
    const newToken = age < 30 * 24 * 60 * 60 * 1000; // < 30 days
    
    const riskFactors = [lowMarketCap, lowVolume, newToken].filter(Boolean).length;
    
    if (riskFactors >= 2) return 'high';
    if (riskFactors === 1) return 'medium';
    return 'low';
  }

  protected async processMessage(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      switch (payload.messageType) {
        case 'token_discovery':
          await this.handleTokenDiscoveryRequest(payload, eventBus);
          break;
        case 'alert_decision':
          try {
            const raw = payload.data as unknown;
            if (raw && typeof raw === 'object' && ('tokenAddress' in (raw as any) || 'id' in (raw as any))) {
              const alert = raw as AlertSignal;
              const key = alert.tokenAddress ?? alert.id;
              this.receivedAlerts.set(key, alert);
              console.log(`📨 Memecoin Scout Agent received alert for ${alert.symbol ?? key}: ${alert.alertType ?? 'N/A'}`);
            } else {
              console.log('📨 Memecoin Scout Agent received alert_decision with unexpected payload');
            }
          } catch (err) {
            console.error('❌ Error handling alert_decision payload:', err);
          }
          break;
        
        case 'risk_report':
        case 'yield_report':
          // Scout agent shouldn't receive these - they should go to Alert agent
          console.log(`⚠️  Scout agent received ${payload.messageType} - this should go to Alert agent instead`);
          console.log(`📝 Ignoring ${payload.messageType} message (not meant for Scout)`);
          break;
        
        default:
          console.log(`⚠️  Unknown message type: ${payload.messageType}`);
          break;
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
    }
  }

  private async handleTokenDiscoveryRequest(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      // If this is a request for token details, provide them
      if (typeof payload.data === 'string') {
        const tokenAddress = payload.data;
        
        // Check if we know about this token
        if (this.discoveredTokens.has(tokenAddress)) {
          const response: Message = {
            kind: 'message',
            messageId: uuidv4(),
            role: 'agent',
            parts: [{
              kind: 'text',
              text: `Token ${tokenAddress} was discovered by Scout Agent and is being tracked.`
            }],
            contextId: payload.contextId
          };

          eventBus.publish(response);
        } else {
          // Try to get details about this token
          await this.analyzeSpecificToken(tokenAddress, eventBus, payload.contextId);
        }
      }
    } catch (error) {
      console.error('❌ Error handling token discovery request:', error);
    }
  }

  private async analyzeSpecificToken(
    tokenAddress: string,
    eventBus: ExecutionEventBus,
    contextId: string
  ): Promise<void> {
    try {
      console.log(`🔎 Analyzing specific token: ${tokenAddress}`);
      
      // Try to find this token in recent pairs
      const recentPairs = await this.dexService.getNewPairs(86400000); // Last 24 hours
      const foundPair = recentPairs.find(pair => 
        pair.address.toLowerCase() === tokenAddress.toLowerCase() ||
        (pair.token0 && pair.token0.toLowerCase() === tokenAddress.toLowerCase()) ||
        (pair.token1 && pair.token1.toLowerCase() === tokenAddress.toLowerCase())
      );

      if (foundPair) {
        // Add to discovered tokens
        this.discoveredTokens.add(tokenAddress);
        
        // Create discovery payload
        const discoveryPayload: A2AMessagePayload = {
          messageType: 'token_discovery',
          data: foundPair,
          agentId: this.config.id,
          timestamp: Date.now(),
          contextId: contextId
        };

        // Broadcast discovery
        await this.sendA2AMessage(discoveryPayload);

        const response: Message = {
          kind: 'message',
          messageId: uuidv4(),
          role: 'agent',
          parts: [{
            kind: 'text',
            text: `✅ Found token ${foundPair.symbol} (${tokenAddress}) on ${foundPair.dex}. Discovery broadcast to all agents.`
          }],
          contextId: contextId
        };

        eventBus.publish(response);
      } else {
        const response: Message = {
          kind: 'message',
          messageId: uuidv4(),
          role: 'agent',
          parts: [{
            kind: 'text',
            text: `❌ Token ${tokenAddress} not found in recent DEX pairs.`
          }],
          contextId: contextId
        };

        eventBus.publish(response);
      }
    } catch (error) {
      console.error('❌ Error analyzing specific token:', error);
    }
  }

  // Manual scan trigger
  async triggerManualScan(): Promise<void> {
    console.log('🚀 Manual scan triggered');
    await this.scanForNewTokens();
  }

  // Get discovered tokens count
  getDiscoveredTokensCount(): number {
    return this.discoveredTokens.size;
  }

  // Get recent discoveries
  getRecentDiscoveries(limit: number = 10): string[] {
    return Array.from(this.discoveredTokens).slice(-limit);
  }
}

// Start the agent if this file is run directly
if (require.main === module) {
  const agent = new MemecoinScoutAgent();
  
  agent.initialize().catch(error => {
    console.error('❌ Failed to start Memecoin Scout Agent:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Memecoin Scout Agent...');
    await agent.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down Memecoin Scout Agent...');
    await agent.shutdown();
    process.exit(0);
  });
}