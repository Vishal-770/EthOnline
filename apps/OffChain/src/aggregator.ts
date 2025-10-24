import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface SocialPost {
  id: string;
  platform: 'twitter' | 'reddit';
  content: string;
  author: string;
  timestamp: string;
  engagement: {
    likes?: number;
    retweets?: number;
    comments?: number;
    upvotes?: number;
  };
  url?: string;
}

export interface AnalyzedToken {
  tokenName: string;
  ticker?: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  trendingScore: number; 
  signals: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  mentionCount: number;
  avgEngagement: number;
  keyPhrases: string[];
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid' | 'scam_alert';
  confidence: number; // 0 to 1
  reasoning: string;
}

export interface AggregatedResult {
  timestamp: string;
  topTrending: AnalyzedToken[];
  totalPostsAnalyzed: number;
  summary: string;
}

class SocialMediaAggregator {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private posts: SocialPost[] = [];

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using Gemini 1.5 Pro for best performance
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
      }
    });
  }

  addPosts(posts: SocialPost[]): void {
    this.posts.push(...posts);
  }

  async analyzeTrends(): Promise<AggregatedResult> {
    console.log(`🤖 Analyzing ${this.posts.length} posts with Gemini AI...`);

    const batchSize = 50;
    const allAnalyzedTokens: AnalyzedToken[] = [];

    for (let i = 0; i < this.posts.length; i += batchSize) {
      const batch = this.posts.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(this.posts.length / batchSize)}...`);

      const analyzed = await this.analyzePostBatch(batch);
      allAnalyzedTokens.push(...analyzed);

      if (i + batchSize < this.posts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const tokenMap = this.aggregateByToken(allAnalyzedTokens);
    
    const topTrending = this.rankTokens(Array.from(tokenMap.values()));

    const summary = await this.generateSummary(topTrending);

    return {
      timestamp: new Date().toISOString(),
      topTrending: topTrending.slice(0, 20),
      totalPostsAnalyzed: this.posts.length,
      summary
    };
  }

  private async analyzePostBatch(posts: SocialPost[]): Promise<AnalyzedToken[]> {
    const postsText = posts.map((p, idx) => 
      `Post ${idx + 1} [${p.platform}] (${p.engagement.likes || p.engagement.upvotes || 0} engagement):\n${p.content}\n---`
    ).join('\n\n');

    const prompt = `You are a crypto market analyst specializing in meme coins and social media trends. Analyze these social media posts and extract cryptocurrency/token mentions with detailed analysis.

Posts to analyze:
${postsText}

For each unique cryptocurrency/token mentioned, provide:
1. Token name and ticker (if mentioned)
2. Sentiment (bullish/bearish/neutral) and sentiment score (-1 to 1)
3. Trending score (0-100) based on frequency and engagement
4. Key signals (pump signals, whale activity, new listings, partnerships, etc.)
5. Risk level (low/medium/high/extreme) - detect scam indicators like "guaranteed returns", "pump signals", suspicious URLs
6. Key phrases that indicate importance
7. Recommendation (strong_buy/buy/hold/avoid/scam_alert)
8. Confidence level (0-1)
9. Brief reasoning

CRITICAL: Be very cautious of:
- Posts with "BIGGEST PUMP SIGNAL" or similar language (likely scams)
- Posts tagging many random users (spam)
- Posts with shortened URLs (t.co links) promoting pumps
- Posts guaranteeing returns or using 🚀🔥 excessively
- Retweet spam and bot-like behavior

Respond with ONLY valid JSON array format (no markdown, no code blocks), No need of any summary only the JSON array.

JSON format:
[
  {
    "tokenName": "string",
    "ticker": "string",
    "sentiment": "bullish|bearish|neutral",
    "sentimentScore": number,
    "trendingScore": number,
    "signals": ["string"],
    "riskLevel": "low|medium|high|extreme",
    "mentionCount": number,
    "avgEngagement": number,
    "keyPhrases": ["string"],
    "recommendation": "strong_buy|buy|hold|avoid|scam_alert",
    "confidence": number,
    "reasoning": "string"
  }
]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Clean the response text (remove markdown code blocks if present)
      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/```json\n?/g, '');
      cleanedText = cleanedText.replace(/```\n?/g, '');
      cleanedText = cleanedText.trim();

      // Extract JSON array
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [];
      }

      console.warn('No valid JSON found in Gemini response');
      return [];
    } catch (error) {
      console.error('Error analyzing batch with Gemini:', error);
      return [];
    }
  }

  private aggregateByToken(tokens: AnalyzedToken[]): Map<string, AnalyzedToken> {
    const tokenMap = new Map<string, AnalyzedToken>();

    for (const token of tokens) {
      const key = (token.ticker || token.tokenName).toLowerCase();
      
      if (tokenMap.has(key)) {
        const existing = tokenMap.get(key)!;
        

        existing.mentionCount += token.mentionCount;
        existing.sentimentScore = (existing.sentimentScore + token.sentimentScore) / 2;
        existing.trendingScore = Math.max(existing.trendingScore, token.trendingScore);
        existing.avgEngagement = (existing.avgEngagement + token.avgEngagement) / 2;
        existing.signals = [...new Set([...existing.signals, ...token.signals])];
        existing.keyPhrases = [...new Set([...existing.keyPhrases, ...token.keyPhrases])];
        

        const riskLevels = ['low', 'medium', 'high', 'extreme'];
        const maxRisk = Math.max(
          riskLevels.indexOf(existing.riskLevel),
          riskLevels.indexOf(token.riskLevel)
        );
        existing.riskLevel = riskLevels[maxRisk] as any;
        

        existing.confidence = (existing.confidence + token.confidence) / 2;
        
        tokenMap.set(key, existing);
      } else {
        tokenMap.set(key, { ...token });
      }
    }

    return tokenMap;
  }


  private rankTokens(tokens: AnalyzedToken[]): AnalyzedToken[] {
    return tokens
      .filter(t => t.recommendation !== 'scam_alert') // Filter out obvious scams
      .sort((a, b) => {
        if (b.trendingScore !== a.trendingScore) {
          return b.trendingScore - a.trendingScore;
        }
        if (b.mentionCount !== a.mentionCount) {
          return b.mentionCount - a.mentionCount;
        }
        return b.sentimentScore - a.sentimentScore;
      });
  }

  private async generateSummary(topTokens: AnalyzedToken[]): Promise<string> {
    if (topTokens.length === 0) {
      return 'No significant tokens found in the analyzed posts.';
    }

    const topFive = topTokens.slice(0, 5).map(t => 
      `${t.tokenName} (${t.ticker || 'N/A'}): ${t.trendingScore}/100 trending, ${t.sentiment} sentiment`
    ).join('\n');

    const avgSentiment = topTokens.length > 0 
      ? (topTokens.reduce((sum, t) => sum + t.sentimentScore, 0) / topTokens.length).toFixed(2)
      : '0.00';

    const prompt = `Based on these top trending crypto tokens from social media analysis, provide a brief 2-3 sentence market summary:

${topFive}

Total tokens analyzed: ${topTokens.length}
Average sentiment: ${avgSentiment}

Provide insights about market sentiment, potential opportunities, and any red flags.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating summary with Gemini:', error);
      return 'Summary unavailable due to an error.';
    }
  }

  exportToJSON(result: AggregatedResult): string {
    return JSON.stringify(result, null, 2);
  }
  clearPosts(): void {
    this.posts = [];
  }
}

async function main() {
  const aggregator = new SocialMediaAggregator("AIzaSyD4t-g8SB6YJTEIrzBwH7eG27myiSi6RYA");

  const samplePosts: SocialPost[] = [
    {
      id: '1',
      platform: 'twitter',
      content: 'BONK is breaking out! 🚀 This could be the next 100x gem. Strong community and solid fundamentals. #memecoin #BONK',
      author: 'crypto_trader_123',
      timestamp: new Date().toISOString(),
      engagement: { likes: 245, retweets: 89, comments: 34 }
    },
    {
      id: '2',
      platform: 'reddit',
      content: 'Why is nobody talking about WIF? The Dogwifhat token has amazing memes and growing adoption. Might be undervalued.',
      author: 'moonshot_hunter',
      timestamp: new Date().toISOString(),
      engagement: { upvotes: 156, comments: 42 }
    },
    {
      id: '3',
      platform: 'twitter',
      content: '🔥 The BIGGEST #Crypto #PUMP #Signal is here! 🚀 Join the action! https://t.co/scamlink $ETH',
      author: 'pump_bot_123',
      timestamp: new Date().toISOString(),
      engagement: { likes: 5, retweets: 2, comments: 0 }
    },
    {
      id: '4',
      platform: 'twitter',
      content: 'Just bought more $PEPE. The chart looks amazing and the community is super active. LFG! 🐸',
      author: 'pepe_enjoyer',
      timestamp: new Date().toISOString(),
      engagement: { likes: 432, retweets: 123, comments: 67 }
    },
    {
      id: '5',
      platform: 'reddit',
      content: 'Floki Inu has real utility now with their DeFi platform. Not just another meme coin anymore.',
      author: 'defi_researcher',
      timestamp: new Date().toISOString(),
      engagement: { upvotes: 289, comments: 78 }
    },
  ];

  aggregator.addPosts(samplePosts);
  
  console.log('🚀 Starting Social Media Aggregator with Gemini AI...\n');
  const result = await aggregator.analyzeTrends();
  
  console.log('\n📊 ANALYSIS RESULTS:\n');
  console.log(aggregator.exportToJSON(result));
  
}

export { SocialMediaAggregator };