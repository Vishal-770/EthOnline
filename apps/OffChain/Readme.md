┌─────────────────────────────────────────────────────────────┐
│                    HYBRID TRENDING SYSTEM                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐         ┌────────────────┐              │
│  │   Database    │◄────────┤  Cache Layer   │              │
│  │   (Persistent)│         │  (In-Memory)   │              │
│  └───────────────┘         └────────────────┘              │
│          ▲                         ▲                         │
│          │                         │                         │
│  ┌───────┴─────────────────────────┴────────┐              │
│  │         Orchestrator Engine              │              │
│  │   (Decides what/when to update)          │              │
│  └───────┬─────────────────────────┬────────┘              │
│          │                         │                         │
│  ┌───────▼────────┐       ┌───────▼────────┐              │
│  │  On-Chain      │       │  Social Media  │              │
│  │  Aggregator    │       │  Aggregator    │              │
│  └────────────────┘       └────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## **🔄 Three-Phase Strategy**

### **Phase 1: Initial Bootstrap (Run Once at Startup)**
### **Phase 2: Continuous On-Chain Monitoring (Every 1-5 minutes)**
### **Phase 3: Smart Social Updates (Every 5-15 minutes, selective)**

---

## **Phase 1: Initial Bootstrap** 🚀

**Goal**: Create initial trending list using ONLY on-chain data

### **Step 1.1: Collect Token Universe**
```
Input: List of ALL tokens you want to track (e.g., 1000 tokens)

For each token:
  └── Fetch historical transactions (via your indexer)
  └── Fetch current market data (DexScreener API)
  └── Store in database
```

### **Step 1.2: Batch On-Chain Analysis**
```
For each token (parallel processing in batches of 50):
  ├── Run OnChainAggregator.analyzeOnChain()
  ├── Calculate base scores:
  │   ├── Activity Score (0-100)
  │   ├── Liquidity Score (0-100)
  │   ├── Distribution Score (0-100)
  │   ├── Momentum Score (-100 to +100)
  │   └── Risk Score (0-100)
  │
  └── Calculate Initial Trending Score:
      TrendingScore = (
        Activity * 0.3 +
        Liquidity * 0.2 +
        Distribution * 0.1 +
        (50 + Momentum/2) * 0.3 +
        (100 - Risk) * 0.1
      )
```

### **Step 1.3: Create Initial Ranking**
```
Sort all tokens by TrendingScore (descending)

Save to database:
  ├── token_scores table
  │   ├── address
  │   ├── trending_score
  │   ├── on_chain_score
  │   ├── social_score = NULL (initially)
  │   ├── last_updated
  │   └── update_priority (high/medium/low)
  │
  └── Set update_priority:
      ├── Top 20 tokens → high (update every 5 min)
      ├── Rank 21-100 → medium (update every 30 min)
      └── Rank 100+ → low (update every 2 hours)
```

**Output**: Initial trending list ranked purely by on-chain metrics

---

## **Phase 2: Continuous On-Chain Monitoring** ⚡

**Goal**: Keep on-chain data fresh without overwhelming the system

### **Strategy: Tiered Update System**
```
┌──────────────────────────────────────────────────────┐
│              UPDATE FREQUENCY TIERS                   │
├──────────────────────────────────────────────────────┤
│                                                        │
│  Tier 1 (High Priority) - Top 20 tokens               │
│  └── Update every: 5 minutes                          │
│  └── Reason: Most volatile, user-watched             │
│                                                        │
│  Tier 2 (Medium Priority) - Rank 21-100               │
│  └── Update every: 30 minutes                         │
│  └── Reason: Moderate activity                        │
│                                                        │
│  Tier 3 (Low Priority) - Rank 100+                    │
│  └── Update every: 2 hours                            │
│  └── Reason: Low activity, background monitoring      │
│                                                        │
└──────────────────────────────────────────────────────┘
```

### **Implementation Flow**
```
Every 1 minute (Background Job):

1. Check which tokens need updates:
   current_time = now()
   
   tokens_to_update = SELECT * FROM token_scores WHERE
     (priority = 'high' AND last_updated < current_time - 5 min) OR
     (priority = 'medium' AND last_updated < current_time - 30 min) OR
     (priority = 'low' AND last_updated < current_time - 2 hours)

2. Fetch new transaction data:
   FOR each token in tokens_to_update:
     └── Query indexer for new transactions since last_updated
     └── If new transactions exist:
         ├── Run incremental on-chain analysis
         └── Update scores in database

3. Recalculate rankings:
   └── Re-sort all tokens by trending_score
   └── Update priority tiers based on new ranks

4. Cache the top 100:
   └── Store in Redis/memory for fast API access
```

