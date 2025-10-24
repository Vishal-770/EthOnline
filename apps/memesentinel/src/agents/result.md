
> memesentinel@1.0.0 scout
> tsx src/agents/scout.ts

🚀 Initializing Memecoin Scout Agent...
✅ Memecoin Scout Agent started on port 4001
📄 Agent card: http://localhost:4001/.well-known/agent-card.json
⚠️  Attempt 1/3: Could not connect to agent on port 4002, retrying in 2s...
⚠️  Attempt 2/3: Could not connect to agent on port 4002, retrying in 2s...
✅ Connected to agent on port 4002
⚠️  Attempt 1/3: Could not connect to agent on port 4003, retrying in 2s...
✅ Connected to agent on port 4003
⚠️  Attempt 1/3: Could not connect to agent on port 4004, retrying in 2s...
✅ Connected to agent on port 4004
⚠️  Attempt 1/3: Could not connect to agent on port 4005, retrying in 2s...
✅ Connected to agent on port 4005
⚠️  Attempt 1/3: Could not connect to agent on port 4006, retrying in 2s...
✅ Connected to agent on port 4006
🔍 Memecoin Scout Agent initialized
📊 Starting DEX monitoring...
⏰ Scheduled scanning every 5 minutes
🔍 Scanning DEX platforms for new tokens...
🚀 Fetching real data from DefiLlama and CoinGecko...
📊 Fetching DefiLlama protocols...
✅ DefiLlama: Found 3 protocols
💰 Fetching CoinGecko memecoins...
✅ CoinGecko: Found 5 memecoins
📊 Real data discovery completed: 5 tokens found
🎯 Found 5 new pairs
🪙 New memecoin discovered: IMF (dl-6405) on DefiLlama
📤 Broadcasted message to agent-4002
📤 Broadcasted message to agent-4003
📤 Broadcasted message to agent-4004
📤 Broadcasted message to agent-4005
📤 Broadcasted message to agent-4006
🪙 New memecoin discovered: - (dl-5174) on DefiLlama
📤 Broadcasted message to agent-4002
📤 Broadcasted message to agent-4003
📤 Broadcasted message to agent-4004
📤 Broadcasted message to agent-4005
📤 Broadcasted message to agent-4006
🪙 New memecoin discovered: BabyDoge (dl-2169) on DefiLlama
📤 Broadcasted message to agent-4002
📤 Broadcasted message to agent-4003
📤 Broadcasted message to agent-4004
📤 Broadcasted message to agent-4005
📤 Broadcasted message to agent-4006
🪙 New memecoin discovered: DOGE (cg-doge) on CoinGecko Meme
📤 Broadcasted message to agent-4002
📤 Broadcasted message to agent-4003
📤 Broadcasted message to agent-4004
📤 Broadcasted message to agent-4005
📤 Broadcasted message to agent-4006
🪙 New memecoin discovered: SHIB (cg-shib) on CoinGecko Meme
📤 Broadcasted message to agent-4002
📤 Broadcasted message to agent-4003
📤 Broadcasted message to agent-4004
📤 Broadcasted message to agent-4005
📤 Broadcasted message to agent-4006


> memesentinel@1.0.0 yield
> tsx src/agents/yield.ts

🚀 Initializing Yield & Liquidity Agent...
✅ Yield & Liquidity Agent started on port 4002
📄 Agent card: http://localhost:4002/.well-known/agent-card.json
✅ Connected to agent on port 4001
⚠️  Attempt 1/3: Could not connect to agent on port 4003, retrying in 2s...
⚠️  Attempt 2/3: Could not connect to agent on port 4003, retrying in 2s...
✅ Connected to agent on port 4003
⚠️  Attempt 1/3: Could not connect to agent on port 4004, retrying in 2s...
✅ Connected to agent on port 4004
⚠️  Attempt 1/3: Could not connect to agent on port 4005, retrying in 2s...
✅ Connected to agent on port 4005
⚠️  Attempt 1/3: Could not connect to agent on port 4006, retrying in 2s...
✅ Connected to agent on port 4006
📊 Yield & Liquidity Agent initialized
💰 Starting liquidity monitoring...
⏰ Scheduled yield analysis every 10 minutes
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "3cabf709-33e7-4e6f-97cd-16479dd382b7",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"IMF\",\"name\":\"International Meme Fund V2\",\"address\":\"dl-6405\",\"priceUSD\":0,\"liquidity\":1167720.4933398215,\"marketCap\":11677204.933398213,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":583860.2466699107,\"priceChange24h\":-31.35966650349863,\"holders\":0,\"socialScore\":12,\"riskLevel\":\"medium\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248205682,\"contextId\":\"dl-6405\"}"
      }
    ],
    "contextId": "dl-6405"
  },
  "taskId": "3db4c4a1-6c95-4fd9-a4ef-2d655af0466d",
  "contextId": "dl-6405"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"IMF","name":"International Meme Fund V2","address":"dl-6405","priceUSD":0,"liquidity":1167720.4933398215,"marketCap":11677204.933398213,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":583860.2466699107,"priceChange24h":-31.35966650349863,"holders":0,"socialScore":12,"riskLevel":"medium"},"agentId":"memecoin-scout","timestamp":1761248205682,"contextId":"dl-6405"}
📨 Yield & Liquidity Agent received message: token_discovery
🔍 New token discovered: IMF (dl-6405)
💰 Queuing yield analysis for dl-6405
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "eef31004-4460-43b7-939d-3fd5a8217c37",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"-\",\"name\":\"four.meme\",\"address\":\"dl-5174\",\"priceUSD\":0,\"liquidity\":777905.9568678057,\"marketCap\":7779059.568678056,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":388952.97843390284,\"priceChange24h\":6.806206503479672,\"holders\":0,\"socialScore\":8,\"riskLevel\":\"high\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248205868,\"contextId\":\"dl-5174\"}"
      }
    ],
    "contextId": "dl-5174"
  },
  "taskId": "63e7679a-7096-4f11-b71c-faa89207ebed",
  "contextId": "dl-5174"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"-","name":"four.meme","address":"dl-5174","priceUSD":0,"liquidity":777905.9568678057,"marketCap":7779059.568678056,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":388952.97843390284,"priceChange24h":6.806206503479672,"holders":0,"socialScore":8,"riskLevel":"high"},"agentId":"memecoin-scout","timestamp":1761248205868,"contextId":"dl-5174"}
📨 Yield & Liquidity Agent received message: token_discovery
🔍 New token discovered: - (dl-5174)
💰 Queuing yield analysis for dl-5174
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "a6686a1e-4426-462e-8f54-0dc744109d81",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"BabyDoge\",\"name\":\"BabyDogeSwap\",\"address\":\"dl-2169\",\"priceUSD\":0,\"liquidity\":276896.6402800743,\"marketCap\":2768966.402800743,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":138448.32014003716,\"priceChange24h\":2.427517089741187,\"holders\":0,\"socialScore\":3,\"riskLevel\":\"high\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206007,\"contextId\":\"dl-2169\"}"
      }
    ],
    "contextId": "dl-2169"
  },
  "taskId": "29c2bfba-15e7-4f4d-ad3f-96f0361ae26a",
  "contextId": "dl-2169"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"BabyDoge","name":"BabyDogeSwap","address":"dl-2169","priceUSD":0,"liquidity":276896.6402800743,"marketCap":2768966.402800743,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":138448.32014003716,"priceChange24h":2.427517089741187,"holders":0,"socialScore":3,"riskLevel":"high"},"agentId":"memecoin-scout","timestamp":1761248206007,"contextId":"dl-2169"}
📨 Yield & Liquidity Agent received message: token_discovery
🔍 New token discovered: BabyDoge (dl-2169)
💰 Queuing yield analysis for dl-2169
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "0e35ea62-93cf-4b4b-af73-0f9bc30a9ac0",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"DOGE\",\"name\":\"Dogecoin\",\"address\":\"cg-doge\",\"priceUSD\":0.195635,\"liquidity\":1883114744,\"marketCap\":29641089526,\"dex\":\"CoinGecko Meme\",\"timestamp\":1761248205680,\"volume24h\":1883114744,\"priceChange24h\":2.17991,\"holders\":0,\"socialScore\":99,\"riskLevel\":\"low\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206146,\"contextId\":\"cg-doge\"}"
      }
    ],
    "contextId": "cg-doge"
  },
  "taskId": "7964edb2-9521-4d61-bd55-0a975743579b",
  "contextId": "cg-doge"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"DOGE","name":"Dogecoin","address":"cg-doge","priceUSD":0.195635,"liquidity":1883114744,"marketCap":29641089526,"dex":"CoinGecko Meme","timestamp":1761248205680,"volume24h":1883114744,"priceChange24h":2.17991,"holders":0,"socialScore":99,"riskLevel":"low"},"agentId":"memecoin-scout","timestamp":1761248206146,"contextId":"cg-doge"}
📨 Yield & Liquidity Agent received message: token_discovery
🔍 New token discovered: DOGE (cg-doge)
💰 Queuing yield analysis for cg-doge
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "c7fd3dd9-88b9-4b56-8f77-616e4fc131ba",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"SHIB\",\"name\":\"Shiba Inu\",\"address\":\"cg-shib\",\"priceUSD\":0.00001012,\"liquidity\":164822921,\"marketCap\":5967077184,\"dex\":\"CoinGecko Meme\",\"timestamp\":1761248205680,\"volume24h\":164822921,\"priceChange24h\":2.26499,\"holders\":0,\"socialScore\":97,\"riskLevel\":\"low\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206284,\"contextId\":\"cg-shib\"}"
      }
    ],
    "contextId": "cg-shib"
  },
  "taskId": "291a3843-2622-4375-8b8e-5a4b7a04e3ed",
  "contextId": "cg-shib"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"SHIB","name":"Shiba Inu","address":"cg-shib","priceUSD":0.00001012,"liquidity":164822921,"marketCap":5967077184,"dex":"CoinGecko Meme","timestamp":1761248205680,"volume24h":164822921,"priceChange24h":2.26499,"holders":0,"socialScore":97,"riskLevel":"low"},"agentId":"memecoin-scout","timestamp":1761248206284,"contextId":"cg-shib"}
📨 Yield & Liquidity Agent received message: token_discovery
🔍 New token discovered: SHIB (cg-shib)
💰 Queuing yield analysis for cg-shib
Task ID not found for event message.
💰 Analyzing yield for token: dl-6405
✅ Yield analysis complete for dl-6405: APY 21.24%, TVL $41,173
📤 Sent message to agent-4004
💰 Analyzing yield for token: dl-5174
✅ Yield analysis complete for dl-5174: APY 73.01%, TVL $19,936
📤 Sent message to agent-4004
💰 Analyzing yield for token: dl-2169
✅ Yield analysis complete for dl-2169: APY 54.08%, TVL $52,604
📤 Sent message to agent-4004
💰 Analyzing yield for token: cg-doge
✅ Yield analysis complete for cg-doge: APY 48.65%, TVL $216,234
📤 Sent message to agent-4004
💰 Analyzing yield for token: cg-shib
✅ Yield analysis complete for cg-shib: APY 76.94%, TVL $260,799
📤 Sent message to agent-4004


> memesentinel@1.0.0 risk
> tsx src/agents/risk.ts

🚀 Initializing Risk Analysis Agent...
✅ Risk Analysis Agent started on port 4003
📄 Agent card: http://localhost:4003/.well-known/agent-card.json
✅ Connected to agent on port 4001
✅ Connected to agent on port 4002
⚠️  Attempt 1/3: Could not connect to agent on port 4004, retrying in 2s...
✅ Connected to agent on port 4004
⚠️  Attempt 1/3: Could not connect to agent on port 4005, retrying in 2s...
⚠️  Attempt 2/3: Could not connect to agent on port 4005, retrying in 2s...
✅ Connected to agent on port 4005
⚠️  Attempt 1/3: Could not connect to agent on port 4006, retrying in 2s...
✅ Connected to agent on port 4006
⚠️  Risk Analysis Agent initialized
🔍 Starting risk monitoring...
⏰ Scheduled risk analysis every hour
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "3cabf709-33e7-4e6f-97cd-16479dd382b7",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"IMF\",\"name\":\"International Meme Fund V2\",\"address\":\"dl-6405\",\"priceUSD\":0,\"liquidity\":1167720.4933398215,\"marketCap\":11677204.933398213,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":583860.2466699107,\"priceChange24h\":-31.35966650349863,\"holders\":0,\"socialScore\":12,\"riskLevel\":\"medium\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248205682,\"contextId\":\"dl-6405\"}"
      }
    ],
    "contextId": "dl-6405"
  },
  "taskId": "ff6752ed-555b-411e-a790-30569e28d1f6",
  "contextId": "dl-6405"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"IMF","name":"International Meme Fund V2","address":"dl-6405","priceUSD":0,"liquidity":1167720.4933398215,"marketCap":11677204.933398213,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":583860.2466699107,"priceChange24h":-31.35966650349863,"holders":0,"socialScore":12,"riskLevel":"medium"},"agentId":"memecoin-scout","timestamp":1761248205682,"contextId":"dl-6405"}
