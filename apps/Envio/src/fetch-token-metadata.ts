import { createPublicClient, http, hexToString, erc20Abi } from "viem";
import { mainnet } from "viem/chains";
import type { TokenAddress } from "./fetch-token-address.js";

const RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/OgX2oq12FWRTYy5zEJj9_5BHxL_JktB0";

const client = createPublicClient({
  chain: mainnet,
  batch: { multicall: true },
  transport: http(RPC_URL, { batch: true }),
});

const erc20BytesAbi = [
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;

export interface TokenMetadata extends TokenAddress {
  name: string;
  symbol: string;
  decimals: number;
}

async function getTokenMetadata(tokenAddress: string): Promise<{ name: string; symbol: string; decimals: number } | null> {
  const addr = tokenAddress as `0x${string}`;
  
  let results: [number, string, string];
  
  try {
    results = await client.multicall({
      allowFailure: false,
      contracts: [
        { address: addr, abi: erc20Abi, functionName: "decimals" },
        { address: addr, abi: erc20Abi, functionName: "name" },
        { address: addr, abi: erc20Abi, functionName: "symbol" },
      ],
    });
  } catch (error) {
    try {
      const alternateResults = await client.multicall({
        allowFailure: false,
        contracts: [
          { address: addr, abi: erc20BytesAbi, functionName: "decimals" },
          { address: addr, abi: erc20BytesAbi, functionName: "name" },
          { address: addr, abi: erc20BytesAbi, functionName: "symbol" },
        ],
      });
      results = [
        alternateResults[0],
        hexToString(alternateResults[1]).replace(/\u0000/g, "").trim(),
        hexToString(alternateResults[2]).replace(/\u0000/g, "").trim(),
      ];
    } catch (alternateError) {
      return null;
    }
  }
  
  const [decimals, name, symbol] = results;
  
  if (!name || !symbol || name === "" || symbol === "") {
    return null;
  }
  
  return { name, symbol, decimals };
}

export async function fetchTokenMetadata(
  tokenAddresses: TokenAddress[], 
  batchSize: number = 100,
  onProgress?: (processed: number, total: number, found: number) => void
): Promise<TokenMetadata[]> {
  console.log("\n🔍 STEP 2: Fetching Token Metadata...\n");
  console.log(`Processing ${tokenAddresses.length} token addresses...\n`);

  const allTokens: TokenMetadata[] = [];
  let totalProcessed = 0;

  for (let i = 0; i < tokenAddresses.length; i += batchSize) {
    const batch = tokenAddresses.slice(i, i + batchSize);
    
    const metadataPromises = batch.map(async (tokenInfo) => {
      try {
        const metadata = await getTokenMetadata(tokenInfo.address);
        
        if (metadata) {
          return {
            ...tokenInfo,
            ...metadata,
          };
        }
      } catch (err) {
        // Silent fail for individual tokens
      }
      return null;
    });

    const batchResults = await Promise.all(metadataPromises);
    const validTokens = batchResults.filter((token): token is TokenMetadata => token !== null);
    allTokens.push(...validTokens);

    totalProcessed += batch.length;
    const percentage = ((totalProcessed / tokenAddresses.length) * 100).toFixed(2);
    
    console.log(`Progress: ${totalProcessed}/${tokenAddresses.length} (${percentage}%) - Found ${validTokens.length} valid tokens in this batch`);
    console.log(`Total valid tokens so far: ${allTokens.length}\n`);
    
    // Call progress callback if provided
    if (onProgress) {
      onProgress(totalProcessed, tokenAddresses.length, allTokens.length);
    }
  }

  console.log(`✅ Completed! Found ${allTokens.length} tokens with valid metadata.\n`);
  
  return allTokens;
}

function main(){
  fetchTokenMetadata([{
    address: '0x00c83aecc790e8a4453e5dd3b0b4b3680501a7a7',
    firstSeenBlock: 0,
    firstSeenTimestamp: 0
  }], 10).then((metadata) => {
    console.log(metadata);
  });
}
// main();