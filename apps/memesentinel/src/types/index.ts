export interface MemecoinData {
  address: string;
  symbol: string;
  name: string;
  dex: string;
  pairAddress?: string;
  token0?: string;
  token1?: string;
  createdAt?: number;
  discoveredAt?: number;
  timestamp: number;
  // Price and market data
  priceUSD?: number;
  liquidity?: number;
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number;
  holders?: number;
  socialScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface LiquidityData {
  tokenAddress: string;
  pairAddress: string;
  tvl: number;
  apy: number;
  liquidity: number;
  volume24h: number;
  priceUSD: number;
  timestamp: number;
}

export interface RiskData {
  tokenAddress: string;
  riskScore: number; // 0-100, lower is safer
  rugRisk: boolean;
  ownerRenounced: boolean;
  mintPermissions: boolean;
  viralPotential: number; // 0-100
  socialScore: number;
  contractVerified: boolean;
  honeypotRisk: boolean;
  timestamp: number;
}

export interface AlertSignal {
  id: string;
  tokenAddress: string;
  symbol: string;
  alertType: 'BUY' | 'WATCH' | 'AVOID';
  confidence: number; // 0-100
  reasoning: string;
  yieldData: LiquidityData;
  riskData: RiskData;
  timestamp: number;
  actionTaken?: boolean;
}

export interface A2AMessagePayload {
  messageType: 'token_discovery' | 'yield_report' | 'risk_report' | 'alert_decision' | 'settlement_request';
  data: MemecoinData | LiquidityData | RiskData | AlertSignal;
  agentId: string;
  timestamp: number;
  contextId: string; // memecoin conversation thread
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  port: number;
  baseUrl: string;
  skills: Array<{
    id: string;
    name: string;
    description: string;
    tags: string[];
  }>;
}

export interface HederaConfig {
  accountId: string;
  privateKey: string;
  network: 'testnet' | 'mainnet';
}

export interface DashboardData {
  totalTokensTracked: number;
  activeAlerts: AlertSignal[];
  topPerformers: Array<{
    symbol: string;
    address: string;
    apy: number;
    riskScore: number;
    growth24h: number;
  }>;
  riskHeatmap: Array<{
    symbol: string;
    risk: number;
    yield: number;
  }>;
  recentActivity: A2AMessagePayload[];
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }>;
}