📨 Risk Analysis Agent received message: token_discovery
🔍 New token discovered: IMF (dl-6405)
⚠️  Queuing risk analysis for dl-6405
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "eef31004-4460-43b7-939d-3fd5a8217c37",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"-\",\"name\":\"four.meme\",\"address\":\"dl-5174\",\"priceUSD\":0,\"liquidity\":777905.9568678057,\"marketCap\":7779059.568678056,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":388952.97843390284,\"priceChange24h\":6.806206503479672,\"holders\":0,\"socialScore\":8,\"riskLevel\":\"high\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248205868,\"contextId\":\"dl-5174\"}"
      }
    ],
    "contextId": "dl-5174"
  },
  "taskId": "3dcaf1be-0742-481a-b168-a4f4e02f639e",
  "contextId": "dl-5174"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"-","name":"four.meme","address":"dl-5174","priceUSD":0,"liquidity":777905.9568678057,"marketCap":7779059.568678056,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":388952.97843390284,"priceChange24h":6.806206503479672,"holders":0,"socialScore":8,"riskLevel":"high"},"agentId":"memecoin-scout","timestamp":1761248205868,"contextId":"dl-5174"}
📨 Risk Analysis Agent received message: token_discovery
🔍 New token discovered: - (dl-5174)
⚠️  Queuing risk analysis for dl-5174
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "a6686a1e-4426-462e-8f54-0dc744109d81",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"BabyDoge\",\"name\":\"BabyDogeSwap\",\"address\":\"dl-2169\",\"priceUSD\":0,\"liquidity\":276896.6402800743,\"marketCap\":2768966.402800743,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":138448.32014003716,\"priceChange24h\":2.427517089741187,\"holders\":0,\"socialScore\":3,\"riskLevel\":\"high\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206007,\"contextId\":\"dl-2169\"}"
      }
    ],
    "contextId": "dl-2169"
  },
  "taskId": "211ac4d4-4c73-4734-884e-d7660072381c",
  "contextId": "dl-2169"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"BabyDoge","name":"BabyDogeSwap","address":"dl-2169","priceUSD":0,"liquidity":276896.6402800743,"marketCap":2768966.402800743,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":138448.32014003716,"priceChange24h":2.427517089741187,"holders":0,"socialScore":3,"riskLevel":"high"},"agentId":"memecoin-scout","timestamp":1761248206007,"contextId":"dl-2169"}
📨 Risk Analysis Agent received message: token_discovery
🔍 New token discovered: BabyDoge (dl-2169)
⚠️  Queuing risk analysis for dl-2169
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "0e35ea62-93cf-4b4b-af73-0f9bc30a9ac0",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"DOGE\",\"name\":\"Dogecoin\",\"address\":\"cg-doge\",\"priceUSD\":0.195635,\"liquidity\":1883114744,\"marketCap\":29641089526,\"dex\":\"CoinGecko Meme\",\"timestamp\":1761248205680,\"volume24h\":1883114744,\"priceChange24h\":2.17991,\"holders\":0,\"socialScore\":99,\"riskLevel\":\"low\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206146,\"contextId\":\"cg-doge\"}"
      }
    ],
    "contextId": "cg-doge"
  },
  "taskId": "7181c105-387e-4f45-97f5-eb8764933a38",
  "contextId": "cg-doge"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"DOGE","name":"Dogecoin","address":"cg-doge","priceUSD":0.195635,"liquidity":1883114744,"marketCap":29641089526,"dex":"CoinGecko Meme","timestamp":1761248205680,"volume24h":1883114744,"priceChange24h":2.17991,"holders":0,"socialScore":99,"riskLevel":"low"},"agentId":"memecoin-scout","timestamp":1761248206146,"contextId":"cg-doge"}
📨 Risk Analysis Agent received message: token_discovery
🔍 New token discovered: DOGE (cg-doge)
⚠️  Queuing risk analysis for cg-doge
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "c7fd3dd9-88b9-4b56-8f77-616e4fc131ba",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"SHIB\",\"name\":\"Shiba Inu\",\"address\":\"cg-shib\",\"priceUSD\":0.00001012,\"liquidity\":164822921,\"marketCap\":5967077184,\"dex\":\"CoinGecko Meme\",\"timestamp\":1761248205680,\"volume24h\":164822921,\"priceChange24h\":2.26499,\"holders\":0,\"socialScore\":97,\"riskLevel\":\"low\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206284,\"contextId\":\"cg-shib\"}"
      }
    ],
    "contextId": "cg-shib"
  },
  "taskId": "287c2a4d-a058-4d5a-bae7-ac048b130115",
  "contextId": "cg-shib"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"SHIB","name":"Shiba Inu","address":"cg-shib","priceUSD":0.00001012,"liquidity":164822921,"marketCap":5967077184,"dex":"CoinGecko Meme","timestamp":1761248205680,"volume24h":164822921,"priceChange24h":2.26499,"holders":0,"socialScore":97,"riskLevel":"low"},"agentId":"memecoin-scout","timestamp":1761248206284,"contextId":"cg-shib"}
📨 Risk Analysis Agent received message: token_discovery
🔍 New token discovered: SHIB (cg-shib)
⚠️  Queuing risk analysis for cg-shib
Task ID not found for event message.
⚠️  Analyzing risk for token: cg-shib
🔍 Analyzing risk for token: cg-shib
📝 Using mock contract analysis for demo token: cg-shib
✅ Risk analysis complete for cg-shib: LOW risk (20/100)
📤 Sent message to agent-4004
⚠️  Analyzing risk for token: cg-doge
🔍 Analyzing risk for token: cg-doge
📝 Using mock contract analysis for demo token: cg-doge
✅ Risk analysis complete for cg-doge: MEDIUM risk (35/100)
📤 Sent message to agent-4004
⚠️  Analyzing risk for token: dl-2169
🔍 Analyzing risk for token: dl-2169
📝 Using mock contract analysis for demo token: dl-2169
✅ Risk analysis complete for dl-2169: LOW risk (20/100)
📤 Sent message to agent-4004
⚠️  Analyzing risk for token: dl-5174
🔍 Analyzing risk for token: dl-5174
📝 Using mock contract analysis for demo token: dl-5174
✅ Risk analysis complete for dl-5174: MEDIUM risk (35/100)
📤 Sent message to agent-4004
⚠️  Analyzing risk for token: dl-6405
🔍 Analyzing risk for token: dl-6405
📝 Using mock contract analysis for demo token: dl-6405
✅ Risk analysis complete for dl-6405: LOW risk (25/100)
📤 Sent message to agent-4004


> memesentinel@1.0.0 alert
> tsx src/agents/alert.ts

🚀 Initializing Alert Agent...
✅ Alert Agent started on port 4004
📄 Agent card: http://localhost:4004/.well-known/agent-card.json
✅ Connected to agent on port 4001
✅ Connected to agent on port 4002
✅ Connected to agent on port 4003
⚠️  Attempt 1/3: Could not connect to agent on port 4005, retrying in 2s...
⚠️  Attempt 2/3: Could not connect to agent on port 4005, retrying in 2s...
✅ Connected to agent on port 4005
⚠️  Attempt 1/3: Could not connect to agent on port 4006, retrying in 2s...
✅ Connected to agent on port 4006
🚨 Alert Agent initialized
🎯 Starting signal generation...
⏰ Scheduled decision making every 5 minutes
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "3cabf709-33e7-4e6f-97cd-16479dd382b7",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"IMF\",\"name\":\"International Meme Fund V2\",\"address\":\"dl-6405\",\"priceUSD\":0,\"liquidity\":1167720.4933398215,\"marketCap\":11677204.933398213,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":583860.2466699107,\"priceChange24h\":-31.35966650349863,\"holders\":0,\"socialScore\":12,\"riskLevel\":\"medium\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248205682,\"contextId\":\"dl-6405\"}"
      }
    ],
    "contextId": "dl-6405"
  },
  "taskId": "87f4b6de-2294-4dc2-9d5f-690897356560",
  "contextId": "dl-6405"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"IMF","name":"International Meme Fund V2","address":"dl-6405","priceUSD":0,"liquidity":1167720.4933398215,"marketCap":11677204.933398213,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":583860.2466699107,"priceChange24h":-31.35966650349863,"holders":0,"socialScore":12,"riskLevel":"medium"},"agentId":"memecoin-scout","timestamp":1761248205682,"contextId":"dl-6405"}
📨 Alert Agent received message: token_discovery
📨 Alert Agent received message: token_discovery
🔍 DEBUG: Message from agent memecoin-scout, contextId: dl-6405
🎯 Processing token discovery...
🎯 DEBUG: Raw token discovery payload: {
  "symbol": "IMF",
  "name": "International Meme Fund V2",
  "address": "dl-6405",
  "priceUSD": 0,
  "liquidity": 1167720.4933398215,
  "marketCap": 11677204.933398213,
  "dex": "DefiLlama",
  "timestamp": 1761248205034,
  "volume24h": 583860.2466699107,
  "priceChange24h": -31.35966650349863,
  "holders": 0,
  "socialScore": 12,
  "riskLevel": "medium"
}
🔍 Token discovery received: IMF (dl-6405)
🔍 DEBUG: Full token data - name: International Meme Fund V2, symbol: IMF, address: dl-6405
✅ Token IMF added to analysis tracking
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "eef31004-4460-43b7-939d-3fd5a8217c37",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"-\",\"name\":\"four.meme\",\"address\":\"dl-5174\",\"priceUSD\":0,\"liquidity\":777905.9568678057,\"marketCap\":7779059.568678056,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":388952.97843390284,\"priceChange24h\":6.806206503479672,\"holders\":0,\"socialScore\":8,\"riskLevel\":\"high\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248205868,\"contextId\":\"dl-5174\"}"
      }
    ],
    "contextId": "dl-5174"
  },
  "taskId": "3d7d0dc5-0772-4b6f-967d-515dd4077450",
  "contextId": "dl-5174"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"-","name":"four.meme","address":"dl-5174","priceUSD":0,"liquidity":777905.9568678057,"marketCap":7779059.568678056,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":388952.97843390284,"priceChange24h":6.806206503479672,"holders":0,"socialScore":8,"riskLevel":"high"},"agentId":"memecoin-scout","timestamp":1761248205868,"contextId":"dl-5174"}
📨 Alert Agent received message: token_discovery
📨 Alert Agent received message: token_discovery
🔍 DEBUG: Message from agent memecoin-scout, contextId: dl-5174
🎯 Processing token discovery...
🎯 DEBUG: Raw token discovery payload: {
  "symbol": "-",
  "name": "four.meme",
  "address": "dl-5174",
  "priceUSD": 0,
  "liquidity": 777905.9568678057,
  "marketCap": 7779059.568678056,
  "dex": "DefiLlama",
  "timestamp": 1761248205034,
  "volume24h": 388952.97843390284,
  "priceChange24h": 6.806206503479672,
  "holders": 0,
  "socialScore": 8,
  "riskLevel": "high"
}
🔍 Token discovery received: - (dl-5174)
🔍 DEBUG: Full token data - name: four.meme, symbol: -, address: dl-5174
✅ Token - added to analysis tracking
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "a6686a1e-4426-462e-8f54-0dc744109d81",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"BabyDoge\",\"name\":\"BabyDogeSwap\",\"address\":\"dl-2169\",\"priceUSD\":0,\"liquidity\":276896.6402800743,\"marketCap\":2768966.402800743,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":138448.32014003716,\"priceChange24h\":2.427517089741187,\"holders\":0,\"socialScore\":3,\"riskLevel\":\"high\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206007,\"contextId\":\"dl-2169\"}"
      }
    ],
    "contextId": "dl-2169"
  },
  "taskId": "62a66d69-2ef5-4727-a706-9e1f05eef26c",
  "contextId": "dl-2169"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"BabyDoge","name":"BabyDogeSwap","address":"dl-2169","priceUSD":0,"liquidity":276896.6402800743,"marketCap":2768966.402800743,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":138448.32014003716,"priceChange24h":2.427517089741187,"holders":0,"socialScore":3,"riskLevel":"high"},"agentId":"memecoin-scout","timestamp":1761248206007,"contextId":"dl-2169"}
