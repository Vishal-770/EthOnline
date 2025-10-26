import * as dotenv from 'dotenv';
import { BaseAgent } from '../shared/BaseAgent';
import { Client, PrivateKey, TopicCreateTransaction, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { AgentConfig, AlertSignal, A2AMessagePayload } from '../types';
import { ExecutionEventBus } from '@a2a-js/sdk/server';
import { Message } from '@a2a-js/sdk';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export interface SettlementRecord {
  id: string;
  alertSignal: AlertSignal;
  action: 'LOG_ONLY' | 'HBAR_TRANSFER' | 'TOKEN_TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  transactionId?: string;
  topicId?: string;
  timestamp: number;
  errorMessage?: string;
}

export class SettlementAgent extends BaseAgent {
  private hederaClient: Client;
  private settlementRecords: Map<string, SettlementRecord> = new Map();
  private alertTopicId: string | null = null;
  
  constructor() {
    const config: AgentConfig = {
      id: 'settlement-agent',
      name: 'Settlement Agent',
      description: 'Handles AP2 token transfers and logs alerts to Hedera Consensus Service (HCS)',
      port: parseInt(process.env.SETTLEMENT_AGENT_PORT || '4005'),
      baseUrl: `http://localhost:${process.env.SETTLEMENT_AGENT_PORT || '4005'}`,
      skills: [
        {
          id: 'hcs-logging',
          name: 'HCS Logging',
          description: 'Log alerts to Hedera Consensus Service',
          tags: ['hedera', 'consensus', 'logging']
        },
        {
          id: 'token-settlement',
          name: 'Token Settlement',
          description: 'Execute token transfers on Hedera',
          tags: ['hedera', 'tokens', 'settlement']
        },
        {
          id: 'audit-trail',
          name: 'Audit Trail',
          description: 'Maintain immutable audit trail',
          tags: ['audit', 'immutable', 'tracking']
        }
      ]
    };

    super(config);
    
    // Initialize Hedera client
    this.hederaClient = Client.forTestnet().setOperator(
      process.env.HEDERA_ACCOUNT_ID!,
      PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!)
    );

  async initialize(): Promise<void> {
    await super.initialize();
    
    console.log('💵 Settlement Agent initialized');
    console.log('🔗 Connected to Hedera Network (Testnet)');
    
    // Create or get topic for alert logging
    await this.initializeAlertTopic();
    
    console.log('📝 Ready to handle settlements and logging');
  }

  private async initializeAlertTopic(): Promise<void> {
    try {
      console.log('📝 Initializing Hedera topic for alert logging...');
      
      // Create a new topic for MemeSentinel alerts
      const topicCreateTransaction = new TopicCreateTransaction()
        .setTopicMemo('MemeSentinel Alert Logs')
        .setAdminKey(PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!))
        .setSubmitKey(PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!));

      const response = await topicCreateTransaction.execute(this.hederaClient);
      const receipt = await response.getReceipt(this.hederaClient);
      
      this.alertTopicId = receipt.topicId?.toString() || null;
      
      if (this.alertTopicId) {
        console.log(`✅ Alert topic created: ${this.alertTopicId}`);
        
        // Log initialization message
        await this.logToHCS({
          type: 'SYSTEM_INIT',
          message: 'MemeSentinel Settlement Agent initialized',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('❌ Error creating alert topic:', error);
      // Continue without HCS logging if topic creation fails
    }
  }

  private async logToHCS(data: any): Promise<boolean> {
    try {
      if (!this.alertTopicId) {
        console.log('⚠️  No alert topic available for HCS logging');
        return false;
      }

      const message = JSON.stringify(data);
      
      const topicMessageTransaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.alertTopicId)
        .setMessage(message);

      const response = await topicMessageTransaction.execute(this.hederaClient);
      const receipt = await response.getReceipt(this.hederaClient);
      
      console.log(`📝 Logged to HCS topic ${this.alertTopicId}: ${receipt.status.toString()}`);
      return true;
    } catch (error) {
      console.error('❌ Error logging to HCS:', error);
      return false;
    }
  }

  private async executeSettlement(alertSignal: AlertSignal): Promise<SettlementRecord> {
    const settlementId = uuidv4();
    
    const record: SettlementRecord = {
      id: settlementId,
      alertSignal,
      action: 'LOG_ONLY', // Default to logging only
      status: 'PENDING',
      timestamp: Date.now()
    };

    try {
      console.log(`💵 Processing settlement for ${alertSignal.symbol} (${alertSignal.alertType})`);

      // Determine settlement action based on alert type and configuration
      const action = this.determineSettlementAction(alertSignal);
      record.action = action;

      switch (action) {
        case 'LOG_ONLY':
          await this.logAlertToHCS(alertSignal, record);
          break;
          
        case 'HBAR_TRANSFER':
          await this.executeHBARTransfer(alertSignal, record);
          break;
          
        case 'TOKEN_TRANSFER':
          await this.executeTokenTransfer(alertSignal, record);
          break;
      }

      record.status = 'COMPLETED';
      console.log(`✅ Settlement completed for ${alertSignal.symbol}: ${action}`);
      
    } catch (error) {
      console.error(`❌ Settlement failed for ${alertSignal.symbol}:`, error);
      record.status = 'FAILED';
      record.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    // Store settlement record
    this.settlementRecords.set(settlementId, record);
    
    // Always log the settlement record to HCS for audit trail
    await this.logToHCS({
      type: 'SETTLEMENT_RECORD',
      record,
      timestamp: Date.now()
    });

    return record;
  }

  private determineSettlementAction(alertSignal: AlertSignal): 'LOG_ONLY' | 'HBAR_TRANSFER' | 'TOKEN_TRANSFER' {
    // For this demo, we'll primarily use LOG_ONLY
    // In production, you could implement actual trading logic here
    
    if (process.env.ENABLE_AUTO_TRADING === 'true' && alertSignal.alertType === 'BUY' && alertSignal.confidence > 80) {
      return 'HBAR_TRANSFER'; // Demo HBAR transfer for high-confidence buy signals
    }
    
    return 'LOG_ONLY';
  }

  private async logAlertToHCS(alertSignal: AlertSignal, record: SettlementRecord): Promise<void> {
    const logData = {
      type: 'ALERT_LOG',
      alert: {
        symbol: alertSignal.symbol,
        tokenAddress: alertSignal.tokenAddress,
        alertType: alertSignal.alertType,
        confidence: alertSignal.confidence,
        reasoning: alertSignal.reasoning,
        apy: alertSignal.yieldData?.apy || 0,
        riskScore: alertSignal.riskData?.riskScore || 0,
        timestamp: alertSignal.timestamp
      },
      settlementId: record.id,
      timestamp: Date.now()
    };

    const success = await this.logToHCS(logData);
    if (!success) {
      throw new Error('Failed to log alert to HCS');
    }
  }

  private async executeHBARTransfer(alertSignal: AlertSignal, record: SettlementRecord): Promise<void> {
    try {
      console.log(`💰 Executing demo HBAR transfer for ${alertSignal.symbol}`);
      
      // Demo: transfer small amount of HBAR to self (for demonstration)
      const amount = 1; // 1 HBAR
      
      // TODO: Use Hedera Agent Kit tools for transfer once built
      // const tools = this.hederaToolkit.getTools();
      // const transferTool = tools.find(tool => tool.name.includes('transfer') || tool.name.includes('hbar'));
      
      // For now, just log the transfer
      console.log(`💸 Demo HBAR transfer of ${amount} HBAR for alert ${alertSignal.symbol}`);
      record.transactionId = `demo-tx-${Date.now()}`;
      
    } catch (error) {
      console.error('❌ HBAR transfer failed:', error);
      throw error;
    }
  }

  private async executeTokenTransfer(alertSignal: AlertSignal, record: SettlementRecord): Promise<void> {
    try {
      console.log(`🪙 Executing demo token transfer for ${alertSignal.symbol}`);
      
      // This would implement actual token transfer logic
      // For demo purposes, we'll just log the intent
      console.log(`🔄 Demo token interaction for ${alertSignal.tokenAddress}`);
      record.transactionId = `demo-token-tx-${Date.now()}`;
    } catch (error) {
      console.error('❌ Token transfer failed:', error);
      throw error;
    }
  }

  protected async processMessage(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      switch (payload.messageType) {
        case 'alert_decision':
          await this.handleAlertDecision(payload, eventBus);
          break;
        
        case 'settlement_request':
          await this.handleSettlementRequest(payload, eventBus);
          break;

        case 'token_discovery':
          // Settlement agent doesn't need to act on token discoveries
          // These are handled by other agents (Risk, Yield, Alert)
          console.log(`📝 Settlement agent received token discovery - no action needed`);
          break;

        case 'risk_report':
        case 'yield_report':
          // Settlement agent doesn't need to act on these reports
          // These go to Alert agent for decision making
          console.log(`📝 Settlement agent received ${payload.messageType} - no action needed`);
          break;

        default:
          console.log(`⚠️  Unknown message type: ${payload.messageType}`);
          break;
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
    }
  }

  private async handleAlertDecision(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      const alertSignal = payload.data as AlertSignal;
      
      console.log(`🚨 Alert decision received: ${alertSignal.alertType} for ${alertSignal.symbol}`);

      // Execute settlement
      const settlementRecord = await this.executeSettlement(alertSignal);

      const response: Message = {
        kind: 'message',
        messageId: uuidv4(),
        role: 'agent',
        parts: [{
          kind: 'text',
          text: `💵 Settlement processed for ${alertSignal.symbol}: ${settlementRecord.action} (${settlementRecord.status})`
        }],
        contextId: payload.contextId
      };

      eventBus.publish(response);

      // Notify Assistant agent of settlement completion for dashboard updates
      const settlementPayload: A2AMessagePayload = {
        messageType: 'settlement_request',
        data: settlementRecord as any,
        agentId: this.config.id,
        timestamp: Date.now(),
        contextId: payload.contextId
      };

      // Send only to Assistant agent for dashboard updates
      await this.sendA2AMessage(settlementPayload, ['agent-4006']);
    } catch (error) {
      console.error('❌ Error handling alert decision:', error);
    }
  }

  private async handleSettlementRequest(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      // Handle requests for settlement information
      if (typeof payload.data === 'string') {
        const requestType = payload.data;
        
        if (requestType === 'summary') {
          const summary = this.getSettlementSummary();
          
          const response: Message = {
            kind: 'message',
            messageId: uuidv4(),
            role: 'agent',
            parts: [{
              kind: 'text',
              text: JSON.stringify(summary)
            }],
            contextId: payload.contextId
          };

          eventBus.publish(response);
        }
      }
    } catch (error) {
      console.error('❌ Error handling settlement request:', error);
    }
  }

  private getSettlementSummary() {
    const records = Array.from(this.settlementRecords.values());
    const last24h = records.filter(record => 
      Date.now() - record.timestamp < 86400000
    );

    return {
      totalSettlements: records.length,
      last24h: last24h.length,
      completed: records.filter(r => r.status === 'COMPLETED').length,
      failed: records.filter(r => r.status === 'FAILED').length,
      logOnly: records.filter(r => r.action === 'LOG_ONLY').length,
      hbarTransfers: records.filter(r => r.action === 'HBAR_TRANSFER').length,
      tokenTransfers: records.filter(r => r.action === 'TOKEN_TRANSFER').length,
      alertTopicId: this.alertTopicId,
      timestamp: Date.now()
    };
  }

  // Get settlement records
  getSettlementRecords(): SettlementRecord[] {
    return Array.from(this.settlementRecords.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get recent settlements
  getRecentSettlements(limit: number = 10): SettlementRecord[] {
    return this.getSettlementRecords().slice(0, limit);
  }

  // Manual settlement trigger (for testing)
  async triggerManualSettlement(alertSignal: AlertSignal): Promise<SettlementRecord> {
    console.log(`🚀 Manual settlement triggered for ${alertSignal.symbol}`);
    return await this.executeSettlement(alertSignal);
  }
}

// Start the agent if this file is run directly
if (require.main === module) {
  const agent = new SettlementAgent();
  
  agent.initialize().catch(error => {
    console.error('❌ Failed to start Settlement Agent:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Settlement Agent...');
    await agent.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down Settlement Agent...');
    await agent.shutdown();
    process.exit(0);
  });
}
