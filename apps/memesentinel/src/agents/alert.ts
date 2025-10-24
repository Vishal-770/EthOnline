import * as dotenv from 'dotenv';
import * as cron from 'node-cron';
import { BaseAgent } from '../shared/BaseAgent';
import { AgentConfig, MemecoinData, LiquidityData, RiskData, AlertSignal, A2AMessagePayload } from '../types';
import { ExecutionEventBus } from '@a2a-js/sdk/server';
import { Message } from '@a2a-js/sdk';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

interface TokenAnalysisData {
  discovery: MemecoinData;
  yield: LiquidityData | null;
  risk: RiskData | null;
  lastUpdated: number;
}

export class AlertAgent extends BaseAgent {
  private tokenAnalyses: Map<string, TokenAnalysisData> = new Map();
  private generatedAlerts: Map<string, AlertSignal> = new Map();
  private pendingDecisions: Map<string, TokenAnalysisData> = new Map();
  
  // Alert thresholds
  private readonly thresholds = {
    buySignal: {
      minAPY: 20,
      maxRiskScore: 40,
      minViralPotential: 30,
      minTVL: 10000
    },
    watchSignal: {
      minAPY: 10,
      maxRiskScore: 70,
      minViralPotential: 20,
      minTVL: 5000
    },
    avoidSignal: {
      maxRiskScore: 80,
      rugRisk: true,
      honeypotRisk: true
    }
  };

  constructor() {
    const config: AgentConfig = {
      id: 'alert-agent',
      name: 'Alert Agent',
      description: 'Aggregates reports from other agents and issues BUY/WATCH/AVOID alerts',
      port: parseInt(process.env.ALERT_AGENT_PORT || '4004'),
      baseUrl: `http://localhost:${process.env.ALERT_AGENT_PORT || '4004'}`,
      skills: [
        {
          id: 'signal-generation',
          name: 'Signal Generation',
          description: 'Generate trading signals based on aggregated data',
          tags: ['trading', 'signals', 'alerts']
        },
        {
          id: 'risk-assessment',
          name: 'Risk Assessment',
          description: 'Assess overall investment risk',
          tags: ['risk', 'assessment', 'analysis']
        },
        {
          id: 'decision-making',
          name: 'Decision Making',
          description: 'Make investment recommendations',
          tags: ['decisions', 'recommendations', 'investment']
        }
      ]
    };

    super(config);
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    console.log('🚨 Alert Agent initialized');
    console.log('🎯 Starting signal generation...');
    
    // Start periodic decision making
    this.startPeriodicDecisionMaking();
    
    // Process pending decisions
    this.processPendingDecisions();
  }