📨 Alert Agent received message: token_discovery
📨 Alert Agent received message: token_discovery
🔍 DEBUG: Message from agent memecoin-scout, contextId: dl-2169
🎯 Processing token discovery...
🎯 DEBUG: Raw token discovery payload: {
  "symbol": "BabyDoge",
  "name": "BabyDogeSwap",
  "address": "dl-2169",
  "priceUSD": 0,
  "liquidity": 276896.6402800743,
  "marketCap": 2768966.402800743,
  "dex": "DefiLlama",
  "timestamp": 1761248205034,
  "volume24h": 138448.32014003716,
  "priceChange24h": 2.427517089741187,
  "holders": 0,
  "socialScore": 3,
  "riskLevel": "high"
}
🔍 Token discovery received: BabyDoge (dl-2169)
🔍 DEBUG: Full token data - name: BabyDogeSwap, symbol: BabyDoge, address: dl-2169
✅ Token BabyDoge added to analysis tracking
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "0e35ea62-93cf-4b4b-af73-0f9bc30a9ac0",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"DOGE\",\"name\":\"Dogecoin\",\"address\":\"cg-doge\",\"priceUSD\":0.195635,\"liquidity\":1883114744,\"marketCap\":29641089526,\"dex\":\"CoinGecko Meme\",\"timestamp\":1761248205680,\"volume24h\":1883114744,\"priceChange24h\":2.17991,\"holders\":0,\"socialScore\":99,\"riskLevel\":\"low\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206146,\"contextId\":\"cg-doge\"}"
      }
    ],
    "contextId": "cg-doge"
  },
  "taskId": "83c2be46-2d1a-4c4f-85f0-220b2f7e0844",
  "contextId": "cg-doge"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"DOGE","name":"Dogecoin","address":"cg-doge","priceUSD":0.195635,"liquidity":1883114744,"marketCap":29641089526,"dex":"CoinGecko Meme","timestamp":1761248205680,"volume24h":1883114744,"priceChange24h":2.17991,"holders":0,"socialScore":99,"riskLevel":"low"},"agentId":"memecoin-scout","timestamp":1761248206146,"contextId":"cg-doge"}
📨 Alert Agent received message: token_discovery
📨 Alert Agent received message: token_discovery
🔍 DEBUG: Message from agent memecoin-scout, contextId: cg-doge
🎯 Processing token discovery...
🎯 DEBUG: Raw token discovery payload: {
  "symbol": "DOGE",
  "name": "Dogecoin",
  "address": "cg-doge",
  "priceUSD": 0.195635,
  "liquidity": 1883114744,
  "marketCap": 29641089526,
  "dex": "CoinGecko Meme",
  "timestamp": 1761248205680,
  "volume24h": 1883114744,
  "priceChange24h": 2.17991,
  "holders": 0,
  "socialScore": 99,
  "riskLevel": "low"
}
🔍 Token discovery received: DOGE (cg-doge)
🔍 DEBUG: Full token data - name: Dogecoin, symbol: DOGE, address: cg-doge
✅ Token DOGE added to analysis tracking
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "c7fd3dd9-88b9-4b56-8f77-616e4fc131ba",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"SHIB\",\"name\":\"Shiba Inu\",\"address\":\"cg-shib\",\"priceUSD\":0.00001012,\"liquidity\":164822921,\"marketCap\":5967077184,\"dex\":\"CoinGecko Meme\",\"timestamp\":1761248205680,\"volume24h\":164822921,\"priceChange24h\":2.26499,\"holders\":0,\"socialScore\":97,\"riskLevel\":\"low\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206284,\"contextId\":\"cg-shib\"}"
      }
    ],
    "contextId": "cg-shib"
  },
  "taskId": "607d1409-a551-4bb6-b272-5cb526df49da",
  "contextId": "cg-shib"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"SHIB","name":"Shiba Inu","address":"cg-shib","priceUSD":0.00001012,"liquidity":164822921,"marketCap":5967077184,"dex":"CoinGecko Meme","timestamp":1761248205680,"volume24h":164822921,"priceChange24h":2.26499,"holders":0,"socialScore":97,"riskLevel":"low"},"agentId":"memecoin-scout","timestamp":1761248206284,"contextId":"cg-shib"}
📨 Alert Agent received message: token_discovery
📨 Alert Agent received message: token_discovery
🔍 DEBUG: Message from agent memecoin-scout, contextId: cg-shib
🎯 Processing token discovery...
🎯 DEBUG: Raw token discovery payload: {
  "symbol": "SHIB",
  "name": "Shiba Inu",
  "address": "cg-shib",
  "priceUSD": 0.00001012,
  "liquidity": 164822921,
  "marketCap": 5967077184,
  "dex": "CoinGecko Meme",
  "timestamp": 1761248205680,
  "volume24h": 164822921,
  "priceChange24h": 2.26499,
  "holders": 0,
  "socialScore": 97,
  "riskLevel": "low"
}
🔍 Token discovery received: SHIB (cg-shib)
🔍 DEBUG: Full token data - name: Shiba Inu, symbol: SHIB, address: cg-shib
✅ Token SHIB added to analysis tracking
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "d283d78b-b047-41a8-93c7-10151e1dbf56",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"yield_report\",\"data\":{\"tokenAddress\":\"dl-6405\",\"pairAddress\":\"dl-6405\",\"tvl\":41173,\"apy\":21.24,\"liquidity\":9718,\"volume24h\":3769,\"priceUSD\":6.9301,\"timestamp\":1761248206300},\"agentId\":\"yield-liquidity\",\"timestamp\":1761248206315,\"contextId\":\"dl-6405\"}"
      }
    ],
    "contextId": "dl-6405"
  },
  "taskId": "c3dfc085-6763-4499-a608-8eeb0e7c8821",
  "contextId": "dl-6405"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"yield_report","data":{"tokenAddress":"dl-6405","pairAddress":"dl-6405","tvl":41173,"apy":21.24,"liquidity":9718,"volume24h":3769,"priceUSD":6.9301,"timestamp":1761248206300},"agentId":"yield-liquidity","timestamp":1761248206315,"contextId":"dl-6405"}
📨 Alert Agent received message: yield_report
📨 Alert Agent received message: yield_report
🔍 DEBUG: Message from agent yield-liquidity, contextId: dl-6405
💰 Yield report received for dl-6405: APY 21.24%
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "9cd1f3e8-9453-4576-b3c4-c14aebf55cb2",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"yield_report\",\"data\":{\"tokenAddress\":\"dl-5174\",\"pairAddress\":\"dl-5174\",\"tvl\":19936,\"apy\":73.01,\"liquidity\":8183,\"volume24h\":1164,\"priceUSD\":1.037,\"timestamp\":1761248208308},\"agentId\":\"yield-liquidity\",\"timestamp\":1761248208308,\"contextId\":\"dl-5174\"}"
      }
    ],
    "contextId": "dl-5174"
  },
  "taskId": "bce514f1-de97-4e1f-aaca-be100e8bd668",
  "contextId": "dl-5174"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"yield_report","data":{"tokenAddress":"dl-5174","pairAddress":"dl-5174","tvl":19936,"apy":73.01,"liquidity":8183,"volume24h":1164,"priceUSD":1.037,"timestamp":1761248208308},"agentId":"yield-liquidity","timestamp":1761248208308,"contextId":"dl-5174"}
📨 Alert Agent received message: yield_report
📨 Alert Agent received message: yield_report
🔍 DEBUG: Message from agent yield-liquidity, contextId: dl-5174
💰 Yield report received for dl-5174: APY 73.01%
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "e0206b4a-6fc5-439c-89c6-7a10940a88bb",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"risk_report\",\"data\":{\"tokenAddress\":\"cg-shib\",\"riskScore\":20,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":23.549999999999997,\"socialScore\":70.99772733498637,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248208833},\"agentId\":\"risk-analysis\",\"timestamp\":1761248208834,\"contextId\":\"cg-shib\"}"
      }
    ],
    "contextId": "cg-shib"
  },
  "taskId": "d04a8535-5f28-41f7-a1bc-c8c8234a60df",
  "contextId": "cg-shib"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"risk_report","data":{"tokenAddress":"cg-shib","riskScore":20,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":23.549999999999997,"socialScore":70.99772733498637,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248208833},"agentId":"risk-analysis","timestamp":1761248208834,"contextId":"cg-shib"}
📨 Alert Agent received message: risk_report
📨 Alert Agent received message: risk_report
🔍 DEBUG: Message from agent risk-analysis, contextId: cg-shib
⚠️  Risk report received for cg-shib: Score 20/100
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "c1994eeb-01e8-4399-a196-a5e7122c96f5",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"yield_report\",\"data\":{\"tokenAddress\":\"dl-2169\",\"pairAddress\":\"dl-2169\",\"tvl\":52604,\"apy\":54.08,\"liquidity\":15174,\"volume24h\":6045,\"priceUSD\":1.4005,\"timestamp\":1761248210309},\"agentId\":\"yield-liquidity\",\"timestamp\":1761248210310,\"contextId\":\"dl-2169\"}"
      }
    ],
    "contextId": "dl-2169"
  },
  "taskId": "d7eae4dd-75b6-44a0-b554-c0edaacda71c",
  "contextId": "dl-2169"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"yield_report","data":{"tokenAddress":"dl-2169","pairAddress":"dl-2169","tvl":52604,"apy":54.08,"liquidity":15174,"volume24h":6045,"priceUSD":1.4005,"timestamp":1761248210309},"agentId":"yield-liquidity","timestamp":1761248210310,"contextId":"dl-2169"}
📨 Alert Agent received message: yield_report
📨 Alert Agent received message: yield_report
🔍 DEBUG: Message from agent yield-liquidity, contextId: dl-2169
💰 Yield report received for dl-2169: APY 54.08%
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "b4da9fa3-3b7b-44fa-aaff-d5f6a2e5f3c7",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"risk_report\",\"data\":{\"tokenAddress\":\"cg-doge\",\"riskScore\":35,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":38.012438437583015,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248210999},\"agentId\":\"risk-analysis\",\"timestamp\":1761248210999,\"contextId\":\"cg-doge\"}"
      }
    ],
    "contextId": "cg-doge"
  },
  "taskId": "a00a2406-1a95-4eab-82e2-f1cdd4093525",
  "contextId": "cg-doge"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"risk_report","data":{"tokenAddress":"cg-doge","riskScore":35,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":38.012438437583015,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248210999},"agentId":"risk-analysis","timestamp":1761248210999,"contextId":"cg-doge"}
📨 Alert Agent received message: risk_report
📨 Alert Agent received message: risk_report
🔍 DEBUG: Message from agent risk-analysis, contextId: cg-doge
⚠️  Risk report received for cg-doge: Score 35/100
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "dffd64ca-0488-499f-aee4-d7a9b62e9587",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"yield_report\",\"data\":{\"tokenAddress\":\"cg-doge\",\"pairAddress\":\"cg-doge\",\"tvl\":216234,\"apy\":48.65,\"liquidity\":144021,\"volume24h\":38890,\"priceUSD\":4.137,\"timestamp\":1761248212321},\"agentId\":\"yield-liquidity\",\"timestamp\":1761248212322,\"contextId\":\"cg-doge\"}"
      }
    ],
    "contextId": "cg-doge"
  },
  "taskId": "d3a6e9e0-8ec1-47cd-a14c-c657eb8ffbc4",
  "contextId": "cg-doge"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"yield_report","data":{"tokenAddress":"cg-doge","pairAddress":"cg-doge","tvl":216234,"apy":48.65,"liquidity":144021,"volume24h":38890,"priceUSD":4.137,"timestamp":1761248212321},"agentId":"yield-liquidity","timestamp":1761248212322,"contextId":"cg-doge"}
