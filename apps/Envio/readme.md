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