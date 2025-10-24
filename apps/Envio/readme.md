# Envio Backend API

Backend API service for token analytics using Envio Hypersync and on-chain data.

## Features

- 🔗 Fetch token metadata from blockchain
- 📊 Aggregate token analytics data  
- 💱 Track token transactions
- 🚀 Real-time data from Hypersync
- 📈 DexScreener market data integration

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm, yarn, or pnpm

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the following variables in `.env`:
- `HYPERSYNC_BEARER_TOKEN` - Your Hypersync API token
- `RPC_URL` - Ethereum RPC endpoint  
- `PORT` - Server port (default: 3001)

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

- `GET /` - Health check
- `GET /token-metadata/:address` - Token metadata and analytics
- `GET /token-addresses` - List of tracked tokens
- `GET /transactions/:address` - Token transactions

## Deployment

### Docker

```bash
docker-compose up -d
```

### Railway/Render/Heroku

See full deployment guide in the README.

## Data Flow Architecture

📁 Input Data
    ├── token_transactions.json (6,896 transactions)
    └── token_analysis.json (market data)
           ↓
    ┌──────────────────────────────────┐
    │   1. DATA LOADING PHASE          │
    └──────────────────────────────────┘
           ↓
    addTransactions() → Sort by timestamp
    addTokenData() → Store market info
           ↓
    ┌──────────────────────────────────┐
    │   2. ANALYSIS PHASE              │
    │   analyzeOnChain()               │
    └──────────────────────────────────┘
           ↓
    ┌─────────────────────────────────────────┐
    │  3. METRIC CALCULATIONS (Parallel)      │
    ├─────────────────────────────────────────┤
    │  A. Volume Analysis                     │
    │     - Parse all transaction values      │
    │     - Calculate 24h/7d/30d volumes      │
    │     - Find avg/median values            │
    │                                         │
    │  B. Address Analysis                    │
    │     - Extract unique addresses          │
    │     - Count active participants         │
    │     - Calculate tx velocity             │
    │                                         │
    │  C. Whale Detection                     │
    │     - Identify large txs (>1% supply)   │
    │     - Calculate whale volume            │
    │     - Track concentration               │
    │                                         │
    │  D. Buy/Sell Pressure                   │
    │     - Detect DEX interactions           │
    │     - Calculate buy vs sell ratio       │
    │     - Compare avg sizes                 │
    │                                         │
    │  E. Distribution Analysis               │
    │     - Build holder balance map          │
    │     - Calculate Gini coefficient        │
    │     - Measure top 10 concentration      │
    │                                         │
    │  F. Time Pattern Analysis               │
    │     - Find peak activity hours          │
    │     - Identify most active days         │
    │     - Detect trends                     │
    │                                         │
    │  G. Risk Detection                      │
    │     - Check for wash trading            │
    │     - Detect honeypot patterns          │
    │     - Flag suspicious spikes            │
    └─────────────────────────────────────────┘
           ↓
    ┌──────────────────────────────────┐
    │   4. SCORING PHASE               │
    └──────────────────────────────────┘
           ↓
    Calculate 4 core scores:
    ├── Liquidity Health (0-100)
    ├── Activity Score (0-100)
    ├── Distribution Score (0-100)
    └── Momentum Score (-100 to +100)
           ↓
    ┌──────────────────────────────────┐
    │   5. COMBINATION PHASE           │
    │   generateCombinedAnalysis()     │
    └──────────────────────────────────┘
           ↓
    Combine all metrics:
    ├── Calculate overall score
    ├── Determine investment signal
    ├── Assess risk level
    ├── Generate insights
    └── Create warnings/opportunities
           ↓
    ┌──────────────────────────────────┐
    │   6. OUTPUT PHASE                │
    └──────────────────────────────────┘
           ↓
    📊 Final JSON Output



# Endpoint details
1. Get all the address from ERC20 contract
http://localhost:3001/token-addresses