📨 Alert Agent received message: yield_report
📨 Alert Agent received message: yield_report
🔍 DEBUG: Message from agent yield-liquidity, contextId: cg-doge
💰 Yield report received for cg-doge: APY 48.65%
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "4962db86-c17b-4e46-9de1-705474d4225a",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"risk_report\",\"data\":{\"tokenAddress\":\"dl-2169\",\"riskScore\":20,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":90.78805596598363,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248213993},\"agentId\":\"risk-analysis\",\"timestamp\":1761248213994,\"contextId\":\"dl-2169\"}"
      }
    ],
    "contextId": "dl-2169"
  },
  "taskId": "436f961c-2d1f-4399-9717-f6c6070796ec",
  "contextId": "dl-2169"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"risk_report","data":{"tokenAddress":"dl-2169","riskScore":20,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":90.78805596598363,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248213993},"agentId":"risk-analysis","timestamp":1761248213994,"contextId":"dl-2169"}
📨 Alert Agent received message: risk_report
📨 Alert Agent received message: risk_report
🔍 DEBUG: Message from agent risk-analysis, contextId: dl-2169
⚠️  Risk report received for dl-2169: Score 20/100
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "0671532e-94ac-492b-862b-85edb5e8f475",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"yield_report\",\"data\":{\"tokenAddress\":\"cg-shib\",\"pairAddress\":\"cg-shib\",\"tvl\":260799,\"apy\":76.94,\"liquidity\":106092,\"volume24h\":20732,\"priceUSD\":1.1787,\"timestamp\":1761248214324},\"agentId\":\"yield-liquidity\",\"timestamp\":1761248214325,\"contextId\":\"cg-shib\"}"
      }
    ],
    "contextId": "cg-shib"
  },
  "taskId": "29c0b5e4-c9db-4d46-9162-239519204461",
  "contextId": "cg-shib"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"yield_report","data":{"tokenAddress":"cg-shib","pairAddress":"cg-shib","tvl":260799,"apy":76.94,"liquidity":106092,"volume24h":20732,"priceUSD":1.1787,"timestamp":1761248214324},"agentId":"yield-liquidity","timestamp":1761248214325,"contextId":"cg-shib"}
📨 Alert Agent received message: yield_report
📨 Alert Agent received message: yield_report
🔍 DEBUG: Message from agent yield-liquidity, contextId: cg-shib
💰 Yield report received for cg-shib: APY 76.94%
🔍 DEBUG: Found 3 tokens ready for decision making
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "12a3ed5f-3ca9-4898-94b0-6283a0040f89",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"risk_report\",\"data\":{\"tokenAddress\":\"dl-5174\",\"riskScore\":35,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":34.71170794680318,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248217022},\"agentId\":\"risk-analysis\",\"timestamp\":1761248217023,\"contextId\":\"dl-5174\"}"
      }
    ],
    "contextId": "dl-5174"
  },
  "taskId": "38ab3760-50ed-419c-986e-e12e6013c896",
  "contextId": "dl-5174"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"risk_report","data":{"tokenAddress":"dl-5174","riskScore":35,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":34.71170794680318,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248217022},"agentId":"risk-analysis","timestamp":1761248217023,"contextId":"dl-5174"}
📨 Alert Agent received message: risk_report
📨 Alert Agent received message: risk_report
🔍 DEBUG: Message from agent risk-analysis, contextId: dl-5174
⚠️  Risk report received for dl-5174: Score 35/100
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "69791aa6-c9a4-422e-b973-74ac01a1697e",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"risk_report\",\"data\":{\"tokenAddress\":\"dl-6405\",\"riskScore\":25,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":99.68,\"socialScore\":50.340879474986735,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248220028},\"agentId\":\"risk-analysis\",\"timestamp\":1761248220029,\"contextId\":\"dl-6405\"}"
      }
    ],
    "contextId": "dl-6405"
  },
  "taskId": "5a711da4-26f9-426b-a029-8d753902eb1c",
  "contextId": "dl-6405"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"risk_report","data":{"tokenAddress":"dl-6405","riskScore":25,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":99.68,"socialScore":50.340879474986735,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248220028},"agentId":"risk-analysis","timestamp":1761248220029,"contextId":"dl-6405"}
📨 Alert Agent received message: risk_report
📨 Alert Agent received message: risk_report
🔍 DEBUG: Message from agent risk-analysis, contextId: dl-6405
⚠️  Risk report received for dl-6405: Score 25/100
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: Found 5 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding BabyDoge (dl-2169) to pending decisions
🔍 DEBUG: Adding DOGE (cg-doge) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "19cfe51f-7f34-449d-96ca-50289077fc73",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"yield_report\",\"data\":{\"tokenAddress\":\"dl-6405\",\"pairAddress\":\"dl-6405\",\"tvl\":18482,\"apy\":119.41,\"liquidity\":5060,\"volume24h\":852,\"priceUSD\":0.5792,\"timestamp\":1761248400113,\"previousAPY\":21.24,\"apyChange\":462.1939736346516,\"tvlChange\":-55.11135938600539},\"agentId\":\"yield-liquidity\",\"timestamp\":1761248400113,\"contextId\":\"dl-6405\"}"
      }
    ],
    "contextId": "dl-6405"
  },
  "taskId": "ff42b670-c755-466f-bcff-4c7dc04010ce",
  "contextId": "dl-6405"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"yield_report","data":{"tokenAddress":"dl-6405","pairAddress":"dl-6405","tvl":18482,"apy":119.41,"liquidity":5060,"volume24h":852,"priceUSD":0.5792,"timestamp":1761248400113,"previousAPY":21.24,"apyChange":462.1939736346516,"tvlChange":-55.11135938600539},"agentId":"yield-liquidity","timestamp":1761248400113,"contextId":"dl-6405"}
📨 Alert Agent received message: yield_report
📨 Alert Agent received message: yield_report
🔍 DEBUG: Message from agent yield-liquidity, contextId: dl-6405
💰 Yield report received for dl-6405: APY 119.41%
🔄 Starting scheduled decision making...
🤔 Making decisions for 5 tokens...
🎯 Generating alert for DOGE (cg-doge)
🔍 DEBUG: Creating alert for DOGE (cg-doge)
🚨 WATCH signal generated for DOGE: WATCH signal: decent APY of 48.6%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.
📤 Broadcasted message to agent-4001
📤 Broadcasted message to agent-4002
📤 Broadcasted message to agent-4003
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "fa79144b-867b-47d2-81e0-8a5ad8652a72",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"yield_report\",\"data\":{\"tokenAddress\":\"dl-5174\",\"pairAddress\":\"dl-5174\",\"tvl\":59073,\"apy\":30.1,\"liquidity\":15034,\"volume24h\":6414,\"priceUSD\":2.5253,\"timestamp\":1761248400627,\"previousAPY\":73.01,\"apyChange\":-58.77277085330776,\"tvlChange\":196.31320224719101},\"agentId\":\"yield-liquidity\",\"timestamp\":1761248400628,\"contextId\":\"dl-5174\"}"
      }
    ],
    "contextId": "dl-5174"
  },
  "taskId": "9cd18a74-848f-47fd-8cee-045fd6255e56",
  "contextId": "dl-5174"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"yield_report","data":{"tokenAddress":"dl-5174","pairAddress":"dl-5174","tvl":59073,"apy":30.1,"liquidity":15034,"volume24h":6414,"priceUSD":2.5253,"timestamp":1761248400627,"previousAPY":73.01,"apyChange":-58.77277085330776,"tvlChange":196.31320224719101},"agentId":"yield-liquidity","timestamp":1761248400628,"contextId":"dl-5174"}
📨 Alert Agent received message: yield_report
📨 Alert Agent received message: yield_report
🔍 DEBUG: Message from agent yield-liquidity, contextId: dl-5174
💰 Yield report received for dl-5174: APY 30.10%
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "62dd91b2-d51f-42ad-ba5a-c815c78f3f63",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"yield_report\",\"data\":{\"tokenAddress\":\"cg-doge\",\"pairAddress\":\"cg-doge\",\"tvl\":67064,\"apy\":41.06,\"liquidity\":20135,\"volume24h\":10142,\"priceUSD\":5.6837,\"timestamp\":1761248401661,\"previousAPY\":48.65,\"apyChange\":-15.601233299075018,\"tvlChange\":-68.98545094665963},\"agentId\":\"yield-liquidity\",\"timestamp\":1761248401661,\"contextId\":\"cg-doge\"}"
      }
    ],
    "contextId": "cg-doge"
  },
  "taskId": "79ef55c4-7ca0-4378-a9be-d84631b72f94",
  "contextId": "cg-doge"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"yield_report","data":{"tokenAddress":"cg-doge","pairAddress":"cg-doge","tvl":67064,"apy":41.06,"liquidity":20135,"volume24h":10142,"priceUSD":5.6837,"timestamp":1761248401661,"previousAPY":48.65,"apyChange":-15.601233299075018,"tvlChange":-68.98545094665963},"agentId":"yield-liquidity","timestamp":1761248401661,"contextId":"cg-doge"}
📨 Alert Agent received message: yield_report
📨 Alert Agent received message: yield_report
🔍 DEBUG: Message from agent yield-liquidity, contextId: cg-doge
💰 Yield report received for cg-doge: APY 41.06%
📤 Broadcasted message to agent-4005
📤 Broadcasted message to agent-4006
🎯 Generating alert for BabyDoge (dl-2169)
🔍 DEBUG: Creating alert for BabyDoge (dl-2169)
🚨 WATCH signal generated for BabyDoge: WATCH signal: decent APY of 54.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.
📤 Broadcasted message to agent-4001
📤 Broadcasted message to agent-4002
📤 Broadcasted message to agent-4003
🔍 DEBUG: Found 3 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
🔍 DEBUG: Adding - (dl-5174) to pending decisions
🔍 DEBUG: Adding SHIB (cg-shib) to pending decisions
📤 Broadcasted message to agent-4005
📤 Broadcasted message to agent-4006
🎯 Generating alert for SHIB (cg-shib)
🔍 DEBUG: Creating alert for SHIB (cg-shib)
🚨 WATCH signal generated for SHIB: WATCH signal: decent APY of 76.9%, manageable risk. Monitor for better entry point or risk reduction.
📤 Broadcasted message to agent-4001
📤 Broadcasted message to agent-4002
📤 Broadcasted message to agent-4003
📤 Broadcasted message to agent-4005
📤 Broadcasted message to agent-4006
🎯 Generating alert for - (dl-5174)
🔍 DEBUG: Creating alert for - (dl-5174)
🚨 WATCH signal generated for -: WATCH signal: decent APY of 30.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.
📤 Broadcasted message to agent-4001
📤 Broadcasted message to agent-4002
📤 Broadcasted message to agent-4003
🔍 DEBUG: Found 1 tokens ready for decision making
🔍 DEBUG: Adding IMF (dl-6405) to pending decisions
📤 Broadcasted message to agent-4005
📤 Broadcasted message to agent-4006
🎯 Generating alert for IMF (dl-6405)
🔍 DEBUG: Creating alert for IMF (dl-6405)
🚨 WATCH signal generated for IMF: WATCH signal: decent APY of 119.4%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.
📤 Broadcasted message to agent-4001
📤 Broadcasted message to agent-4002
📤 Broadcasted message to agent-4003
📤 Broadcasted message to agent-4005
📤 Broadcasted message to agent-4006
🔍 DEBUG: Found 0 tokens ready for decision making
🔍 DEBUG: Found 0 tokens ready for decision making
🔍 DEBUG: Found 0 tokens ready for decision making


> memesentinel@1.0.0 settlement
> tsx src/agents/settlement.ts

