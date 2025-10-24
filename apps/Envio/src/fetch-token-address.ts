
import { HypersyncClient, BlockField, LogField } from "@envio-dev/hypersync-client";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const RPC_URL =  "https://eth-mainnet.g.alchemy.com/v2/OgX2oq12FWRTYy5zEJj9_5BHxL_JktB0";

const client = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
});

export interface TokenAddress {
  address: string;
  firstSeenBlock: number;
  firstSeenTimestamp: number;
}

export async function fetchTokenAddresses(daysToLookBack: number = 365): Promise<TokenAddress[]> {
  console.log("\n🔍 STEP 1: Fetching Token Addresses...\n");
  
  const hypersyncClient = HypersyncClient.new(null);
  const currentBlock = await client.getBlockNumber();
  const blocksPerDay = 7200;
  const startBlock = Number(currentBlock) - (blocksPerDay * daysToLookBack);

  console.log(`Current block: ${currentBlock}`);
  console.log(`Querying from block: ${startBlock} to ${currentBlock}`);
  console.log(`Looking back: ${daysToLookBack} days\n`);

  const transferQuery = {
    fromBlock: startBlock,
    toBlock: Number(currentBlock),
    logs: [
      {
        topics: [
          ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
        ],
      },
    ],
    fieldSelection: {
      block: [BlockField.Number, BlockField.Timestamp],
      log: [LogField.Address, LogField.Topic0],
    },
  };

  console.log("Fetching all ERC20 transfer events...");
  const transferRes = await hypersyncClient.get(transferQuery);
  console.log(`✅ Got ${transferRes.data.logs.length} transfer logs.\n`);

  const tokenFirstSeen = new Map<string, { block: number; timestamp: number }>();
  
  for (let i = 0; i < transferRes.data.logs.length; i++) {
    const log = transferRes.data.logs[i];
    const blockNum = transferRes.data.blocks[i]?.number || 0;
    const blockTimestamp = transferRes.data.blocks[i]?.timestamp || 0;
    const addr = log.address.toLowerCase();
    
    if (!tokenFirstSeen.has(addr)) {
      tokenFirstSeen.set(addr, { block: blockNum, timestamp: blockTimestamp });
    } else {
      const existing = tokenFirstSeen.get(addr)!;
      if (blockNum < existing.block) {
        tokenFirstSeen.set(addr, { block: blockNum, timestamp: blockTimestamp });
      }
    }
  }

  const tokenAddresses: TokenAddress[] = Array.from(tokenFirstSeen.entries()).map(([address, info]) => ({
    address,
    firstSeenBlock: info.block,
    firstSeenTimestamp: info.timestamp,
  }));

  tokenAddresses.sort((a, b) => b.firstSeenBlock - a.firstSeenBlock);

  console.log(`✅ Found ${tokenAddresses.length} unique ERC20 token addresses.\n`);
  
  return tokenAddresses;
}

function main(){
  fetchTokenAddresses(10).then((addresses) => {
    console.log(addresses);
  });
}
// main();