---

## **Phase 3: Smart Social Media Updates** 🐦

**Goal**: Add social sentiment ONLY for tokens that are actually trending

### **Strategy: Selective Social Fetching**
```
Every 5 minutes (Separate Job):

1. Identify candidates for social analysis:
   
   candidates = Top 20 tokens by current trending_score
   
   WHY ONLY TOP 20?
   ├── Social APIs have rate limits (Twitter: 450 req/15min)
   ├── Social data only matters for trending tokens
   ├── Users only care about top performers
   └── Cost optimization (AI analysis is expensive)

2. Fetch social media posts:
   
   FOR each token in candidates:
     └── Search Twitter/Reddit for: "$SYMBOL" OR "TokenName"
     └── Time range: Last 24 hours
     └── Collect:
         ├── Posts mentioning the token
         ├── Engagement metrics
         └── Sentiment indicators

3. Analyze with AI:
   
   posts_batch = Combine all posts for top 20 tokens
   
   social_analysis = SocialMediaAggregator.analyzeTrends(posts_batch)
   
   FOR each token in social_analysis:
     └── Calculate social_score (0-100):
         social_score = (
           sentiment_score * 40 +
           trending_score * 30 +
           engagement_rate * 20 +
           mention_velocity * 10
         )

4. Update database:
   
   UPDATE token_scores SET
     social_score = calculated_score,
     social_last_updated = now()
   WHERE address IN (top_20_addresses)
```

### **Combining On-Chain + Social Scores**
```
FINAL_TRENDING_SCORE Calculation:

IF token has social_score:
  └── FINAL_SCORE = (
        on_chain_score * 0.60 +    ← Still primary signal
        social_score * 0.40         ← Bonus for social buzz
      )

ELSE (no social data):
  └── FINAL_SCORE = on_chain_score  ← Pure on-chain ranking

Re-rank ALL tokens by FINAL_SCORE





🚀 OffChain API

The OffChain API is a backend service that connects to Redis Cloud, fetches and updates token analytics data, and exposes REST endpoints for social sentiment–based token rankings.
It integrates social media analytics with on-chain scores and provides fast access to data for dashboards or web apps.

⚙️ Tech Stack

Node.js + Express

TypeScript

Redis Cloud (for caching & storage)

CORS-enabled REST API

🧠 Features

✅ Fetch and rank tokens stored in Redis
✅ Merge on-chain and social sentiment scores
✅ Cache token rankings for performance
✅ Auto-update tokens in rank batches
✅ Expose clean API endpoints for frontend consumption

🔧 Environment Variables

Create a .env file in the same directory as your index.ts:

REDIS_HOST=redis-13615.c277.us-east-1-3.ec2.redns.redis-cloud.com
REDIS_PORT=13615
REDIS_USERNAME=default
REDIS_PASSWORD=pDQQrMEE5RQ9aMMqBw4WdKWItjNYmWHB
GOOGLE_API_KEY=your_google_api_key

🧩 API Endpoints
Endpoint	Method	Description
/	GET	Health check for the API
/allposts	GET	Fetch all aggregated posts
/tokenpost	POST	Get posts for specific tokens
/social-analytics	POST	Run social analysis (Twitter + Reddit)
/update-social-scores	POST	Update token social scores in Redis
/token/:address	GET	Fetch a token’s full data by address
/top-tokens?limit=50	GET	Get top-ranked tokens sorted by score
/clear-cache	POST	Clear the in-memory cache
🧮 Scoring Logic

Each token’s final score combines on-chain and social data:

finalScore = (0.6 × onChainTrendingScore) + (0.4 × socialScore)


Social Score is computed from:

Sentiment

Mentions & engagement

Risk level (low / medium / high)

Confidence of analysis

🕒 Automatic Updates

The API automatically updates token scores at different intervals:

Rank Range	Frequency
0–20	Every 5 minutes
20–100	Every 20 minutes
100+	Every 30 minutes

Manual trigger:

POST /update-social-scores

🪄 Run Locally
npm install
npm run dev


API runs on:
👉 http://localhost:3002

📊 Example Request
curl -X POST http://localhost:3002/update-social-scores \
  -H "Content-Type: application/json" \
  -d '{"startRank":0,"endRank":20}'
