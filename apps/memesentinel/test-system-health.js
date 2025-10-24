const axios = require('axios');

async function testSystemHealth() {
  console.log('🔍 Testing MemeSentinel System Health...\n');

  const agents = [
    { name: 'Scout', port: 4001, expectedFeatures: ['token discovery', 'DEX monitoring'] },
    { name: 'Yield', port: 4002, expectedFeatures: ['liquidity analysis', 'APY calculation'] },
    { name: 'Risk', port: 4003, expectedFeatures: ['risk assessment', 'rug detection'] },
    { name: 'Alert', port: 4004, expectedFeatures: ['alert generation', 'decision making'] },
    { name: 'Settlement', port: 4005, expectedFeatures: ['Hedera integration', 'settlement processing'] },
    { name: 'Assistant', port: 4006, expectedFeatures: ['dashboard', 'user interface'] }
  ];

  const results = {
    agentsOnline: 0,
    agentsOffline: 0,
    totalAgents: agents.length,
    healthChecks: []
  };

  for (const agent of agents) {
    try {
      console.log(`🔍 Testing ${agent.name} Agent on port ${agent.port}...`);
      
      const startTime = Date.now();
      // Use agent card endpoint instead of /health
      const response = await axios.get(`http://localhost:${agent.port}/.well-known/agent-card.json`, {
        timeout: 5000
      });
      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        // Agent is responding properly via agent card endpoint
        console.log(`✅ ${agent.name} Agent: ONLINE (${responseTime}ms)`);
        results.agentsOnline++;
        results.healthChecks.push({
          agent: agent.name,
          status: 'online',
          responseTime,
          port: agent.port
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${agent.name} Agent: OFFLINE (${error.message})`);
      results.agentsOffline++;
      results.healthChecks.push({
        agent: agent.name,
        status: 'offline',
        error: error.message,
        port: agent.port
      });
    }
    console.log('');
  }

  // Overall system health
  console.log('📊 SYSTEM HEALTH SUMMARY');
  console.log('========================');
  console.log(`Total Agents: ${results.totalAgents}`);
  console.log(`Online: ${results.agentsOnline} ✅`);
  console.log(`Offline: ${results.agentsOffline} ❌`);
  
  const healthPercentage = (results.agentsOnline / results.totalAgents) * 100;
  console.log(`System Health: ${healthPercentage.toFixed(1)}%`);

  if (healthPercentage === 100) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL');
  } else if (healthPercentage >= 80) {
    console.log('⚠️  SYSTEM MOSTLY OPERATIONAL');
  } else if (healthPercentage >= 50) {
    console.log('🚨 SYSTEM PARTIALLY OPERATIONAL');
  } else {
    console.log('💥 SYSTEM CRITICAL - MULTIPLE FAILURES');
  }

  console.log('\n🔧 TROUBLESHOOTING TIPS:');
  console.log('- If agents are offline, run: npm run start:all');
  console.log('- Check individual agent logs for specific errors');
  console.log('- Ensure no port conflicts (4001-4006)');
  console.log('- Verify .env file contains required configuration');

  return results;
}

// Run the test
testSystemHealth().catch(error => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});