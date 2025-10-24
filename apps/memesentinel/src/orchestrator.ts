/**
 * MemeSentinel Multi-Agent Orchestrator
 * Starts all agents in a single Node.js process on different ports
 */

import * as dotenv from 'dotenv';
import { MemecoinScoutAgent } from './agents/scout';
import { YieldLiquidityAgent } from './agents/yield';
import { RiskAnalysisAgent } from './agents/risk';
import { AlertAgent } from './agents/alert';
import { SettlementAgent } from './agents/settlement';
import { PersonalAssistantAgent } from './agents/assistant';

dotenv.config();

class MemeSentinelOrchestrator {
  private agents: any[] = [];
  private isShuttingDown = false;

  async start(): Promise<void> {
    console.log('🚀 MemeSentinel Multi-Agent System Starting...');
    console.log('=============================================');
    console.log();

    try {
      // Initialize all agents
      const scoutAgent = new MemecoinScoutAgent();
      const yieldAgent = new YieldLiquidityAgent();
      const riskAgent = new RiskAnalysisAgent();
      const alertAgent = new AlertAgent();
      const settlementAgent = new SettlementAgent();
      const assistantAgent = new PersonalAssistantAgent();

      this.agents = [
        scoutAgent,
        yieldAgent,
        riskAgent,
        alertAgent,
        settlementAgent,
        assistantAgent
      ];

      // Start all agents concurrently
      console.log('🔄 Initializing agents...');
      await Promise.all(this.agents.map(async (agent, index) => {
        try {
          await agent.initialize();
          console.log(`✅ Agent ${index + 1}/6 initialized: ${agent.config.name}`);
        } catch (error) {
          console.error(`❌ Failed to initialize ${agent.config.name}:`, error);
          throw error;
        }
      }));

      console.log();
      console.log('🎉 All agents successfully started!');
      console.log('=====================================');
      console.log();
      
      this.displaySystemInfo();
      this.setupGracefulShutdown();

      // Keep the process alive
      console.log('🔄 System running... Press Ctrl+C to stop');
      
    } catch (error) {
      console.error('❌ Failed to start MemeSentinel system:', error);
      await this.shutdown();
      process.exit(1);
    }
  }

  private displaySystemInfo(): void {
    console.log('📊 System Information:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    
    this.agents.forEach((agent, index) => {
      const port = agent.config.port;
      const name = agent.config.name.padEnd(25);
      console.log(`│ ${index + 1}. ${name} │ Port: ${port}     │`);
    });
    
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ 🌐 Dashboard: http://localhost:4106/dashboard          │');
    console.log('│ 📝 HCS Logs: https://hashscan.io/testnet/topic/        │');
    console.log('│               0.0.7119659                               │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log();
    
    console.log('🎯 Features:');
    console.log('  • Real-time token discovery from CoinGecko & DefiLlama');
    console.log('  • AI-powered risk and yield analysis');
    console.log('  • Groq-powered intelligent chat interface');
    console.log('  • BUY/WATCH/AVOID alert generation');
    console.log('  • Hedera HCS immutable logging');
    console.log('  • Agent-to-Agent communication');
    console.log();
  }

  private setupGracefulShutdown(): void {
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
      await this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
      await this.shutdown();
      process.exit(0);
    });

    process.on('uncaughtException', async (error) => {
      console.error('❌ Uncaught Exception:', error);
      await this.shutdown();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      await this.shutdown();
      process.exit(1);
    });
  }

  private async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }
    
    this.isShuttingDown = true;
    console.log('🔄 Shutting down all agents...');

    // Shutdown all agents
    const shutdownPromises = this.agents.map(async (agent, index) => {
      try {
        if (agent && typeof agent.shutdown === 'function') {
          await agent.shutdown();
          console.log(`✅ Agent ${index + 1} shut down: ${agent.config.name}`);
        }
      } catch (error) {
        console.error(`❌ Error shutting down ${agent.config.name}:`, error);
      }
    });

    await Promise.allSettled(shutdownPromises);
    console.log('✅ All agents shut down successfully');
  }

  // Health check method
  async getSystemHealth(): Promise<any> {
    const health: {
      status: string;
      agents: Array<{
        name: string;
        port: number;
        status: string;
        uptime?: number;
        error?: string;
      }>;
      timestamp: number;
    } = {
      status: 'healthy',
      agents: [],
      timestamp: Date.now()
    };

    for (const agent of this.agents) {
      try {
        const agentHealth = {
          name: agent.config.name,
          port: agent.config.port,
          status: 'healthy',
          uptime: Date.now() - (agent.startTime || Date.now())
        };
        
        // Test if agent is responsive (if it has a health check method)
        if (typeof agent.healthCheck === 'function') {
          await agent.healthCheck();
        }
        
        health.agents.push(agentHealth);
      } catch (error) {
        health.status = 'degraded';
        health.agents.push({
          name: agent.config.name,
          port: agent.config.port,
          status: 'unhealthy',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return health;
  }
}

// Start the orchestrator if this file is run directly
if (require.main === module) {
  const orchestrator = new MemeSentinelOrchestrator();
  orchestrator.start().catch(error => {
    console.error('❌ Failed to start MemeSentinel orchestrator:', error);
    process.exit(1);
  });
}

export { MemeSentinelOrchestrator };