2. Get the meta data of the a token
http://localhost:3001/token-metadata/{address}
eg: http://localhost:3001/token-metadata/0x40e5a14e1d151f34fea6b8e6197c338e737f9bf2

3. Get the transactions fo the token
http://localhost:3001/transactions/{address}
eg: http://localhost:3001/transactions/0x40e5a14e1d151f34fea6b8e6197c338e737f9bf2





# 🚀 Envio API — On-Chain Token Analyzer

This service fetches token data, analyzes on-chain activity, computes a **trending score**, and stores results in **Redis** for fast access.  
Built with **Express**, **Redis**, and **TypeScript**.

---

## ⚙️ Setup

1. Install dependencies:
   ```bash
   npm install
Start the server:

bash
Copy code
npm run dev
The API will run at:
http://localhost:3001

🧩 API Endpoints
1️⃣ GET /
Description: Health check endpoint — confirms the API is running.

Example Request:

bash
Copy code
curl http://localhost:3001/
Example Response:

json
Copy code
"Envio API is running"
2️⃣ POST /dbinit
Description:
Fetches all tokens from the blockchain, analyzes them, calculates their Trending Scores, and stores results in Redis.
This endpoint is typically used during the initial setup.

Example Request:

bash
Copy code
curl -X POST http://localhost:3001/dbinit
Example Response:

json
Copy code
{
  "message": "Database initialized successfully"
}
What happens under the hood:

Calls fetchTokenAddresses() → fetches all tokens

Calls getAllTokenTransactions() for each token

Calls metadata() → fetches token details

Runs OnChainAggregator to compute metrics

Calculates a Trending Score and stores it in Redis

Each token entry in Redis looks like:

json
Copy code
{
  "address": "0x1234...",
  "trendingscore": 78,
  "block": 21785432,
  "timestamp": 1735068410
}
3️⃣ POST /refresh-tokens
Description:
Fetches only the newly deployed tokens (e.g., from the past 2 days), analyzes them, and updates Redis — skipping tokens that already exist.

Example Request:

bash
Copy code
curl -X POST http://localhost:3001/refresh-tokens
Example Response:

json
Copy code
{
  "message": "New tokens fetched and updated successfully"
}
Behavior:

Calls fetchTokenAddresses(2) → looks back 2 days

Skips tokens that already exist in Redis

Calculates and updates trending scores for new ones

4️⃣ Scheduled Task (⏰ Hourly Auto-Refresh)
Description:
Automatically fetches and analyzes new tokens every hour, using the same logic as /refresh-tokens.

You can adjust the interval in src/index.ts:

ts
Copy code
setInterval(async () => {
  ...
}, 60 * 60 * 1000); // every 1 hour
For testing, it’s currently set to every 3 minutes.

📦 Redis Data Example
After successful initialization or refresh, Redis will contain entries like:

Key (Token Address)	Value
0xabc123...	{"address":"0xabc123...","trendingscore":74,"block":21785432,"timestamp":1735068410}
0xdef456...	{"address":"0xdef456...","trendingscore":88,"block":21785490,"timestamp":1735070012}

📊 Trending Score Formula
ts
Copy code
score =
  (activityScore * 0.25) +
  (liquidityHealthScore * 0.2) +
  (distributionScore * 0.15) +
  (momentumScore * 0.1) +
  (Math.min(buyVsSellRatio, 100) * 0.1) +
  (Math.max(priceChange24h, -100) / 2);
Scores are normalized between 0–100

Represents token’s on-chain popularity & health

🧠 Tech Stack
Express.js — API server

Redis — Fast in-memory data storage

TypeScript — Type safety and maintainability

OnChainAggregator — Custom analytics engine

🧪 Example Workflow
Start the server

Run /dbinit to populate Redis

Run /refresh-tokens every few hours (auto-scheduled or manually)

Read from Redis for fast trending-token data