🚀 Initializing Settlement Agent...
✅ Settlement Agent started on port 4005
📄 Agent card: http://localhost:4005/.well-known/agent-card.json
✅ Connected to agent on port 4001
✅ Connected to agent on port 4002
✅ Connected to agent on port 4003
✅ Connected to agent on port 4004
⚠️  Attempt 1/3: Could not connect to agent on port 4006, retrying in 2s...
✅ Connected to agent on port 4006
💵 Settlement Agent initialized
🔗 Connected to Hedera Network (Testnet)
📝 Initializing Hedera topic for alert logging...
✅ Alert topic created: 0.0.7118620
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "3cabf709-33e7-4e6f-97cd-16479dd382b7",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"IMF\",\"name\":\"International Meme Fund V2\",\"address\":\"dl-6405\",\"priceUSD\":0,\"liquidity\":1167720.4933398215,\"marketCap\":11677204.933398213,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":583860.2466699107,\"priceChange24h\":-31.35966650349863,\"holders\":0,\"socialScore\":12,\"riskLevel\":\"medium\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248205682,\"contextId\":\"dl-6405\"}"
      }
    ],
    "contextId": "dl-6405"
  },
  "taskId": "46923cc1-caef-43a4-bedc-f20c8a3eefaa",
  "contextId": "dl-6405"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"IMF","name":"International Meme Fund V2","address":"dl-6405","priceUSD":0,"liquidity":1167720.4933398215,"marketCap":11677204.933398213,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":583860.2466699107,"priceChange24h":-31.35966650349863,"holders":0,"socialScore":12,"riskLevel":"medium"},"agentId":"memecoin-scout","timestamp":1761248205682,"contextId":"dl-6405"}
📨 Settlement Agent received message: token_discovery
⚠️  Unknown message type: token_discovery
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "eef31004-4460-43b7-939d-3fd5a8217c37",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"-\",\"name\":\"four.meme\",\"address\":\"dl-5174\",\"priceUSD\":0,\"liquidity\":777905.9568678057,\"marketCap\":7779059.568678056,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":388952.97843390284,\"priceChange24h\":6.806206503479672,\"holders\":0,\"socialScore\":8,\"riskLevel\":\"high\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248205868,\"contextId\":\"dl-5174\"}"
      }
    ],
    "contextId": "dl-5174"
  },
  "taskId": "ad16b967-eee6-44f9-9203-685c82a8a543",
  "contextId": "dl-5174"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"-","name":"four.meme","address":"dl-5174","priceUSD":0,"liquidity":777905.9568678057,"marketCap":7779059.568678056,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":388952.97843390284,"priceChange24h":6.806206503479672,"holders":0,"socialScore":8,"riskLevel":"high"},"agentId":"memecoin-scout","timestamp":1761248205868,"contextId":"dl-5174"}
📨 Settlement Agent received message: token_discovery
⚠️  Unknown message type: token_discovery
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "a6686a1e-4426-462e-8f54-0dc744109d81",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"BabyDoge\",\"name\":\"BabyDogeSwap\",\"address\":\"dl-2169\",\"priceUSD\":0,\"liquidity\":276896.6402800743,\"marketCap\":2768966.402800743,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":138448.32014003716,\"priceChange24h\":2.427517089741187,\"holders\":0,\"socialScore\":3,\"riskLevel\":\"high\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206007,\"contextId\":\"dl-2169\"}"
      }
    ],
    "contextId": "dl-2169"
  },
  "taskId": "0b8f15b1-6c78-44c9-b924-0611f5392844",
  "contextId": "dl-2169"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"BabyDoge","name":"BabyDogeSwap","address":"dl-2169","priceUSD":0,"liquidity":276896.6402800743,"marketCap":2768966.402800743,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":138448.32014003716,"priceChange24h":2.427517089741187,"holders":0,"socialScore":3,"riskLevel":"high"},"agentId":"memecoin-scout","timestamp":1761248206007,"contextId":"dl-2169"}
📨 Settlement Agent received message: token_discovery
⚠️  Unknown message type: token_discovery
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "0e35ea62-93cf-4b4b-af73-0f9bc30a9ac0",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"DOGE\",\"name\":\"Dogecoin\",\"address\":\"cg-doge\",\"priceUSD\":0.195635,\"liquidity\":1883114744,\"marketCap\":29641089526,\"dex\":\"CoinGecko Meme\",\"timestamp\":1761248205680,\"volume24h\":1883114744,\"priceChange24h\":2.17991,\"holders\":0,\"socialScore\":99,\"riskLevel\":\"low\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206146,\"contextId\":\"cg-doge\"}"
      }
    ],
    "contextId": "cg-doge"
  },
  "taskId": "8a4e0485-f15d-4329-b0bf-f63f86560ac8",
  "contextId": "cg-doge"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"DOGE","name":"Dogecoin","address":"cg-doge","priceUSD":0.195635,"liquidity":1883114744,"marketCap":29641089526,"dex":"CoinGecko Meme","timestamp":1761248205680,"volume24h":1883114744,"priceChange24h":2.17991,"holders":0,"socialScore":99,"riskLevel":"low"},"agentId":"memecoin-scout","timestamp":1761248206146,"contextId":"cg-doge"}
📨 Settlement Agent received message: token_discovery
⚠️  Unknown message type: token_discovery
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "c7fd3dd9-88b9-4b56-8f77-616e4fc131ba",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"SHIB\",\"name\":\"Shiba Inu\",\"address\":\"cg-shib\",\"priceUSD\":0.00001012,\"liquidity\":164822921,\"marketCap\":5967077184,\"dex\":\"CoinGecko Meme\",\"timestamp\":1761248205680,\"volume24h\":164822921,\"priceChange24h\":2.26499,\"holders\":0,\"socialScore\":97,\"riskLevel\":\"low\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206284,\"contextId\":\"cg-shib\"}"
      }
    ],
    "contextId": "cg-shib"
  },
  "taskId": "1cf8759e-a37f-4898-9e72-77b3c98f30a2",
  "contextId": "cg-shib"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"SHIB","name":"Shiba Inu","address":"cg-shib","priceUSD":0.00001012,"liquidity":164822921,"marketCap":5967077184,"dex":"CoinGecko Meme","timestamp":1761248205680,"volume24h":164822921,"priceChange24h":2.26499,"holders":0,"socialScore":97,"riskLevel":"low"},"agentId":"memecoin-scout","timestamp":1761248206284,"contextId":"cg-shib"}
📨 Settlement Agent received message: token_discovery
⚠️  Unknown message type: token_discovery
📝 Logged to HCS topic 0.0.7118620: SUCCESS
📝 Ready to handle settlements and logging
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "fd908432-e999-41da-9c00-f9f661ca532d",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"alert_decision\",\"data\":{\"id\":\"a4de2e80-ba1d-4eaf-8133-f90960dbc256\",\"tokenAddress\":\"cg-doge\",\"symbol\":\"DOGE\",\"alertType\":\"WATCH\",\"confidence\":83.825,\"reasoning\":\"WATCH signal: decent APY of 48.6%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"cg-doge\",\"pairAddress\":\"cg-doge\",\"tvl\":216234,\"apy\":48.65,\"liquidity\":144021,\"volume24h\":38890,\"priceUSD\":4.137,\"timestamp\":1761248212321},\"riskData\":{\"tokenAddress\":\"cg-doge\",\"riskScore\":35,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":38.012438437583015,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248210999},\"timestamp\":1761248400160,\"actionTaken\":false},\"agentId\":\"alert-agent\",\"timestamp\":1761248400160,\"contextId\":\"cg-doge\"}"
      }
    ],
    "contextId": "cg-doge"
  },
  "taskId": "891a4ea3-50ca-4995-abe2-fab00c492d27",
  "contextId": "cg-doge"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"alert_decision","data":{"id":"a4de2e80-ba1d-4eaf-8133-f90960dbc256","tokenAddress":"cg-doge","symbol":"DOGE","alertType":"WATCH","confidence":83.825,"reasoning":"WATCH signal: decent APY of 48.6%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"cg-doge","pairAddress":"cg-doge","tvl":216234,"apy":48.65,"liquidity":144021,"volume24h":38890,"priceUSD":4.137,"timestamp":1761248212321},"riskData":{"tokenAddress":"cg-doge","riskScore":35,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":38.012438437583015,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248210999},"timestamp":1761248400160,"actionTaken":false},"agentId":"alert-agent","timestamp":1761248400160,"contextId":"cg-doge"}
📨 Settlement Agent received message: alert_decision
🚨 Alert decision received: WATCH for DOGE
💵 Processing settlement for DOGE (WATCH)
📝 Logged to HCS topic 0.0.7118620: SUCCESS
✅ Settlement completed for DOGE: LOG_ONLY
📝 Logged to HCS topic 0.0.7118620: SUCCESS
Task ID not found for event message.
📤 Sent message to agent-4006
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "1155489f-a457-4e93-a9bc-b560c8e8e481",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"alert_decision\",\"data\":{\"id\":\"0f09c4a0-2a21-4c2d-8f6d-f194aa7db73d\",\"tokenAddress\":\"dl-2169\",\"symbol\":\"BabyDoge\",\"alertType\":\"WATCH\",\"confidence\":91.03999999999999,\"reasoning\":\"WATCH signal: decent APY of 54.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"dl-2169\",\"pairAddress\":\"dl-2169\",\"tvl\":52604,\"apy\":54.08,\"liquidity\":15174,\"volume24h\":6045,\"priceUSD\":1.4005,\"timestamp\":1761248210309},\"riskData\":{\"tokenAddress\":\"dl-2169\",\"riskScore\":20,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":90.78805596598363,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248213993},\"timestamp\":1761248403548,\"actionTaken\":false},\"agentId\":\"alert-agent\",\"timestamp\":1761248403548,\"contextId\":\"dl-2169\"}"
      }
    ],
    "contextId": "dl-2169"
  },
  "taskId": "3c2c5873-426a-461b-a89f-229eb5996a8a",
  "contextId": "dl-2169"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"alert_decision","data":{"id":"0f09c4a0-2a21-4c2d-8f6d-f194aa7db73d","tokenAddress":"dl-2169","symbol":"BabyDoge","alertType":"WATCH","confidence":91.03999999999999,"reasoning":"WATCH signal: decent APY of 54.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"dl-2169","pairAddress":"dl-2169","tvl":52604,"apy":54.08,"liquidity":15174,"volume24h":6045,"priceUSD":1.4005,"timestamp":1761248210309},"riskData":{"tokenAddress":"dl-2169","riskScore":20,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":90.78805596598363,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248213993},"timestamp":1761248403548,"actionTaken":false},"agentId":"alert-agent","timestamp":1761248403548,"contextId":"dl-2169"}
📨 Settlement Agent received message: alert_decision
🚨 Alert decision received: WATCH for BabyDoge
💵 Processing settlement for BabyDoge (WATCH)
📝 Logged to HCS topic 0.0.7118620: SUCCESS
✅ Settlement completed for BabyDoge: LOG_ONLY
📝 Logged to HCS topic 0.0.7118620: SUCCESS
Task ID not found for event message.
📤 Sent message to agent-4006
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "9f7beb32-a416-48dd-ae73-d8214c6d6bd4",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"alert_decision\",\"data\":{\"id\":\"7ffbc89f-2713-4d3c-b3eb-325be4659a74\",\"tokenAddress\":\"cg-shib\",\"symbol\":\"SHIB\",\"alertType\":\"WATCH\",\"confidence\":87.17999999999999,\"reasoning\":\"WATCH signal: decent APY of 76.9%, manageable risk. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"cg-shib\",\"pairAddress\":\"cg-shib\",\"tvl\":260799,\"apy\":76.94,\"liquidity\":106092,\"volume24h\":20732,\"priceUSD\":1.1787,\"timestamp\":1761248214324},\"riskData\":{\"tokenAddress\":\"cg-shib\",\"riskScore\":20,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":23.549999999999997,\"socialScore\":70.99772733498637,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248208833},\"timestamp\":1761248407948,\"actionTaken\":false},\"agentId\":\"alert-agent\",\"timestamp\":1761248407948,\"contextId\":\"cg-shib\"}"
      }
    ],
    "contextId": "cg-shib"
  },
  "taskId": "ff4f657e-6a27-429c-8d2c-94349f640619",
  "contextId": "cg-shib"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"alert_decision","data":{"id":"7ffbc89f-2713-4d3c-b3eb-325be4659a74","tokenAddress":"cg-shib","symbol":"SHIB","alertType":"WATCH","confidence":87.17999999999999,"reasoning":"WATCH signal: decent APY of 76.9%, manageable risk. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"cg-shib","pairAddress":"cg-shib","tvl":260799,"apy":76.94,"liquidity":106092,"volume24h":20732,"priceUSD":1.1787,"timestamp":1761248214324},"riskData":{"tokenAddress":"cg-shib","riskScore":20,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":23.549999999999997,"socialScore":70.99772733498637,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248208833},"timestamp":1761248407948,"actionTaken":false},"agentId":"alert-agent","timestamp":1761248407948,"contextId":"cg-shib"}
