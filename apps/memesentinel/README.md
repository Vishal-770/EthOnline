# MemeSentinel: Multi-Agent DeFi Intelligence System

![MemeSentinel Logo](https://via.placeholder.com/800x200/1e293b/ffffff?text=MemeSentinel%20🧠%20🪙%20🚨)

**Powered by Hedera Agent Kit + Google A2A Protocol**

A network of cooperating DeFi agents that autonomously track, analyze, and rate new memecoins using DEX, CoinGecko, and DefiLlama data, communicate using A2A, and settle verified alerts on Hedera.

## 🏗️ Architecture Overview

```
                        ┌──────────────────────────┐
                        │   Personal Assistant     │
                        │  (Chart + Insight Layer) │
                        └──────────┬───────────────┘
                                   │  A2A analytics messages
        ┌──────────────────────────┼─────────────────────────┐
        ▼                          ▼                         ▼
 ┌────────────────┐       ┌────────────────┐         ┌────────────────┐
 │  Yield Agent   │       │  Risk Agent    │         │  Alert Agent   │
 │  APY, TVL calc │       │  Risk/Viral AI │         │  Final alerts  │
 └───────┬────────┘       └──────┬─────────┘         └──────┬────────┘
         │ A2A: reports          │ A2A: risk_report          │ AP2/HCS
         ▼                       ▼                          ▼
 ┌────────────────┐       ┌────────────────┐         ┌────────────────┐
 │ Memecoin Scout │──────▶│ SettlementAgent│────────▶│  Hedera Network│
 │ DEX Discovery  │       │ (AP2, HCS log) │         │  (HTS + HCS)   │
 └────────────────┘       └────────────────┘         └────────────────┘
```

## 🤖 Agents Overview

| Agent | Responsibility | APIs/Tools Used |
|-------|---------------|----------------|
| 🪙 **Memecoin Scout** | Detects new token pairs on DEX | Uniswap, SaucerSwap APIs |
| 📊 **Yield & Liquidity** | Fetches liquidity, APY, TVL data | DefiLlama, CoinGecko |
| ⚠️ **Risk Analysis** | Checks rug risks, ownership, viral potential | On-chain reads, social APIs |
| 🚨 **Alert Agent** | Aggregates reports → issues BUY/WATCH/AVOID | AI decision engine |
| 💵 **Settlement** | Handles transfers, logs to Hedera HCS | Hedera Agent Kit |
| 🧠 **Personal Assistant** | Analytics dashboard, AI chat interface | OpenAI, Chart.js, Express |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- TypeScript
- Hedera testnet account
- OpenAI API key (optional, for AI insights)
- CoinGecko API key (optional, for enhanced data)

### 1. Clone and Install

```bash
cd apps/memesentinel
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required: Hedera credentials
HEDERA_ACCOUNT_ID="0.0.7054997"
HEDERA_PRIVATE_KEY="0x65419e388c36a3966bbcf5844cbc2f840d2885591dbc888a4e2a7b0f63bc48e2"

# Optional: AI insights
OPENAI_API_KEY="your-openai-api-key"

# Optional: Enhanced data
COINGECKO_API_KEY="your-coingecko-api-key"
```

### 3. Build and Start

```bash
# Build the project
npm run build

# Start all agents
npm run dev
```

### 4. Access the Dashboard

Open your browser to: **http://localhost:4106/dashboard**

## 📊 Features

### Real-time Monitoring
- ✅ Continuous DEX monitoring for new memecoin pairs
- ✅ Automated yield and liquidity analysis
- ✅ Smart contract security analysis
- ✅ AI-powered risk assessment

### Intelligent Alerts
- ✅ BUY/WATCH/AVOID signals with confidence scores
- ✅ Multi-factor analysis (APY, risk, viral potential)
- ✅ Immutable audit trail on Hedera HCS
- ✅ Human-in-the-loop approval for trades

### Analytics Dashboard
- ✅ Real-time charts and visualizations
- ✅ AI-powered market insights
- ✅ Interactive chat interface
- ✅ Risk heatmaps and performance tracking

### Blockchain Settlement
- ✅ Hedera HCS for immutable logging
- ✅ Hedera HTS for token operations
- ✅ AP2 protocol for agent rewards
- ✅ Automated settlement with safety checks

## 🎯 Usage

### Dashboard Interface

Access the web dashboard at `http://localhost:4106/dashboard` to:

- View real-time memecoin discoveries
- Monitor yield and risk metrics
- Get AI-powered trading insights
- Chat with the Personal Assistant AI
- Track settlement activities

### Agent Commands

Run individual agents for testing:

```bash
# Run specific agents
npm run scout     # Memecoin discovery
npm run yield     # Liquidity analysis
npm run risk      # Security analysis
npm run alert     # Signal generation
npm run settlement # Hedera settlement
npm run assistant # Dashboard & AI
```

### API Endpoints

Each agent exposes A2A-compliant endpoints:

- **Scout Agent**: `http://localhost:4001`
- **Yield Agent**: `http://localhost:4002`
- **Risk Agent**: `http://localhost:4003`
- **Alert Agent**: `http://localhost:4004`
- **Settlement Agent**: `http://localhost:4005`
- **Assistant Agent**: `http://localhost:4006`

### Chat Interface

Ask the Personal Assistant AI questions like:

- "Show me the risk history of SAUCEINU"
- "What's the 7-day APY trend for $DOGEHBR?"
- "Which memecoin had the biggest liquidity spike today?"
- "Give me a summary of today's top opportunities"

## 🔧 Configuration

### Alert Thresholds

Modify alert criteria in `src/agents/alert.ts`:

```typescript
private readonly thresholds = {
  buySignal: {
    minAPY: 20,        // Minimum 20% APY
    maxRiskScore: 40,  // Maximum 40/100 risk
    minViralPotential: 30,
    minTVL: 10000      // $10k minimum TVL
  },
  // ... more thresholds
};
```

### Scanning Frequency

Adjust monitoring intervals in respective agents:

```typescript
// Scout Agent - scan every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  await this.scanForNewTokens();
});

// Yield Agent - update every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  await this.updateTrackedTokensYield();
});
```

## 🛡️ Security Features

- ✅ Contract verification checks
- ✅ Ownership renouncement verification
- ✅ Honeypot detection
- ✅ Rug pull risk assessment
- ✅ Social sentiment analysis
- ✅ Multi-factor risk scoring

## 🔗 Integration

### Hedera Network

The system integrates with Hedera for:

- **HCS (Consensus Service)**: Immutable alert logging
- **HTS (Token Service)**: Token transfer operations
- **HBAR**: Native currency for settlements
- **Smart Contracts**: Future DeFi integrations

### A2A Protocol

Agent-to-agent communication via:

- Message passing between agents
- Conversation threads per memecoin
- Streaming updates and real-time sync
- Event-driven architecture

### External APIs

Data sources include:

- **Uniswap V2/V3**: DEX pair discovery
- **SaucerSwap**: Hedera-native DEX
- **CoinGecko**: Price and market data
- **DefiLlama**: TVL and yield data
- **Etherscan**: Contract verification

## 📈 Roadmap

### Phase 1: Core System ✅
- [x] Multi-agent architecture
- [x] A2A communication
- [x] Hedera integration
- [x] Basic analytics dashboard

### Phase 2: Advanced Features 🚧
- [ ] Machine learning risk models
- [ ] Social media sentiment analysis
- [ ] Advanced trading strategies
- [ ] Mobile app interface

### Phase 3: Production 🔮
- [ ] Mainnet deployment
- [ ] Professional trading interface
- [ ] API marketplace
- [ ] Agent marketplace

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Join our Discord community
- Check the documentation wiki

## ⚠️ Disclaimer

This is an experimental DeFi tool for educational and research purposes. Always do your own research (DYOR) before making any investment decisions. Cryptocurrency investments carry high risk and can result in total loss.

---

**Built with ❤️ by the MemeSentinel Team**

*Powered by Hedera Agent Kit and Google A2A Protocol*