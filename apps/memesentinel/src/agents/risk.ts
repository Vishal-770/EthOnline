import * as dotenv from 'dotenv';
import * as cron from 'node-cron';
import { BaseAgent } from '../shared/BaseAgent';
import { RiskAnalysisService } from '../services/RiskAnalysisService';
import { AgentConfig, MemecoinData, RiskData, A2AMessagePayload } from '../types';
import { ExecutionEventBus } from '@a2a-js/sdk/server';
import { Message } from '@a2a-js/sdk';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export class RiskAnalysisAgent extends BaseAgent {
  private riskService: RiskAnalysisService;
  private analyzedTokens: Map<string, RiskData> = new Map();
  private analysisQueue: string[] = [];
  private riskThresholds = {
    low: 30,
    medium: 60,
    high: 80
  };

  constructor() {
    const config: AgentConfig = {
      id: 'risk-analysis',
      name: 'Risk Analysis Agent',
      description: 'Checks rug risks, owner renounce, mint permissions, and viral potential',
      port: parseInt(process.env.RISK_AGENT_PORT || '4003'),
      baseUrl: `http://localhost:${process.env.RISK_AGENT_PORT || '4003'}`,
      skills: [
        {
          id: 'rug-detection',
          name: 'Rug Pull Detection',
          description: 'Detect potential rug pull risks',
          tags: ['security', 'rug-pull', 'detection']
        },
        {
          id: 'contract-analysis',
          name: 'Contract Analysis',
          description: 'Analyze smart contract security',
          tags: ['contract', 'security', 'analysis']
        },
        {
          id: 'social-sentiment',
          name: 'Social Sentiment Analysis',
          description: 'Analyze social media sentiment and viral potential',
          tags: ['social', 'sentiment', 'viral']
        },
        {
          id: 'ownership-verification',
          name: 'Ownership Verification',
          description: 'Verify token ownership and permissions',
          tags: ['ownership', 'verification', 'permissions']
        }
      ]
    };

    super(config);
    this.riskService = new RiskAnalysisService();
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    console.log('⚠️  Risk Analysis Agent initialized');
    console.log('🔍 Starting risk monitoring...');
    
    // Start periodic risk analysis
    this.startPeriodicAnalysis();
    
    // Process analysis queue
    this.processAnalysisQueue();
  }

  private startPeriodicAnalysis(): void {
    // Re-analyze high-risk tokens every hour
    cron.schedule('0 * * * *', async () => {
      console.log('🔄 Starting scheduled risk re-analysis...');
      await this.reanalyzeHighRiskTokens();
    });

    // Generate daily risk report
    cron.schedule('0 6 * * *', async () => {
      console.log('📊 Generating daily risk report...');
      await this.generateDailyRiskReport();
    });

    console.log('⏰ Scheduled risk analysis every hour');
  }

  private async reanalyzeHighRiskTokens(): Promise<void> {
    try {
      const highRiskTokens = Array.from(this.analyzedTokens.entries())
        .filter(([_, data]) => data.riskScore >= this.riskThresholds.high)
        .map(([address, _]) => address);

      if (highRiskTokens.length === 0) {
        console.log('📊 No high-risk tokens to re-analyze');
        return;
      }

      console.log(`⚠️  Re-analyzing ${highRiskTokens.length} high-risk tokens...`);

      for (const tokenAddress of highRiskTokens) {
        await this.analyzeTokenRisk(tokenAddress, true);
        // Small delay to avoid overwhelming APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('❌ Error during risk re-analysis:', error);
    }
  }

  private async generateDailyRiskReport(): Promise<void> {
    try {
      console.log('📊 Generating daily risk report...');
      
      const riskSummary = this.calculateRiskSummary();
      const highRiskTokens = this.getTokensByRiskLevel('high');
      const rugWarnings = this.getRugWarnings();

      const reportData = {
        reportType: 'daily_risk_summary',
        summary: riskSummary,
        highRiskTokens: highRiskTokens.slice(0, 10), // Top 10 highest risk
        rugWarnings,
        timestamp: Date.now()
      };

      const payload: A2AMessagePayload = {
        messageType: 'risk_report',
        data: reportData as any,
        agentId: this.config.id,
        timestamp: Date.now(),
        contextId: 'daily-risk-report'
      };

      // Send to both Alert agent and Assistant agent
      await this.sendA2AMessage(payload);
    } catch (error) {
      console.error('❌ Error generating daily risk report:', error);
    }
  }

  private calculateRiskSummary() {
    const tokens = Array.from(this.analyzedTokens.values());
    if (tokens.length === 0) return null;

    const lowRisk = tokens.filter(t => t.riskScore < this.riskThresholds.low).length;
    const mediumRisk = tokens.filter(t => 
      t.riskScore >= this.riskThresholds.low && t.riskScore < this.riskThresholds.high
    ).length;
    const highRisk = tokens.filter(t => t.riskScore >= this.riskThresholds.high).length;
    const rugRiskCount = tokens.filter(t => t.rugRisk).length;
    const honeypotCount = tokens.filter(t => t.honeypotRisk).length;

    return {
      totalAnalyzed: tokens.length,
      lowRisk,
      mediumRisk,
      highRisk,
      rugRiskCount,
      honeypotCount,
      averageRiskScore: tokens.reduce((sum, t) => sum + t.riskScore, 0) / tokens.length
    };
  }

  private getTokensByRiskLevel(level: 'low' | 'medium' | 'high'): RiskData[] {
    const tokens = Array.from(this.analyzedTokens.values());
    
    switch (level) {
      case 'low':
        return tokens.filter(t => t.riskScore < this.riskThresholds.low)
          .sort((a, b) => a.riskScore - b.riskScore);
      case 'medium':
        return tokens.filter(t => 
          t.riskScore >= this.riskThresholds.low && t.riskScore < this.riskThresholds.high
        ).sort((a, b) => a.riskScore - b.riskScore);
      case 'high':
        return tokens.filter(t => t.riskScore >= this.riskThresholds.high)
          .sort((a, b) => b.riskScore - a.riskScore);
      default:
        return [];
    }
  }

  private getRugWarnings(): RiskData[] {
    return Array.from(this.analyzedTokens.values())
      .filter(t => t.rugRisk || t.honeypotRisk)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5); // Top 5 rug warnings
  }

  private async processAnalysisQueue(): Promise<void> {
    // Process queued tokens for analysis
    setInterval(async () => {
      if (this.analysisQueue.length > 0) {
        const tokenAddress = this.analysisQueue.shift();
        if (tokenAddress) {
          await this.analyzeTokenRisk(tokenAddress);
        }
      }
    }, 3000); // Process one token every 3 seconds (risk analysis is more intensive)
  }

  private async analyzeTokenRisk(tokenAddress: string, isReanalysis: boolean = false): Promise<void> {
    try {
      const action = isReanalysis ? 'Re-analyzing' : 'Analyzing';
      console.log(`⚠️  ${action} risk for token: ${tokenAddress}`);
      
      const riskData = await this.riskService.analyzeRisk(tokenAddress);

      if (riskData) {
        // Store the analysis
        const previousData = this.analyzedTokens.get(tokenAddress);
        this.analyzedTokens.set(tokenAddress, riskData);
        
        const riskLevel = this.getRiskLevel(riskData.riskScore);
        console.log(`✅ Risk analysis complete for ${tokenAddress}: ${riskLevel} risk (${riskData.riskScore}/100)`);

        // Check for significant risk changes in re-analysis
        if (isReanalysis && previousData) {
          const riskChange = riskData.riskScore - previousData.riskScore;
          if (Math.abs(riskChange) > 15) { // Significant change threshold
            await this.reportRiskChange(tokenAddress, previousData, riskData);
          }
        }

        // Send risk report to Alert agent only
        const payload: A2AMessagePayload = {
          messageType: 'risk_report',
          data: riskData,
          agentId: this.config.id,
          timestamp: Date.now(),
          contextId: tokenAddress
        };

        // Send to both Alert agent and Assistant agent
        await this.sendA2AMessage(payload);

        // Send immediate alert for very high risk tokens
        if (riskData.riskScore >= 90 || riskData.rugRisk) {
          await this.sendHighRiskAlert(tokenAddress, riskData);
        }
      } else {
        console.log(`❌ Could not analyze risk for ${tokenAddress}`);
      }
    } catch (error) {
      console.error(`❌ Error analyzing risk for ${tokenAddress}:`, error);
    }
  }

  private async reportRiskChange(
    tokenAddress: string,
    oldData: RiskData,
    newData: RiskData
  ): Promise<void> {
    const riskChange = newData.riskScore - oldData.riskScore;
    const direction = riskChange > 0 ? 'increased' : 'decreased';
    
    console.log(`📊 Risk change for ${tokenAddress}: ${direction} by ${Math.abs(riskChange)} points`);

    const changeData = {
      tokenAddress,
      oldRiskScore: oldData.riskScore,
      newRiskScore: newData.riskScore,
      riskChange,
      changeType: 'risk_level_change',
      timestamp: Date.now()
    };

    const payload: A2AMessagePayload = {
      messageType: 'risk_report',
      data: changeData as any,
      agentId: this.config.id,
      timestamp: Date.now(),
      contextId: tokenAddress
    };

    // Send to both Alert agent and Assistant agent
    await this.sendA2AMessage(payload);
  }

  private async sendHighRiskAlert(tokenAddress: string, riskData: RiskData): Promise<void> {
    console.log(`🚨 HIGH RISK ALERT for ${tokenAddress}: Score ${riskData.riskScore}/100`);

    const alertData = {
      alertType: 'HIGH_RISK_WARNING',
      tokenAddress,
      riskScore: riskData.riskScore,
      rugRisk: riskData.rugRisk,
      honeypotRisk: riskData.honeypotRisk,
      ownerRenounced: riskData.ownerRenounced,
      contractVerified: riskData.contractVerified,
      urgency: 'immediate',
      timestamp: Date.now()
    };

    const payload: A2AMessagePayload = {
      messageType: 'risk_report',
      data: alertData as any,
      agentId: this.config.id,
      timestamp: Date.now(),
      contextId: tokenAddress
    };

    // Send to both Alert agent and Assistant agent  
    await this.sendA2AMessage(payload);
  }

  private getRiskLevel(riskScore: number): string {
    if (riskScore < this.riskThresholds.low) return 'LOW';
    if (riskScore < this.riskThresholds.high) return 'MEDIUM';
    return 'HIGH';
  }

  protected async processMessage(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      switch (payload.messageType) {
        case 'token_discovery':
          await this.handleTokenDiscovery(payload, eventBus);
          break;
        
        case 'risk_report':
          await this.handleRiskRequest(payload, eventBus);
          break;

        case 'alert_decision':
          await this.handleAlertDecision(payload, eventBus);
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
      const tokenData = payload.data as MemecoinData;
      
      console.log(`🔍 New token discovered: ${tokenData.symbol} (${tokenData.address})`);
      console.log(`⚠️  Queuing risk analysis for ${tokenData.address}`);

      // Add to analysis queue with priority for new discoveries
      this.analysisQueue.unshift(tokenData.address); // Add to front of queue

      const response: Message = {
        kind: 'message',
        messageId: uuidv4(),
        role: 'agent',
        parts: [{
          kind: 'text',
          text: `⚠️  Risk Analysis Agent received token discovery for ${tokenData.symbol}. Queued for priority risk analysis.`
        }],
        contextId: payload.contextId
      };

      eventBus.publish(response);
    } catch (error) {
      console.error('❌ Error handling token discovery:', error);
    }
  }

  private async handleRiskRequest(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      // Handle requests for risk data
      if (typeof payload.data === 'string') {
        const tokenAddress = payload.data;
        const existingData = this.analyzedTokens.get(tokenAddress);

        if (existingData) {
          const riskLevel = this.getRiskLevel(existingData.riskScore);
          
          const response: Message = {
            kind: 'message',
            messageId: uuidv4(),
            role: 'agent',
            parts: [{
              kind: 'text',
              text: JSON.stringify({
                tokenAddress,
                riskScore: existingData.riskScore,
                riskLevel,
                rugRisk: existingData.rugRisk,
                ownerRenounced: existingData.ownerRenounced,
                contractVerified: existingData.contractVerified,
                viralPotential: existingData.viralPotential,
                lastAnalyzed: existingData.timestamp
              })
            }],
            contextId: payload.contextId
          };

          eventBus.publish(response);
        } else {
          // Queue for analysis if not tracked
          this.analysisQueue.push(tokenAddress);
          
          const response: Message = {
            kind: 'message',
            messageId: uuidv4(),
            role: 'agent',
            parts: [{
              kind: 'text',
              text: `Token ${tokenAddress} queued for risk analysis. Check back shortly.`
            }],
            contextId: payload.contextId
          };

          eventBus.publish(response);
        }
      }
    } catch (error) {
      console.error('❌ Error handling risk request:', error);
    }
  }

  // Manual risk analysis trigger
  async triggerRiskAnalysis(tokenAddress: string): Promise<void> {
    console.log(`🚀 Manual risk analysis triggered for ${tokenAddress}`);
    await this.analyzeTokenRisk(tokenAddress);
  }

  // Get analyzed tokens count
  getAnalyzedTokensCount(): number {
    return this.analyzedTokens.size;
  }

  // Get high risk tokens
  getHighRiskTokens(limit: number = 10): RiskData[] {
    return this.getTokensByRiskLevel('high').slice(0, limit);
  }

  // Get safe tokens (low risk)
  getSafeTokens(limit: number = 10): RiskData[] {
    return this.getTokensByRiskLevel('low').slice(0, limit);
  }

  private async handleAlertDecision(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      const raw = payload.data as unknown;
      if (raw && typeof raw === 'object' && ('tokenAddress' in (raw as any) || 'id' in (raw as any))) {
        const alert = raw as any;
        const symbol = alert.symbol || 'UNKNOWN';
        const alertType = alert.alertType || 'N/A';
        console.log(`🚨 Risk Agent received alert decision: ${alertType} for ${symbol}`);
        
        // Risk agent could update its risk models based on alert decisions
        // For now, just acknowledge the alert
      } else {
        console.log('📨 Risk Agent received alert_decision with unexpected payload');
      }
    } catch (err) {
      console.error('❌ Risk Agent error handling alert_decision:', err);
    }
  }
}

// Start the agent if this file is run directly
if (require.main === module) {
  const agent = new RiskAnalysisAgent();
  
  agent.initialize().catch(error => {
    console.error('❌ Failed to start Risk Analysis Agent:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Risk Analysis Agent...');
    await agent.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down Risk Analysis Agent...');
    await agent.shutdown();
    process.exit(0);
  });
}