📨 Settlement Agent received message: alert_decision
🚨 Alert decision received: WATCH for SHIB
💵 Processing settlement for SHIB (WATCH)
📝 Logged to HCS topic 0.0.7118620: SUCCESS
✅ Settlement completed for SHIB: LOG_ONLY
📝 Logged to HCS topic 0.0.7118620: SUCCESS
Task ID not found for event message.
📤 Sent message to agent-4006
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "386969a4-78a2-4a46-9209-431cc667132b",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"alert_decision\",\"data\":{\"id\":\"ab6b2022-5cd0-4eb9-89a6-b26b80ad8aec\",\"tokenAddress\":\"dl-5174\",\"symbol\":\"-\",\"alertType\":\"WATCH\",\"confidence\":74.55,\"reasoning\":\"WATCH signal: decent APY of 30.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"dl-5174\",\"pairAddress\":\"dl-5174\",\"tvl\":59073,\"apy\":30.1,\"liquidity\":15034,\"volume24h\":6414,\"priceUSD\":2.5253,\"timestamp\":1761248400627,\"previousAPY\":73.01,\"apyChange\":-58.77277085330776,\"tvlChange\":196.31320224719101},\"riskData\":{\"tokenAddress\":\"dl-5174\",\"riskScore\":35,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":34.71170794680318,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248217022},\"timestamp\":1761248411208,\"actionTaken\":false},\"agentId\":\"alert-agent\",\"timestamp\":1761248411209,\"contextId\":\"dl-5174\"}"
      }
    ],
    "contextId": "dl-5174"
  },
  "taskId": "929e848d-2110-4dd4-a5f0-8e7ef3b9e06b",
  "contextId": "dl-5174"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"alert_decision","data":{"id":"ab6b2022-5cd0-4eb9-89a6-b26b80ad8aec","tokenAddress":"dl-5174","symbol":"-","alertType":"WATCH","confidence":74.55,"reasoning":"WATCH signal: decent APY of 30.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"dl-5174","pairAddress":"dl-5174","tvl":59073,"apy":30.1,"liquidity":15034,"volume24h":6414,"priceUSD":2.5253,"timestamp":1761248400627,"previousAPY":73.01,"apyChange":-58.77277085330776,"tvlChange":196.31320224719101},"riskData":{"tokenAddress":"dl-5174","riskScore":35,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":34.71170794680318,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248217022},"timestamp":1761248411208,"actionTaken":false},"agentId":"alert-agent","timestamp":1761248411209,"contextId":"dl-5174"}
📨 Settlement Agent received message: alert_decision
🚨 Alert decision received: WATCH for -
💵 Processing settlement for - (WATCH)
📝 Logged to HCS topic 0.0.7118620: SUCCESS
✅ Settlement completed for -: LOG_ONLY
📝 Logged to HCS topic 0.0.7118620: SUCCESS
Task ID not found for event message.
📤 Sent message to agent-4006
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "b8290070-247f-441c-802e-0bde655c1603",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"alert_decision\",\"data\":{\"id\":\"b0355cc9-46b6-49ba-83e5-99008f3521d2\",\"tokenAddress\":\"dl-6405\",\"symbol\":\"IMF\",\"alertType\":\"WATCH\",\"confidence\":100,\"reasoning\":\"WATCH signal: decent APY of 119.4%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"dl-6405\",\"pairAddress\":\"dl-6405\",\"tvl\":18482,\"apy\":119.41,\"liquidity\":5060,\"volume24h\":852,\"priceUSD\":0.5792,\"timestamp\":1761248400113,\"previousAPY\":21.24,\"apyChange\":462.1939736346516,\"tvlChange\":-55.11135938600539},\"riskData\":{\"tokenAddress\":\"dl-6405\",\"riskScore\":25,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":99.68,\"socialScore\":50.340879474986735,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248220028},\"timestamp\":1761248415606,\"actionTaken\":false},\"agentId\":\"alert-agent\",\"timestamp\":1761248415607,\"contextId\":\"dl-6405\"}"
      }
    ],
    "contextId": "dl-6405"
  },
  "taskId": "89ad1c90-180a-485d-b7db-b3473b97c957",
  "contextId": "dl-6405"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"alert_decision","data":{"id":"b0355cc9-46b6-49ba-83e5-99008f3521d2","tokenAddress":"dl-6405","symbol":"IMF","alertType":"WATCH","confidence":100,"reasoning":"WATCH signal: decent APY of 119.4%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"dl-6405","pairAddress":"dl-6405","tvl":18482,"apy":119.41,"liquidity":5060,"volume24h":852,"priceUSD":0.5792,"timestamp":1761248400113,"previousAPY":21.24,"apyChange":462.1939736346516,"tvlChange":-55.11135938600539},"riskData":{"tokenAddress":"dl-6405","riskScore":25,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":99.68,"socialScore":50.340879474986735,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248220028},"timestamp":1761248415606,"actionTaken":false},"agentId":"alert-agent","timestamp":1761248415607,"contextId":"dl-6405"}
📨 Settlement Agent received message: alert_decision
🚨 Alert decision received: WATCH for IMF
💵 Processing settlement for IMF (WATCH)
📝 Logged to HCS topic 0.0.7118620: SUCCESS
✅ Settlement completed for IMF: LOG_ONLY
📝 Logged to HCS topic 0.0.7118620: SUCCESS
Task ID not found for event message.
📤 Sent message to agent-4006


> memesentinel@1.0.0 assistant
> tsx src/agents/assistant.ts

🚀 Initializing Personal Assistant Agent...
(node:10292) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
✅ Personal Assistant Agent started on port 4006
📄 Agent card: http://localhost:4006/.well-known/agent-card.json
✅ Connected to agent on port 4001
✅ Connected to agent on port 4002
✅ Connected to agent on port 4003
✅ Connected to agent on port 4004
✅ Connected to agent on port 4005
🧠 Personal Assistant Agent initialized
📊 Dashboard available at http://localhost:4006/dashboard
⏰ Scheduled insight generation every 30 minutes
📊 Dashboard server started on port 4106
🌐 Access dashboard at: http://localhost:4106/dashboard
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "3cabf709-33e7-4e6f-97cd-16479dd382b7",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"IMF\",\"name\":\"International Meme Fund V2\",\"address\":\"dl-6405\",\"priceUSD\":0,\"liquidity\":1167720.4933398215,\"marketCap\":11677204.933398213,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":583860.2466699107,\"priceChange24h\":-31.35966650349863,\"holders\":0,\"socialScore\":12,\"riskLevel\":\"medium\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248205682,\"contextId\":\"dl-6405\"}"
      }
    ],
    "contextId": "dl-6405"
  },
  "taskId": "4cdd0b87-5f1c-42a2-80f5-78368c795d37",
  "contextId": "dl-6405"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"IMF","name":"International Meme Fund V2","address":"dl-6405","priceUSD":0,"liquidity":1167720.4933398215,"marketCap":11677204.933398213,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":583860.2466699107,"priceChange24h":-31.35966650349863,"holders":0,"socialScore":12,"riskLevel":"medium"},"agentId":"memecoin-scout","timestamp":1761248205682,"contextId":"dl-6405"}
📨 Personal Assistant Agent received message: token_discovery
🔍 Aggregating discovery data for IMF
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "eef31004-4460-43b7-939d-3fd5a8217c37",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"-\",\"name\":\"four.meme\",\"address\":\"dl-5174\",\"priceUSD\":0,\"liquidity\":777905.9568678057,\"marketCap\":7779059.568678056,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":388952.97843390284,\"priceChange24h\":6.806206503479672,\"holders\":0,\"socialScore\":8,\"riskLevel\":\"high\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248205868,\"contextId\":\"dl-5174\"}"
      }
    ],
    "contextId": "dl-5174"
  },
  "taskId": "21d222eb-4d99-46f1-9e7a-71c3f8e835fe",
  "contextId": "dl-5174"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"-","name":"four.meme","address":"dl-5174","priceUSD":0,"liquidity":777905.9568678057,"marketCap":7779059.568678056,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":388952.97843390284,"priceChange24h":6.806206503479672,"holders":0,"socialScore":8,"riskLevel":"high"},"agentId":"memecoin-scout","timestamp":1761248205868,"contextId":"dl-5174"}
📨 Personal Assistant Agent received message: token_discovery
🔍 Aggregating discovery data for -
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "a6686a1e-4426-462e-8f54-0dc744109d81",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"BabyDoge\",\"name\":\"BabyDogeSwap\",\"address\":\"dl-2169\",\"priceUSD\":0,\"liquidity\":276896.6402800743,\"marketCap\":2768966.402800743,\"dex\":\"DefiLlama\",\"timestamp\":1761248205034,\"volume24h\":138448.32014003716,\"priceChange24h\":2.427517089741187,\"holders\":0,\"socialScore\":3,\"riskLevel\":\"high\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206007,\"contextId\":\"dl-2169\"}"
      }
    ],
    "contextId": "dl-2169"
  },
  "taskId": "2a37f86f-a0e4-41f0-b85b-4bf9ae7e33bc",
  "contextId": "dl-2169"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"BabyDoge","name":"BabyDogeSwap","address":"dl-2169","priceUSD":0,"liquidity":276896.6402800743,"marketCap":2768966.402800743,"dex":"DefiLlama","timestamp":1761248205034,"volume24h":138448.32014003716,"priceChange24h":2.427517089741187,"holders":0,"socialScore":3,"riskLevel":"high"},"agentId":"memecoin-scout","timestamp":1761248206007,"contextId":"dl-2169"}
📨 Personal Assistant Agent received message: token_discovery
🔍 Aggregating discovery data for BabyDoge
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "0e35ea62-93cf-4b4b-af73-0f9bc30a9ac0",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"DOGE\",\"name\":\"Dogecoin\",\"address\":\"cg-doge\",\"priceUSD\":0.195635,\"liquidity\":1883114744,\"marketCap\":29641089526,\"dex\":\"CoinGecko Meme\",\"timestamp\":1761248205680,\"volume24h\":1883114744,\"priceChange24h\":2.17991,\"holders\":0,\"socialScore\":99,\"riskLevel\":\"low\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206146,\"contextId\":\"cg-doge\"}"
      }
    ],
    "contextId": "cg-doge"
  },
  "taskId": "4079c16b-7063-4ca8-b166-12fc059de9cd",
  "contextId": "cg-doge"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"DOGE","name":"Dogecoin","address":"cg-doge","priceUSD":0.195635,"liquidity":1883114744,"marketCap":29641089526,"dex":"CoinGecko Meme","timestamp":1761248205680,"volume24h":1883114744,"priceChange24h":2.17991,"holders":0,"socialScore":99,"riskLevel":"low"},"agentId":"memecoin-scout","timestamp":1761248206146,"contextId":"cg-doge"}
