/**
 * Test script to verify the orchestrator works correctly
 */

import { MemeSentinelOrchestrator } from './src/orchestrator';

async function testOrchestrator() {
  console.log('🧪 Testing MemeSentinel Orchestrator...');
  
  const orchestrator = new MemeSentinelOrchestrator();
  
  try {
    // Start the system
    await orchestrator.start();
    
    // Wait 10 seconds to let everything initialize
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check system health
    const health = await orchestrator.getSystemHealth();
    console.log('📊 System Health:', JSON.stringify(health, null, 2));
    
    // Keep running for a bit to test
    console.log('⏱️  Running for 30 seconds then shutting down...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('🏁 Test completed');
  process.exit(0);
}

if (require.main === module) {
  testOrchestrator();
}