  private startPeriodicDecisionMaking(): void {
    // Make decisions every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      console.log('🔄 Starting scheduled decision making...');
      await this.makePendingDecisions();
    });

    // Generate daily alert summary
    cron.schedule('0 9 * * *', async () => {
      console.log('📊 Generating daily alert summary...');
      await this.generateDailyAlertSummary();
    });

    console.log('⏰ Scheduled decision making every 5 minutes');
  }

  private async makePendingDecisions(): Promise<void> {
    try {
      const pendingTokens = Array.from(this.pendingDecisions.entries());
      
      if (pendingTokens.length === 0) {
        console.log('🎯 No pending decisions to make');
        return;
      }

      console.log(`🤔 Making decisions for ${pendingTokens.length} tokens...`);

      for (const [tokenAddress, analysisData] of pendingTokens) {
        // Only generate alerts if we have actual discovery data
        if (analysisData.discovery && analysisData.discovery.symbol) {
          await this.generateAlert(tokenAddress, analysisData);
        } else {
          console.log(`⚠️  Skipping alert for ${tokenAddress} - missing discovery data`);
        }
      }

      // Clear processed decisions
      this.pendingDecisions.clear();
    } catch (error) {
      console.error('❌ Error making decisions:', error);
    }
  }

  private async generateAlert(tokenAddress: string, analysisData: TokenAnalysisData): Promise<void> {
    try {
      const { discovery, yield: yieldData, risk: riskData } = analysisData;

      // Skip if we don't have both yield and risk data
      if (!yieldData || !riskData) {
        console.log(`⏸️  Insufficient data for ${discovery.symbol}, waiting for more analysis...`);
        return;
      }

      console.log(`🎯 Generating alert for ${discovery.symbol} (${tokenAddress})`);

      const alertSignal = this.calculateAlertSignal(discovery, yieldData, riskData);
      
      if (alertSignal) {
        // Store the alert
        this.generatedAlerts.set(tokenAddress, alertSignal);
        
        console.log(`🚨 ${alertSignal.alertType} signal generated for ${discovery.symbol}: ${alertSignal.reasoning}`);

        // Send alert to other agents
        const payload: A2AMessagePayload = {
          messageType: 'alert_decision',
          data: alertSignal,
          agentId: this.config.id,
          timestamp: Date.now(),
          contextId: tokenAddress
        };

        await this.sendA2AMessage(payload);

        // Send to Settlement Agent for potential action
        if (alertSignal.alertType === 'BUY' && process.env.ENABLE_HUMAN_IN_LOOP !== 'true') {
          await this.sendA2AMessage(payload, ['agent-4005']); // Settlement Agent
        }
      }
    } catch (error) {
      console.error(`❌ Error generating alert for ${tokenAddress}:`, error);
    }
  }

  private calculateAlertSignal(
    discovery: MemecoinData,
    yieldData: LiquidityData,
    riskData: RiskData
  ): AlertSignal | null {
    const { buySignal, watchSignal, avoidSignal } = this.thresholds;

    // Check for AVOID signals first (highest priority)
    if (
      riskData.riskScore >= avoidSignal.maxRiskScore ||
      riskData.rugRisk ||
      riskData.honeypotRisk
    ) {
      return this.createAlertSignal(
        discovery,
        yieldData,
        riskData,
        'AVOID',
        this.calculateAvoidConfidence(riskData),
        this.generateAvoidReasoning(riskData)
      );
    }

    // Check for BUY signals
    if (
      yieldData.apy >= buySignal.minAPY &&
      riskData.riskScore <= buySignal.maxRiskScore &&
      riskData.viralPotential >= buySignal.minViralPotential &&
      yieldData.tvl >= buySignal.minTVL &&
      riskData.ownerRenounced &&
      riskData.contractVerified
    ) {
      return this.createAlertSignal(
        discovery,
        yieldData,
        riskData,
        'BUY',
        this.calculateBuyConfidence(yieldData, riskData),
        this.generateBuyReasoning(yieldData, riskData)
      );
    }

    // Check for WATCH signals
    if (
      yieldData.apy >= watchSignal.minAPY &&
      riskData.riskScore <= watchSignal.maxRiskScore &&
      riskData.viralPotential >= watchSignal.minViralPotential &&
      yieldData.tvl >= watchSignal.minTVL
    ) {
      return this.createAlertSignal(
        discovery,
        yieldData,
        riskData,
        'WATCH',
        this.calculateWatchConfidence(yieldData, riskData),
        this.generateWatchReasoning(yieldData, riskData)
      );
    }

    // If no clear signal, create a neutral watch
    return this.createAlertSignal(
      discovery,
      yieldData,
      riskData,
      'WATCH',
      30,
      'Token requires further monitoring before making investment decision.'
    );
  }

  private createAlertSignal(
    discovery: MemecoinData,
    yieldData: LiquidityData,
    riskData: RiskData,
    alertType: 'BUY' | 'WATCH' | 'AVOID',
    confidence: number,
    reasoning: string
  ): AlertSignal {
    console.log(`🔍 DEBUG: Creating alert for ${discovery.symbol || 'UNKNOWN'} (${discovery.address})`);
    return {
      id: uuidv4(),
      tokenAddress: discovery.address,
      symbol: discovery.symbol,
      alertType,
      confidence,
      reasoning,
      yieldData,
      riskData,
      timestamp: Date.now(),
      actionTaken: false
    };
  }

  private calculateBuyConfidence(yieldData: LiquidityData, riskData: RiskData): number {
    let confidence = 60; // Base confidence for buy signal

    // APY factor (max +30 points)
    if (yieldData.apy > 50) confidence += 30;
    else if (yieldData.apy > 30) confidence += 20;
    else if (yieldData.apy > 20) confidence += 10;

    // Risk factor (max -40 points)
    confidence -= riskData.riskScore * 0.4;

    // Viral potential (max +10 points)
    confidence += riskData.viralPotential * 0.1;

    // TVL factor
    if (yieldData.tvl > 100000) confidence += 10;
    else if (yieldData.tvl > 50000) confidence += 5;

    return Math.max(0, Math.min(100, confidence));
  }

  private calculateWatchConfidence(yieldData: LiquidityData, riskData: RiskData): number {
    let confidence = 50; // Base confidence for watch signal

    confidence += yieldData.apy * 0.5;
    confidence -= riskData.riskScore * 0.3;
    confidence += riskData.viralPotential * 0.2;

    return Math.max(0, Math.min(100, confidence));
  }

  private calculateAvoidConfidence(riskData: RiskData): number {
    let confidence = 70; // Base confidence for avoid signal

    if (riskData.rugRisk) confidence += 20;
    if (riskData.honeypotRisk) confidence += 20;
    if (!riskData.contractVerified) confidence += 10;
    if (!riskData.ownerRenounced) confidence += 10;

    return Math.min(100, confidence);
  }

  private generateBuyReasoning(yieldData: LiquidityData, riskData: RiskData): string {
    const reasons = [];
    
    if (yieldData.apy > 50) reasons.push(`exceptional APY of ${yieldData.apy.toFixed(1)}%`);
    else if (yieldData.apy > 30) reasons.push(`high APY of ${yieldData.apy.toFixed(1)}%`);
    else reasons.push(`solid APY of ${yieldData.apy.toFixed(1)}%`);

    if (riskData.riskScore < 20) reasons.push('very low risk profile');
    else if (riskData.riskScore < 30) reasons.push('low risk profile');
    else reasons.push('acceptable risk level');

    if (riskData.ownerRenounced) reasons.push('ownership renounced');
    if (riskData.contractVerified) reasons.push('verified contract');
    if (riskData.viralPotential > 50) reasons.push('high viral potential');

    return `Strong BUY signal: ${reasons.join(', ')}. Recommended for immediate investment.`;
  }

  private generateWatchReasoning(yieldData: LiquidityData, riskData: RiskData): string {
    const reasons = [];
    
    if (yieldData.apy > 20) reasons.push(`decent APY of ${yieldData.apy.toFixed(1)}%`);
    else reasons.push(`moderate APY of ${yieldData.apy.toFixed(1)}%`);

    if (riskData.riskScore < 50) reasons.push('manageable risk');
    else reasons.push('elevated risk level');

    if (riskData.viralPotential > 30) reasons.push('good viral potential');

    return `WATCH signal: ${reasons.join(', ')}. Monitor for better entry point or risk reduction.`;
  }

  private generateAvoidReasoning(riskData: RiskData): string {
    const risks = [];
    
    if (riskData.rugRisk) risks.push('high rug pull risk');
    if (riskData.honeypotRisk) risks.push('honeypot detected');
    if (!riskData.contractVerified) risks.push('unverified contract');
    if (!riskData.ownerRenounced) risks.push('owner not renounced');
    if (riskData.riskScore >= 80) risks.push(`very high risk score (${riskData.riskScore}/100)`);

    return `AVOID signal: ${risks.join(', ')}. High probability of loss.`;
  }

  private async generateDailyAlertSummary(): Promise<void> {
    try {
      const alerts = Array.from(this.generatedAlerts.values());
      const last24h = alerts.filter(alert => 
        Date.now() - alert.timestamp < 86400000
      );

      const summary = {
        reportType: 'daily_alert_summary',
        totalAlerts: last24h.length,
        buySignals: last24h.filter(a => a.alertType === 'BUY').length,
        watchSignals: last24h.filter(a => a.alertType === 'WATCH').length,
        avoidSignals: last24h.filter(a => a.alertType === 'AVOID').length,
        topBuySignals: last24h
          .filter(a => a.alertType === 'BUY')
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 5),
        topAvoidSignals: last24h
          .filter(a => a.alertType === 'AVOID')
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 5),
        timestamp: Date.now()
      };

      const payload: A2AMessagePayload = {
        messageType: 'alert_decision',
        data: summary as any,
        agentId: this.config.id,
        timestamp: Date.now(),
        contextId: 'daily-alert-summary'
      };

      await this.sendA2AMessage(payload);
    } catch (error) {
      console.error('❌ Error generating daily alert summary:', error);
    }
  }

  private async processPendingDecisions(): Promise<void> {
    // Check for tokens that have enough data for decision making
    setInterval(async () => {
      const readyTokens = Array.from(this.tokenAnalyses.entries())
        .filter(([address, data]) => 
          data.discovery && // Must have discovery data
          data.discovery.symbol && // Must have symbol
          data.yield && data.risk && !this.generatedAlerts.has(address)
        );

      console.log(`🔍 DEBUG: Found ${readyTokens.length} tokens ready for decision making`);
      
      for (const [address, data] of readyTokens) {
        console.log(`🔍 DEBUG: Adding ${data.discovery.symbol} (${address}) to pending decisions`);
        this.pendingDecisions.set(address, data);
      }
    }, 10000); // Check every 10 seconds
  }

  protected async processMessage(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      console.log(`📨 Alert Agent received message: ${payload.messageType}`);
      console.log(`🔍 DEBUG: Message from agent ${payload.agentId}, contextId: ${payload.contextId}`);
      
      switch (payload.messageType) {
        case 'token_discovery':
          console.log(`🎯 Processing token discovery...`);
          await this.handleTokenDiscovery(payload, eventBus);
          break;
        
        case 'yield_report':
          await this.handleYieldReport(payload, eventBus);
          break;

        case 'risk_report':
          await this.handleRiskReport(payload, eventBus);
          break;

        case 'alert_decision':
          // Alert agent should not process its own alert decisions
          console.log(`📨 Alert Agent ignoring its own alert_decision message`);
          break;

        default:
          console.log(`⚠️  Unknown message type: ${payload.messageType}`);
          break;
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
    }
  }

  private async handleTokenDiscovery(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      console.log(`🎯 DEBUG: Raw token discovery payload:`, JSON.stringify(payload.data, null, 2));
      const tokenData = payload.data as MemecoinData;
      
      console.log(`🔍 Token discovery received: ${tokenData.symbol || 'NO_SYMBOL'} (${tokenData.address || 'NO_ADDRESS'})`);
      console.log(`🔍 DEBUG: Full token data - name: ${tokenData.name}, symbol: ${tokenData.symbol}, address: ${tokenData.address}`);

      // Initialize analysis data
      this.tokenAnalyses.set(tokenData.address, {
        discovery: tokenData,
        yield: null,
        risk: null,
        lastUpdated: Date.now()
      });

      console.log(`✅ Token ${tokenData.symbol} added to analysis tracking`);

      const response: Message = {
        kind: 'message',
        messageId: uuidv4(),
        role: 'agent',
        parts: [{
          kind: 'text',
          text: `🚨 Alert Agent tracking ${tokenData.symbol || tokenData.address}. Waiting for yield and risk analysis...`
        }],
        contextId: payload.contextId
      };

      eventBus.publish(response);
    } catch (error) {
      console.error('❌ Error handling token discovery:', error);
    }
  }

  private async handleYieldReport(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      const yieldData = payload.data as LiquidityData;
      const tokenAddress = yieldData.tokenAddress;

      console.log(`💰 Yield report received for ${tokenAddress}: APY ${yieldData.apy.toFixed(2)}%`);

      const analysisData = this.tokenAnalyses.get(tokenAddress);
      if (analysisData) {
        analysisData.yield = yieldData;
        analysisData.lastUpdated = Date.now();
        this.tokenAnalyses.set(tokenAddress, analysisData);

        // Check if we can make a decision now
        if (analysisData.risk) {
          this.pendingDecisions.set(tokenAddress, analysisData);
        }
      }
    } catch (error) {
      console.error('❌ Error handling yield report:', error);
    }
  }

  private async handleRiskReport(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      const riskData = payload.data as RiskData;
      const tokenAddress = riskData.tokenAddress;

      console.log(`⚠️  Risk report received for ${tokenAddress}: Score ${riskData.riskScore}/100`);

      const analysisData = this.tokenAnalyses.get(tokenAddress);
      if (analysisData) {
        analysisData.risk = riskData;
        analysisData.lastUpdated = Date.now();
        this.tokenAnalyses.set(tokenAddress, analysisData);

        // Check if we can make a decision now
        if (analysisData.yield) {
          this.pendingDecisions.set(tokenAddress, analysisData);
        }
      }
    } catch (error) {
      console.error('❌ Error handling risk report:', error);
    }
  }

  private async handleAlertRequest(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      // Handle requests for alert data
      if (typeof payload.data === 'string') {
        const tokenAddress = payload.data;
        const alert = this.generatedAlerts.get(tokenAddress);

        if (alert) {
          const response: Message = {
            kind: 'message',
            messageId: uuidv4(),
            role: 'agent',
            parts: [{
              kind: 'text',
              text: JSON.stringify({
                symbol: alert.symbol,
                alertType: alert.alertType,
                confidence: alert.confidence,
                reasoning: alert.reasoning,
                timestamp: alert.timestamp
              })
            }],
            contextId: payload.contextId
          };

          eventBus.publish(response);
        } else {
          const response: Message = {
            kind: 'message',
            messageId: uuidv4(),
            role: 'agent',
            parts: [{
              kind: 'text',
              text: `No alert generated yet for token ${tokenAddress}. Analysis may still be in progress.`
            }],
            contextId: payload.contextId
          };

          eventBus.publish(response);
        }
      }
    } catch (error) {
      console.error('❌ Error handling alert request:', error);
    }
  }

  // Get current alerts
  getCurrentAlerts(): AlertSignal[] {
    return Array.from(this.generatedAlerts.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get alerts by type
  getAlertsByType(type: 'BUY' | 'WATCH' | 'AVOID'): AlertSignal[] {
    return this.getCurrentAlerts().filter(alert => alert.alertType === type);
  }

  // Get tracked tokens count
  getTrackedTokensCount(): number {
    return this.tokenAnalyses.size;
  }
}

// Start the agent if this file is run directly
if (require.main === module) {
  const agent = new AlertAgent();
  
  agent.initialize().catch(error => {
    console.error('❌ Failed to start Alert Agent:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Alert Agent...');
    await agent.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down Alert Agent...');
    await agent.shutdown();
    process.exit(0);
  });
}
