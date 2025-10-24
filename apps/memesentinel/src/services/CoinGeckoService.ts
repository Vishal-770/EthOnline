import axios, { AxiosResponse } from 'axios';

export interface CoinGeckoToken {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface TrendingToken {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
  };
}

export interface TokenDetails {
  id: string;
  symbol: string;
  name: string;
  description: {
    en: string;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
  };
  market_cap_rank: number;
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
  };
  community_data: {
    facebook_likes: number;
    twitter_followers: number;
    reddit_average_posts_48h: number;
    reddit_average_comments_48h: number;
    reddit_subscribers: number;
    reddit_accounts_active_48h: number;
    telegram_channel_user_count: number;
  };
  developer_data: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
    pull_requests_merged: number;
    pull_request_contributors: number;
    code_additions_deletions_4_weeks: {
      additions: number;
      deletions: number;
    };
    commit_count_4_weeks: number;
  };
}

export interface PriceHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  constructor() {
    // No API key required for basic endpoints
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const config: any = {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MemeSentinel/1.0.0'
      },
      params
    };

    const maxRetries = 3;
    let attempt = 0;
    const baseDelay = 1000; // ms

    while (true) {
      try {
        const response: AxiosResponse<T> = await axios.get(`${this.baseUrl}${endpoint}`, config);
        return response.data;
      } catch (error: any) {
        attempt += 1;
        const status = error?.response?.status;

        // Retry on 429 rate limit and on network/proxy errors (no response)
        if ((status === 429 || !error?.response) && attempt <= maxRetries) {
          const jitter = Math.floor(Math.random() * 300);
          const delay = baseDelay * Math.pow(2, attempt - 1) + jitter;
          console.warn(`⏳ CoinGecko rate limited or transient error (status=${status}), retry ${attempt}/${maxRetries} after ${delay}ms`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        // Log and map common statuses
        console.error(`❌ CoinGecko API Error for ${endpoint}:`, status || error.message);
        if (status === 429) throw new Error('RATE_LIMITED');
        if (status === 401) throw new Error('UNAUTHORIZED');

        throw new Error(`CoinGecko API request failed: ${error.message}`);
      }
    }
  }

  // Market Data
  async getMarketData(vs_currency = 'usd', order = 'market_cap_desc', per_page = 100, page = 1): Promise<CoinGeckoToken[]> {
    return this.makeRequest<CoinGeckoToken[]>('/coins/markets', {
      vs_currency,
      order,
      per_page,
      page,
      sparkline: false,
      price_change_percentage: '24h,7d'
    });
  }

  async getTrendingTokens(): Promise<{ coins: TrendingToken[] }> {
    return this.makeRequest<{ coins: TrendingToken[] }>('/search/trending');
  }

  async getTokenDetails(tokenId: string): Promise<TokenDetails> {
    return this.makeRequest<TokenDetails>(`/coins/${tokenId}`, {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: true,
      developer_data: true,
      sparkline: false
    });
  }

  async getTokenPrice(tokenIds: string[], vs_currencies = ['usd'], include_24hr_change = true): Promise<any> {
    return this.makeRequest(`/simple/price`, {
      ids: tokenIds.join(','),
      vs_currencies: vs_currencies.join(','),
      include_24hr_change,
      include_24hr_vol: true,
      include_market_cap: true,
      include_last_updated_at: true
    });
  }

  async getTokenHistory(tokenId: string, days = 30, vs_currency = 'usd'): Promise<PriceHistory> {
    return this.makeRequest<PriceHistory>(`/coins/${tokenId}/market_chart`, {
      vs_currency,
      days,
      interval: days > 90 ? 'daily' : 'hourly'
    });
  }

  async searchTokens(query: string): Promise<any> {
    return this.makeRequest('/search', { query });
  }

  async getCategoryData(categoryId: string): Promise<any[]> {
    return this.makeRequest('/coins/markets', {
      vs_currency: 'usd',
      category: categoryId,
      order: 'market_cap_desc',
      per_page: 50,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h,7d,30d'
    });
  }

  // Exchange Data
  async getExchanges(): Promise<any[]> {
    return this.makeRequest('/exchanges', {
      per_page: 50,
      page: 1
    });
  }

  async getExchangeTickers(exchangeId: string): Promise<any> {
    return this.makeRequest(`/exchanges/${exchangeId}/tickers`, {
      coin_ids: '',
      include_exchange_logo: false,
      page: 1,
      depth: false,
      order: 'volume_desc'
    });
  }

  // DeFi & Yield
  async getDeFiTokens(): Promise<CoinGeckoToken[]> {
    return this.makeRequest<CoinGeckoToken[]>('/coins/markets', {
      vs_currency: 'usd',
      category: 'decentralized-finance-defi',
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h,7d'
    });
  }

  async getYieldFarmingTokens(): Promise<CoinGeckoToken[]> {
    return this.makeRequest<CoinGeckoToken[]>('/coins/markets', {
      vs_currency: 'usd',
      category: 'yield-farming',
      order: 'market_cap_desc',
      per_page: 50,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h,7d'
    });
  }

  // Helper Methods for MemeSentinel
  async getMemecoins(limit = 50): Promise<CoinGeckoToken[]> {
    try {
      // Get tokens from meme category
      const memeTokens = await this.makeRequest<CoinGeckoToken[]>('/coins/markets', {
        vs_currency: 'usd',
        category: 'meme-token',
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d'
      });

      return memeTokens;
    } catch (error) {
      console.error('❌ Error fetching memecoins:', error);
      return [];
    }
  }

  async getTopGainers(timeframe = '24h', limit = 20): Promise<CoinGeckoToken[]> {
    try {
      const tokens = await this.getMarketData('usd', 'percent_change_24h_desc', limit);
      return tokens.filter(token => token.price_change_percentage_24h > 0);
    } catch (error) {
      console.error('❌ Error fetching top gainers:', error);
      return [];
    }
  }

  async getTopLosers(timeframe = '24h', limit = 20): Promise<CoinGeckoToken[]> {
    try {
      const tokens = await this.getMarketData('usd', 'percent_change_24h_asc', limit);
      return tokens.filter(token => token.price_change_percentage_24h < 0);
    } catch (error) {
      console.error('❌ Error fetching top losers:', error);
      return [];
    }
  }

  async getHighVolumeTokens(limit = 20): Promise<CoinGeckoToken[]> {
    try {
      return this.getMarketData('usd', 'volume_desc', limit);
    } catch (error) {
      console.error('❌ Error fetching high volume tokens:', error);
      return [];
    }
  }

  async analyzeTokenSentiment(tokenId: string): Promise<{
    social_score: number;
    developer_activity: number;
    community_strength: number;
    price_momentum: number;
  }> {
    try {
      const details = await this.getTokenDetails(tokenId);
      const history = await this.getTokenHistory(tokenId, 7);

      // Calculate sentiment scores
      const social_score = this.calculateSocialScore(details.community_data);
      const developer_activity = this.calculateDevScore(details.developer_data);
      const community_strength = this.calculateCommunityStrength(details.community_data);
      const price_momentum = this.calculatePriceMomentum(history.prices);

      return {
        social_score,
        developer_activity,
        community_strength,
        price_momentum
      };
    } catch (error) {
      console.error('❌ Error analyzing token sentiment:', error);
      return {
        social_score: 0,
        developer_activity: 0,
        community_strength: 0,
        price_momentum: 0
      };
    }
  }

  private calculateSocialScore(community: any): number {
    const twitter = Math.min(community.twitter_followers / 100000, 1) * 30;
    const reddit = Math.min(community.reddit_subscribers / 50000, 1) * 25;
    const telegram = Math.min(community.telegram_channel_user_count / 10000, 1) * 25;
    const activity = Math.min(community.reddit_accounts_active_48h / 1000, 1) * 20;
    
    return Math.round(twitter + reddit + telegram + activity);
  }

  private calculateDevScore(developer: any): number {
    if (!developer) return 0;
    
    const commits = Math.min(developer.commit_count_4_weeks / 100, 1) * 40;
    const contributors = Math.min(developer.pull_request_contributors / 20, 1) * 30;
    const stars = Math.min(developer.stars / 1000, 1) * 20;
    const issues = Math.min(developer.closed_issues / developer.total_issues || 0, 1) * 10;
    
    return Math.round(commits + contributors + stars + issues);
  }

  private calculateCommunityStrength(community: any): number {
    const engagement = (community.reddit_average_posts_48h + community.reddit_average_comments_48h) / 100;
    const size = Math.min((community.twitter_followers + community.reddit_subscribers) / 100000, 1);
    
    return Math.round(Math.min(engagement * 50 + size * 50, 100));
  }

  private calculatePriceMomentum(prices: [number, number][]): number {
    if (prices.length < 2) return 0;
    
    const recent = prices.slice(-24); // Last 24 hours
    const trend = recent.reduce((acc, curr, idx) => {
      if (idx === 0) return 0;
      return acc + (curr[1] > recent[idx - 1][1] ? 1 : -1);
    }, 0);
    
    return Math.max(0, Math.min(100, 50 + trend * 2));
  }
}

export default CoinGeckoService;