📨 Personal Assistant Agent received message: token_discovery
🔍 Aggregating discovery data for DOGE
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "c7fd3dd9-88b9-4b56-8f77-616e4fc131ba",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"token_discovery\",\"data\":{\"symbol\":\"SHIB\",\"name\":\"Shiba Inu\",\"address\":\"cg-shib\",\"priceUSD\":0.00001012,\"liquidity\":164822921,\"marketCap\":5967077184,\"dex\":\"CoinGecko Meme\",\"timestamp\":1761248205680,\"volume24h\":164822921,\"priceChange24h\":2.26499,\"holders\":0,\"socialScore\":97,\"riskLevel\":\"low\"},\"agentId\":\"memecoin-scout\",\"timestamp\":1761248206284,\"contextId\":\"cg-shib\"}"
      }
    ],
    "contextId": "cg-shib"
  },
  "taskId": "c80fe27f-e956-4094-8e77-e43b09ae7d86",
  "contextId": "cg-shib"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"token_discovery","data":{"symbol":"SHIB","name":"Shiba Inu","address":"cg-shib","priceUSD":0.00001012,"liquidity":164822921,"marketCap":5967077184,"dex":"CoinGecko Meme","timestamp":1761248205680,"volume24h":164822921,"priceChange24h":2.26499,"holders":0,"socialScore":97,"riskLevel":"low"},"agentId":"memecoin-scout","timestamp":1761248206284,"contextId":"cg-shib"}
📨 Personal Assistant Agent received message: token_discovery
🔍 Aggregating discovery data for SHIB
Task ID not found for event message.
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "91bc3114-387a-454e-8bb1-5e0abf249280",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"settlement_request\",\"data\":{\"id\":\"7d49526d-dc0c-4a5a-a2d1-17080db11d99\",\"alertSignal\":{\"id\":\"a4de2e80-ba1d-4eaf-8133-f90960dbc256\",\"tokenAddress\":\"cg-doge\",\"symbol\":\"DOGE\",\"alertType\":\"WATCH\",\"confidence\":83.825,\"reasoning\":\"WATCH signal: decent APY of 48.6%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"cg-doge\",\"pairAddress\":\"cg-doge\",\"tvl\":216234,\"apy\":48.65,\"liquidity\":144021,\"volume24h\":38890,\"priceUSD\":4.137,\"timestamp\":1761248212321},\"riskData\":{\"tokenAddress\":\"cg-doge\",\"riskScore\":35,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":38.012438437583015,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248210999},\"timestamp\":1761248400160,\"actionTaken\":false},\"action\":\"LOG_ONLY\",\"status\":\"COMPLETED\",\"timestamp\":1761248400218},\"agentId\":\"settlement-agent\",\"timestamp\":1761248403521,\"contextId\":\"cg-doge\"}"
      }
    ],
    "contextId": "cg-doge"
  },
  "taskId": "5997a6f3-f375-42ac-a386-2865b521379c",
  "contextId": "cg-doge"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"settlement_request","data":{"id":"7d49526d-dc0c-4a5a-a2d1-17080db11d99","alertSignal":{"id":"a4de2e80-ba1d-4eaf-8133-f90960dbc256","tokenAddress":"cg-doge","symbol":"DOGE","alertType":"WATCH","confidence":83.825,"reasoning":"WATCH signal: decent APY of 48.6%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"cg-doge","pairAddress":"cg-doge","tvl":216234,"apy":48.65,"liquidity":144021,"volume24h":38890,"priceUSD":4.137,"timestamp":1761248212321},"riskData":{"tokenAddress":"cg-doge","riskScore":35,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":38.012438437583015,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248210999},"timestamp":1761248400160,"actionTaken":false},"action":"LOG_ONLY","status":"COMPLETED","timestamp":1761248400218},"agentId":"settlement-agent","timestamp":1761248403521,"contextId":"cg-doge"}
📨 Personal Assistant Agent received message: settlement_request
💵 Settlement update received
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "fd908432-e999-41da-9c00-f9f661ca532d",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"alert_decision\",\"data\":{\"id\":\"a4de2e80-ba1d-4eaf-8133-f90960dbc256\",\"tokenAddress\":\"cg-doge\",\"symbol\":\"DOGE\",\"alertType\":\"WATCH\",\"confidence\":83.825,\"reasoning\":\"WATCH signal: decent APY of 48.6%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"cg-doge\",\"pairAddress\":\"cg-doge\",\"tvl\":216234,\"apy\":48.65,\"liquidity\":144021,\"volume24h\":38890,\"priceUSD\":4.137,\"timestamp\":1761248212321},\"riskData\":{\"tokenAddress\":\"cg-doge\",\"riskScore\":35,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":38.012438437583015,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248210999},\"timestamp\":1761248400160,\"actionTaken\":false},\"agentId\":\"alert-agent\",\"timestamp\":1761248400160,\"contextId\":\"cg-doge\"}"
      }
    ],
    "contextId": "cg-doge"
  },
  "taskId": "676ea71d-bea2-47be-8cd2-468acb508a70",
  "contextId": "cg-doge"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"alert_decision","data":{"id":"a4de2e80-ba1d-4eaf-8133-f90960dbc256","tokenAddress":"cg-doge","symbol":"DOGE","alertType":"WATCH","confidence":83.825,"reasoning":"WATCH signal: decent APY of 48.6%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"cg-doge","pairAddress":"cg-doge","tvl":216234,"apy":48.65,"liquidity":144021,"volume24h":38890,"priceUSD":4.137,"timestamp":1761248212321},"riskData":{"tokenAddress":"cg-doge","riskScore":35,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":38.012438437583015,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248210999},"timestamp":1761248400160,"actionTaken":false},"agentId":"alert-agent","timestamp":1761248400160,"contextId":"cg-doge"}
📨 Personal Assistant Agent received message: alert_decision
🚨 Updated alert for DOGE: WATCH
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "2077a812-8a95-4ac9-b81b-eb65a388bf6e",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"settlement_request\",\"data\":{\"id\":\"ccc8922d-8a05-482f-9056-88e3171f444e\",\"alertSignal\":{\"id\":\"0f09c4a0-2a21-4c2d-8f6d-f194aa7db73d\",\"tokenAddress\":\"dl-2169\",\"symbol\":\"BabyDoge\",\"alertType\":\"WATCH\",\"confidence\":91.03999999999999,\"reasoning\":\"WATCH signal: decent APY of 54.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"dl-2169\",\"pairAddress\":\"dl-2169\",\"tvl\":52604,\"apy\":54.08,\"liquidity\":15174,\"volume24h\":6045,\"priceUSD\":1.4005,\"timestamp\":1761248210309},\"riskData\":{\"tokenAddress\":\"dl-2169\",\"riskScore\":20,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":90.78805596598363,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248213993},\"timestamp\":1761248403548,\"actionTaken\":false},\"action\":\"LOG_ONLY\",\"status\":\"COMPLETED\",\"timestamp\":1761248403575},\"agentId\":\"settlement-agent\",\"timestamp\":1761248407931,\"contextId\":\"dl-2169\"}"
      }
    ],
    "contextId": "dl-2169"
  },
  "taskId": "3b728c98-3618-4608-af50-45be929798af",
  "contextId": "dl-2169"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"settlement_request","data":{"id":"ccc8922d-8a05-482f-9056-88e3171f444e","alertSignal":{"id":"0f09c4a0-2a21-4c2d-8f6d-f194aa7db73d","tokenAddress":"dl-2169","symbol":"BabyDoge","alertType":"WATCH","confidence":91.03999999999999,"reasoning":"WATCH signal: decent APY of 54.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"dl-2169","pairAddress":"dl-2169","tvl":52604,"apy":54.08,"liquidity":15174,"volume24h":6045,"priceUSD":1.4005,"timestamp":1761248210309},"riskData":{"tokenAddress":"dl-2169","riskScore":20,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":90.78805596598363,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248213993},"timestamp":1761248403548,"actionTaken":false},"action":"LOG_ONLY","status":"COMPLETED","timestamp":1761248403575},"agentId":"settlement-agent","timestamp":1761248407931,"contextId":"dl-2169"}
📨 Personal Assistant Agent received message: settlement_request
💵 Settlement update received
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "1155489f-a457-4e93-a9bc-b560c8e8e481",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"alert_decision\",\"data\":{\"id\":\"0f09c4a0-2a21-4c2d-8f6d-f194aa7db73d\",\"tokenAddress\":\"dl-2169\",\"symbol\":\"BabyDoge\",\"alertType\":\"WATCH\",\"confidence\":91.03999999999999,\"reasoning\":\"WATCH signal: decent APY of 54.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"dl-2169\",\"pairAddress\":\"dl-2169\",\"tvl\":52604,\"apy\":54.08,\"liquidity\":15174,\"volume24h\":6045,\"priceUSD\":1.4005,\"timestamp\":1761248210309},\"riskData\":{\"tokenAddress\":\"dl-2169\",\"riskScore\":20,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":90.78805596598363,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248213993},\"timestamp\":1761248403548,\"actionTaken\":false},\"agentId\":\"alert-agent\",\"timestamp\":1761248403548,\"contextId\":\"dl-2169\"}"
      }
    ],
    "contextId": "dl-2169"
  },
  "taskId": "fdd3707d-7702-4c7a-96d3-841331d83bcb",
  "contextId": "dl-2169"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"alert_decision","data":{"id":"0f09c4a0-2a21-4c2d-8f6d-f194aa7db73d","tokenAddress":"dl-2169","symbol":"BabyDoge","alertType":"WATCH","confidence":91.03999999999999,"reasoning":"WATCH signal: decent APY of 54.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"dl-2169","pairAddress":"dl-2169","tvl":52604,"apy":54.08,"liquidity":15174,"volume24h":6045,"priceUSD":1.4005,"timestamp":1761248210309},"riskData":{"tokenAddress":"dl-2169","riskScore":20,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":90.78805596598363,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248213993},"timestamp":1761248403548,"actionTaken":false},"agentId":"alert-agent","timestamp":1761248403548,"contextId":"dl-2169"}
📨 Personal Assistant Agent received message: alert_decision
🚨 Updated alert for BabyDoge: WATCH
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "f619db5f-8ac6-435a-b05f-b351326c28d5",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"settlement_request\",\"data\":{\"id\":\"c855cafe-0ad2-4912-acd9-e0dc8cd4a04e\",\"alertSignal\":{\"id\":\"7ffbc89f-2713-4d3c-b3eb-325be4659a74\",\"tokenAddress\":\"cg-shib\",\"symbol\":\"SHIB\",\"alertType\":\"WATCH\",\"confidence\":87.17999999999999,\"reasoning\":\"WATCH signal: decent APY of 76.9%, manageable risk. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"cg-shib\",\"pairAddress\":\"cg-shib\",\"tvl\":260799,\"apy\":76.94,\"liquidity\":106092,\"volume24h\":20732,\"priceUSD\":1.1787,\"timestamp\":1761248214324},\"riskData\":{\"tokenAddress\":\"cg-shib\",\"riskScore\":20,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":23.549999999999997,\"socialScore\":70.99772733498637,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248208833},\"timestamp\":1761248407948,\"actionTaken\":false},\"action\":\"LOG_ONLY\",\"status\":\"COMPLETED\",\"timestamp\":1761248407968},\"agentId\":\"settlement-agent\",\"timestamp\":1761248411199,\"contextId\":\"cg-shib\"}"
      }
    ],
    "contextId": "cg-shib"
  },
  "taskId": "ff172ffe-28c3-4434-b647-ac41999ff4f1",
  "contextId": "cg-shib"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"settlement_request","data":{"id":"c855cafe-0ad2-4912-acd9-e0dc8cd4a04e","alertSignal":{"id":"7ffbc89f-2713-4d3c-b3eb-325be4659a74","tokenAddress":"cg-shib","symbol":"SHIB","alertType":"WATCH","confidence":87.17999999999999,"reasoning":"WATCH signal: decent APY of 76.9%, manageable risk. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"cg-shib","pairAddress":"cg-shib","tvl":260799,"apy":76.94,"liquidity":106092,"volume24h":20732,"priceUSD":1.1787,"timestamp":1761248214324},"riskData":{"tokenAddress":"cg-shib","riskScore":20,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":23.549999999999997,"socialScore":70.99772733498637,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248208833},"timestamp":1761248407948,"actionTaken":false},"action":"LOG_ONLY","status":"COMPLETED","timestamp":1761248407968},"agentId":"settlement-agent","timestamp":1761248411199,"contextId":"cg-shib"}
