import { AgentCard, Message, MessageSendParams } from '@a2a-js/sdk';
import { A2AClient } from '@a2a-js/sdk/client';
import {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
  DefaultRequestHandler,
  InMemoryTaskStore,
} from '@a2a-js/sdk/server';
import { A2AExpressApp } from '@a2a-js/sdk/server/express';
import express, { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AgentConfig, A2AMessagePayload, AlertSignal } from '../types';

export abstract class BaseAgent implements AgentExecutor {
  protected config: AgentConfig;
  protected clients: Map<string, A2AClient> = new Map();
  protected app: Express;
  protected server: any;
  public startTime: number = Date.now();

  constructor(config: AgentConfig) {
    this.config = config;
    this.app = express();
  }

  async initialize(): Promise<void> {
    console.log(`🚀 Initializing ${this.config.name}...`);
    
    // Create agent card
    const agentCard = this.createAgentCard();
    
    // Set up A2A server
    const requestHandler = new DefaultRequestHandler(
      agentCard,
      new InMemoryTaskStore(),
      this
    );

    const appBuilder = new A2AExpressApp(requestHandler);
    this.app = appBuilder.setupRoutes(this.app);

    // Start server
    this.server = this.app.listen(this.config.port, () => {
      console.log(`✅ ${this.config.name} started on port ${this.config.port}`);
      console.log(`📄 Agent card: http://localhost:${this.config.port}/.well-known/agent-card.json`);
    });

    // Initialize connections to other agents
    await this.initializeConnections();
  }

  protected createAgentCard(): AgentCard {
    return {
      name: this.config.name,
      description: this.config.description,
      protocolVersion: '0.3.0',
      version: '1.0.0',
      url: `http://localhost:${this.config.port}/`,
      defaultInputModes: ['text/plain', 'application/json'],
      defaultOutputModes: ['text/plain', 'application/json'],
      skills: this.config.skills,
      capabilities: {
        streaming: true,
        pushNotifications: true,
        stateTransitionHistory: true,
      },
    };
  }

  protected async initializeConnections(): Promise<void> {
    const agentPorts = [4001, 4002, 4003, 4004, 4005, 4006];
    
    for (const port of agentPorts) {
      if (port !== this.config.port) {
        await this.connectToAgent(port);
      }
    }
  }

  private async connectToAgent(port: number, retries: number = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const client = await A2AClient.fromCardUrl(
          `http://localhost:${port}/.well-known/agent-card.json`
        );
        this.clients.set(`agent-${port}`, client);
        console.log(`✅ Connected to agent on port ${port}`);
        return;
      } catch (error) {
        if (attempt === retries) {
          console.log(`⚠️  Could not connect to agent on port ${port} after ${retries} attempts`);
        } else {
          console.log(`⚠️  Attempt ${attempt}/${retries}: Could not connect to agent on port ${port}, retrying in 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }

  async sendA2AMessage(payload: A2AMessagePayload, targetAgents?: string[]): Promise<void> {
    const message: Message = {
      kind: 'message',
      messageId: uuidv4(),
      role: 'user',
      parts: [{
        kind: 'text',
        text: JSON.stringify(payload)
      }],
      contextId: payload.contextId
    };

    const sendParams: MessageSendParams = { message };

    if (targetAgents) {
      // Send to specific agents
      for (const agentId of targetAgents) {
        const client = this.clients.get(agentId);
        if (client) {
          try {
            await client.sendMessage(sendParams);
            console.log(`📤 Sent message to ${agentId}`);
          } catch (error) {
            console.error(`❌ Failed to send message to ${agentId}:`, error);
          }
        }
      }
    } else {
      // Broadcast to all connected agents
      for (const [agentId, client] of this.clients) {
        try {
          await client.sendMessage(sendParams);
          console.log(`📤 Broadcasted message to ${agentId}`);
        } catch (error) {
          console.error(`❌ Failed to broadcast to ${agentId}:`, error);
        }
      }
    }
  }

  // A2A Protocol implementation
  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      let payload: A2AMessagePayload;

      // Try to extract the message from the request context
      // The A2A system should provide the message data somehow
      console.log(`🔍 DEBUG: RequestContext keys:`, Object.keys(requestContext));
      console.log(`🔍 DEBUG: RequestContext:`, JSON.stringify(requestContext, null, 2));

      // Check if the request has a body or data property that contains our message
      const requestData = (requestContext as any);
      
      // First try to parse from userMessage.parts[0].text (A2A message format)
      if (requestContext.userMessage && 
          requestContext.userMessage.parts && 
          requestContext.userMessage.parts[0] && 
          (requestContext.userMessage.parts[0] as any).text) {
        try {
          const messageText = (requestContext.userMessage.parts[0] as any).text;
          console.log(`🔍 DEBUG: Parsing message from userMessage.parts[0].text:`, messageText);
          payload = JSON.parse(messageText);
          console.log(`📨 ${this.config.name} received message:`, payload.messageType);
        } catch (parseError) {
          console.log(`❌ Failed to parse JSON from userMessage.parts[0].text:`, parseError);
          payload = this.createFallbackPayload(requestContext);
        }
      } else if (requestData.body && typeof requestData.body === 'string') {
        try {
          payload = JSON.parse(requestData.body);
          console.log(`📨 ${this.config.name} received message:`, payload.messageType);
        } catch (parseError) {
          console.log(`📨 ${this.config.name} received non-JSON body:`, requestData.body);
          payload = this.createFallbackPayload(requestContext);
        }
      } else if (requestData.data) {
        payload = requestData.data as A2AMessagePayload;
        console.log(`📨 ${this.config.name} received message:`, payload.messageType);
      } else {
        // Fallback: create a default alert_decision payload
        payload = this.createFallbackPayload(requestContext);
        console.log(`📨 ${this.config.name} received empty request, using fallback:`, payload.messageType);
      }
      
      // Process the message
      await this.processMessage(payload, eventBus);
      
      // Signal completion
      eventBus.finished();
    } catch (error) {
      console.error(`❌ Error in ${this.config.name} execution:`, error);
      eventBus.finished();
    }
  }

  private createFallbackPayload(requestContext: RequestContext): A2AMessagePayload {
    return {
      messageType: 'alert_decision',
      data: { 
        id: requestContext.taskId,
        tokenAddress: '',
        symbol: 'UNKNOWN',
        alertType: 'WATCH',
        confidence: 50,
        reasoning: `Task executed by ${this.config.name}`,
        timestamp: Date.now()
      } as AlertSignal,
      agentId: this.config.id,
      timestamp: Date.now(),
      contextId: requestContext.contextId || uuidv4()
    };
  }

  async cancelTask(): Promise<void> {
    console.log(`🛑 ${this.config.name} task cancelled`);
  }

  protected abstract processMessage(
    payload: A2AMessagePayload,
    eventBus: ExecutionEventBus
  ): Promise<void>;

  async shutdown(): Promise<void> {
    console.log(`🛑 Shutting down ${this.config.name}...`);
    if (this.server) {
      this.server.close();
    }
  }
}