📨 Personal Assistant Agent received message: settlement_request
💵 Settlement update received
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "9f7beb32-a416-48dd-ae73-d8214c6d6bd4",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"alert_decision\",\"data\":{\"id\":\"7ffbc89f-2713-4d3c-b3eb-325be4659a74\",\"tokenAddress\":\"cg-shib\",\"symbol\":\"SHIB\",\"alertType\":\"WATCH\",\"confidence\":87.17999999999999,\"reasoning\":\"WATCH signal: decent APY of 76.9%, manageable risk. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"cg-shib\",\"pairAddress\":\"cg-shib\",\"tvl\":260799,\"apy\":76.94,\"liquidity\":106092,\"volume24h\":20732,\"priceUSD\":1.1787,\"timestamp\":1761248214324},\"riskData\":{\"tokenAddress\":\"cg-shib\",\"riskScore\":20,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":23.549999999999997,\"socialScore\":70.99772733498637,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248208833},\"timestamp\":1761248407948,\"actionTaken\":false},\"agentId\":\"alert-agent\",\"timestamp\":1761248407948,\"contextId\":\"cg-shib\"}"
      }
    ],
    "contextId": "cg-shib"
  },
  "taskId": "43020b5b-eb26-41c4-ad79-59c4e0c20aff",
  "contextId": "cg-shib"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"alert_decision","data":{"id":"7ffbc89f-2713-4d3c-b3eb-325be4659a74","tokenAddress":"cg-shib","symbol":"SHIB","alertType":"WATCH","confidence":87.17999999999999,"reasoning":"WATCH signal: decent APY of 76.9%, manageable risk. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"cg-shib","pairAddress":"cg-shib","tvl":260799,"apy":76.94,"liquidity":106092,"volume24h":20732,"priceUSD":1.1787,"timestamp":1761248214324},"riskData":{"tokenAddress":"cg-shib","riskScore":20,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":23.549999999999997,"socialScore":70.99772733498637,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248208833},"timestamp":1761248407948,"actionTaken":false},"agentId":"alert-agent","timestamp":1761248407948,"contextId":"cg-shib"}
📨 Personal Assistant Agent received message: alert_decision
🚨 Updated alert for SHIB: WATCH
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "9bbead0a-264a-4507-9e99-95ea33b45703",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"settlement_request\",\"data\":{\"id\":\"7da0425f-3419-4046-be42-5719794b7ebb\",\"alertSignal\":{\"id\":\"ab6b2022-5cd0-4eb9-89a6-b26b80ad8aec\",\"tokenAddress\":\"dl-5174\",\"symbol\":\"-\",\"alertType\":\"WATCH\",\"confidence\":74.55,\"reasoning\":\"WATCH signal: decent APY of 30.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"dl-5174\",\"pairAddress\":\"dl-5174\",\"tvl\":59073,\"apy\":30.1,\"liquidity\":15034,\"volume24h\":6414,\"priceUSD\":2.5253,\"timestamp\":1761248400627,\"previousAPY\":73.01,\"apyChange\":-58.77277085330776,\"tvlChange\":196.31320224719101},\"riskData\":{\"tokenAddress\":\"dl-5174\",\"riskScore\":35,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":34.71170794680318,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248217022},\"timestamp\":1761248411208,\"actionTaken\":false},\"action\":\"LOG_ONLY\",\"status\":\"COMPLETED\",\"timestamp\":1761248411230},\"agentId\":\"settlement-agent\",\"timestamp\":1761248415594,\"contextId\":\"dl-5174\"}"
      }
    ],
    "contextId": "dl-5174"
  },
  "taskId": "40b6825a-4301-48da-bf59-3d04a82425ab",
  "contextId": "dl-5174"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"settlement_request","data":{"id":"7da0425f-3419-4046-be42-5719794b7ebb","alertSignal":{"id":"ab6b2022-5cd0-4eb9-89a6-b26b80ad8aec","tokenAddress":"dl-5174","symbol":"-","alertType":"WATCH","confidence":74.55,"reasoning":"WATCH signal: decent APY of 30.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"dl-5174","pairAddress":"dl-5174","tvl":59073,"apy":30.1,"liquidity":15034,"volume24h":6414,"priceUSD":2.5253,"timestamp":1761248400627,"previousAPY":73.01,"apyChange":-58.77277085330776,"tvlChange":196.31320224719101},"riskData":{"tokenAddress":"dl-5174","riskScore":35,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":34.71170794680318,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248217022},"timestamp":1761248411208,"actionTaken":false},"action":"LOG_ONLY","status":"COMPLETED","timestamp":1761248411230},"agentId":"settlement-agent","timestamp":1761248415594,"contextId":"dl-5174"}
📨 Personal Assistant Agent received message: settlement_request
💵 Settlement update received
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "386969a4-78a2-4a46-9209-431cc667132b",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"alert_decision\",\"data\":{\"id\":\"ab6b2022-5cd0-4eb9-89a6-b26b80ad8aec\",\"tokenAddress\":\"dl-5174\",\"symbol\":\"-\",\"alertType\":\"WATCH\",\"confidence\":74.55,\"reasoning\":\"WATCH signal: decent APY of 30.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"dl-5174\",\"pairAddress\":\"dl-5174\",\"tvl\":59073,\"apy\":30.1,\"liquidity\":15034,\"volume24h\":6414,\"priceUSD\":2.5253,\"timestamp\":1761248400627,\"previousAPY\":73.01,\"apyChange\":-58.77277085330776,\"tvlChange\":196.31320224719101},\"riskData\":{\"tokenAddress\":\"dl-5174\",\"riskScore\":35,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":100,\"socialScore\":34.71170794680318,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248217022},\"timestamp\":1761248411208,\"actionTaken\":false},\"agentId\":\"alert-agent\",\"timestamp\":1761248411209,\"contextId\":\"dl-5174\"}"
      }
    ],
    "contextId": "dl-5174"
  },
  "taskId": "e0db2d9c-2e7d-42c0-ac32-69df2b822de0",
  "contextId": "dl-5174"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"alert_decision","data":{"id":"ab6b2022-5cd0-4eb9-89a6-b26b80ad8aec","tokenAddress":"dl-5174","symbol":"-","alertType":"WATCH","confidence":74.55,"reasoning":"WATCH signal: decent APY of 30.1%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"dl-5174","pairAddress":"dl-5174","tvl":59073,"apy":30.1,"liquidity":15034,"volume24h":6414,"priceUSD":2.5253,"timestamp":1761248400627,"previousAPY":73.01,"apyChange":-58.77277085330776,"tvlChange":196.31320224719101},"riskData":{"tokenAddress":"dl-5174","riskScore":35,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":100,"socialScore":34.71170794680318,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248217022},"timestamp":1761248411208,"actionTaken":false},"agentId":"alert-agent","timestamp":1761248411209,"contextId":"dl-5174"}
📨 Personal Assistant Agent received message: alert_decision
🚨 Updated alert for -: WATCH
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "4684f665-547b-4328-9578-f993d1d6385e",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"settlement_request\",\"data\":{\"id\":\"5d491a62-cc7a-405e-9f3b-1d53006f8d25\",\"alertSignal\":{\"id\":\"b0355cc9-46b6-49ba-83e5-99008f3521d2\",\"tokenAddress\":\"dl-6405\",\"symbol\":\"IMF\",\"alertType\":\"WATCH\",\"confidence\":100,\"reasoning\":\"WATCH signal: decent APY of 119.4%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"dl-6405\",\"pairAddress\":\"dl-6405\",\"tvl\":18482,\"apy\":119.41,\"liquidity\":5060,\"volume24h\":852,\"priceUSD\":0.5792,\"timestamp\":1761248400113,\"previousAPY\":21.24,\"apyChange\":462.1939736346516,\"tvlChange\":-55.11135938600539},\"riskData\":{\"tokenAddress\":\"dl-6405\",\"riskScore\":25,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":99.68,\"socialScore\":50.340879474986735,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248220028},\"timestamp\":1761248415606,\"actionTaken\":false},\"action\":\"LOG_ONLY\",\"status\":\"COMPLETED\",\"timestamp\":1761248415629},\"agentId\":\"settlement-agent\",\"timestamp\":1761248419165,\"contextId\":\"dl-6405\"}"
      }
    ],
    "contextId": "dl-6405"
  },
  "taskId": "3d03bad0-ce2e-4c08-9de5-12e1e5f36f62",
  "contextId": "dl-6405"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"settlement_request","data":{"id":"5d491a62-cc7a-405e-9f3b-1d53006f8d25","alertSignal":{"id":"b0355cc9-46b6-49ba-83e5-99008f3521d2","tokenAddress":"dl-6405","symbol":"IMF","alertType":"WATCH","confidence":100,"reasoning":"WATCH signal: decent APY of 119.4%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"dl-6405","pairAddress":"dl-6405","tvl":18482,"apy":119.41,"liquidity":5060,"volume24h":852,"priceUSD":0.5792,"timestamp":1761248400113,"previousAPY":21.24,"apyChange":462.1939736346516,"tvlChange":-55.11135938600539},"riskData":{"tokenAddress":"dl-6405","riskScore":25,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":99.68,"socialScore":50.340879474986735,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248220028},"timestamp":1761248415606,"actionTaken":false},"action":"LOG_ONLY","status":"COMPLETED","timestamp":1761248415629},"agentId":"settlement-agent","timestamp":1761248419165,"contextId":"dl-6405"}
📨 Personal Assistant Agent received message: settlement_request
💵 Settlement update received
🔍 DEBUG: RequestContext keys: [ 'userMessage', 'task', 'referenceTasks', 'taskId', 'contextId' ]
🔍 DEBUG: RequestContext: {
  "userMessage": {
    "kind": "message",
    "messageId": "b8290070-247f-441c-802e-0bde655c1603",
    "role": "user",
    "parts": [
      {
        "kind": "text",
        "text": "{\"messageType\":\"alert_decision\",\"data\":{\"id\":\"b0355cc9-46b6-49ba-83e5-99008f3521d2\",\"tokenAddress\":\"dl-6405\",\"symbol\":\"IMF\",\"alertType\":\"WATCH\",\"confidence\":100,\"reasoning\":\"WATCH signal: decent APY of 119.4%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.\",\"yieldData\":{\"tokenAddress\":\"dl-6405\",\"pairAddress\":\"dl-6405\",\"tvl\":18482,\"apy\":119.41,\"liquidity\":5060,\"volume24h\":852,\"priceUSD\":0.5792,\"timestamp\":1761248400113,\"previousAPY\":21.24,\"apyChange\":462.1939736346516,\"tvlChange\":-55.11135938600539},\"riskData\":{\"tokenAddress\":\"dl-6405\",\"riskScore\":25,\"rugRisk\":false,\"ownerRenounced\":true,\"mintPermissions\":false,\"viralPotential\":99.68,\"socialScore\":50.340879474986735,\"contractVerified\":false,\"honeypotRisk\":false,\"timestamp\":1761248220028},\"timestamp\":1761248415606,\"actionTaken\":false},\"agentId\":\"alert-agent\",\"timestamp\":1761248415607,\"contextId\":\"dl-6405\"}"
      }
    ],
    "contextId": "dl-6405"
  },
  "taskId": "64d86ead-9169-4f8d-9222-1017d98c0473",
  "contextId": "dl-6405"
}
🔍 DEBUG: Parsing message from userMessage.parts[0].text: {"messageType":"alert_decision","data":{"id":"b0355cc9-46b6-49ba-83e5-99008f3521d2","tokenAddress":"dl-6405","symbol":"IMF","alertType":"WATCH","confidence":100,"reasoning":"WATCH signal: decent APY of 119.4%, manageable risk, good viral potential. Monitor for better entry point or risk reduction.","yieldData":{"tokenAddress":"dl-6405","pairAddress":"dl-6405","tvl":18482,"apy":119.41,"liquidity":5060,"volume24h":852,"priceUSD":0.5792,"timestamp":1761248400113,"previousAPY":21.24,"apyChange":462.1939736346516,"tvlChange":-55.11135938600539},"riskData":{"tokenAddress":"dl-6405","riskScore":25,"rugRisk":false,"ownerRenounced":true,"mintPermissions":false,"viralPotential":99.68,"socialScore":50.340879474986735,"contractVerified":false,"honeypotRisk":false,"timestamp":1761248220028},"timestamp":1761248415606,"actionTaken":false},"agentId":"alert-agent","timestamp":1761248415607,"contextId":"dl-6405"}
📨 Personal Assistant Agent received message: alert_decision
🚨 Updated alert for IMF: WATCH
