"use server";

import {
  HypersyncClient,
  Decoder,
  BlockField,
  LogField,
  TransactionField,
} from "@envio-dev/hypersync-client";

// Popular ERC20 tokens on Ethereum Mainnet (presets)
const ERC20_TOKENS: Record<
  string,
  { address: string; decimals: number; symbol: string }
> = {
  USDC: {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    symbol: "USDC",
  },
  USDT: {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    symbol: "USDT",
  },
  DAI: {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
    symbol: "DAI",
  },
  WETH: {
    address: "0xC02aaA39b223FE8D0A0e8e4F27ead9083C756Cc2",
    decimals: 18,
    symbol: "WETH",
  },
  LINK: {
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimals: 18,
    symbol: "LINK",
  },
  AAVE: {
    address: "0x7Fc66500c84A76Ad7e9c93437E434122A1f9AcDd",
    decimals: 18,
    symbol: "AAVE",
  },
};

// Time range constants (in minutes)
const TIME_RANGES = {
  "1m": 1,
  "10m": 10,
  "1h": 60,
  "1d": 1440,
  all: 0, // Special case for all time
};

// Helper function to safely convert BigInt → string
function serializeBigInt(obj: any): any {
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (obj && typeof obj === "object") {
    const out: any = {};
    for (const key in obj) out[key] = serializeBigInt(obj[key]);
    return out;
  }
  return obj;
}

// Parse address from various formats
function parseAddress(addr: any): string {
  if (!addr) return "N/A";
  if (typeof addr === "string") {
    // Ensure it's 0x-prefixed
    return addr.startsWith("0x") ? addr : "0x" + addr;
  }
  if (Buffer.isBuffer(addr)) {
    return "0x" + addr.toString("hex");
  }
  // Handle BigInt or other objects
  return "0x" + String(addr).toLowerCase();
}

// Format BigInt amount safely without overflow
function formatAmount(amount: bigint, decimals: number): string {
  const amountStr = amount.toString();
  const decimalStr = amountStr.padStart(decimals + 1, "0");
  const intPart = decimalStr.slice(0, -decimals) || "0";
  const fracPart = decimalStr.slice(-decimals).padStart(decimals, "0");

  // Trim trailing zeros from fraction
  const trimmedFrac = fracPart.replace(/0+$/, "");

  return trimmedFrac ? `${intPart}.${trimmedFrac}` : intPart;
}

async function queryERC20Transfers(
  tokenAddress: string,
  fromBlock: number = 0,
  toBlock?: number,
  decimals: number = 18,
  minutesToQuery: number = 0 // For time-range queries: 0 means all time, >0 means last X minutes
) {
  const client = HypersyncClient.new(null);

  // Create decoder for ERC20 Transfer events
  const decoder = Decoder.fromSignatures([
    "Transfer(address indexed from, address indexed to, uint256 value)",
  ]);

  // Get current block height
  console.log("Fetching current block height...");
  let currentBlock = 0;
  let currentTimestamp = 0;
  try {
    const heightQuery: any = {
      fromBlock: 0,
      toBlock: 1,
      logs: [
        {
          address: [tokenAddress.toLowerCase()],
          topics: [
            [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            ],
          ],
        },
      ],
      fieldSelection: {
        block: [BlockField.Number, BlockField.Timestamp],
        log: [LogField.BlockNumber],
      },
    };
    const heightRes = await client.get(heightQuery);
    currentBlock = heightRes.archiveHeight ?? 20000000;

    // Query the latest block to get its timestamp
    const latestBlockQuery: any = {
      fromBlock: Math.max(0, currentBlock - 1),
      toBlock: currentBlock,
      logs: [
        {
          address: [tokenAddress.toLowerCase()],
          topics: [
            [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            ],
          ],
        },
      ],
      fieldSelection: {
        block: [BlockField.Number, BlockField.Timestamp],
        log: [LogField.BlockNumber],
      },
    };
    const latestRes = await client.get(latestBlockQuery);
    if (latestRes.data?.blocks?.[currentBlock]) {
      currentTimestamp =
        latestRes.data.blocks[currentBlock].timestamp || Date.now() / 1000;
    } else {
      currentTimestamp = Math.floor(Date.now() / 1000);
    }

    console.log(
      `Current block: ${currentBlock}, Timestamp: ${currentTimestamp} (${new Date(
        currentTimestamp * 1000
      ).toISOString()})`
    );
  } catch (e) {
    console.warn("Failed to fetch block height, using fallback:", e);
    currentBlock = 20000000;
    currentTimestamp = Math.floor(Date.now() / 1000);
  }

  // Determine query range
  let queryFromBlock = fromBlock;
  let queryToBlock = toBlock ?? currentBlock;
  let cutoffTimestamp = 0; // 0 means include all

  // If minutesToQuery is specified, calculate cutoff timestamp
  if (minutesToQuery > 0) {
    cutoffTimestamp = currentTimestamp - minutesToQuery * 60; // Convert minutes to seconds
    console.log(
      `⏰ Time range: ${minutesToQuery} minutes (${minutesToQuery * 60} seconds)`
    );
    console.log(
      `   Current time: ${new Date(currentTimestamp * 1000).toISOString()}`
    );
    console.log(
      `   Target time:  ${new Date(cutoffTimestamp * 1000).toISOString()}`
    );

    // Binary search to find the block that crosses the timestamp boundary
    queryToBlock = currentBlock;
    queryFromBlock = await findBlockByTimestamp(
      client,
      tokenAddress,
      cutoffTimestamp,
      0,
      currentBlock
    );
    console.log(
      `🔍 Finding block for timestamp: ${cutoffTimestamp} (${new Date(
        cutoffTimestamp * 1000
      ).toISOString()})`
    );
    console.log(`✅ Closest block found: ${queryFromBlock}`);
    console.log(
      `📊 Exact block range: ${queryFromBlock} to ${queryToBlock} (${
        queryToBlock - queryFromBlock
      } blocks)`
    );
  }

  console.log(
    `Query range: ${queryFromBlock} to ${queryToBlock} (${
      queryToBlock - queryFromBlock
    } blocks)`
  );

  let currentFromBlock = queryFromBlock;
  let totalVolume = BigInt(0);
  let allTransfers: any[] = [];
  let totalLogsQueried = 0;

  // Pagination loop - use HyperSync's nextBlock for proper pagination
  let queryCount = 0;
  const MAX_QUERIES = 100; // Safety limit to prevent infinite loops

  while (currentFromBlock < queryToBlock && queryCount < MAX_QUERIES) {
    queryCount++;

    console.log(
      `Query ${queryCount}: Querying blocks ${currentFromBlock} to ${queryToBlock} for token: ${tokenAddress}`
    );

    const query: any = {
      fromBlock: currentFromBlock,
      toBlock: queryToBlock,
      logs: [
        {
          address: [tokenAddress.toLowerCase()],
          topics: [
            [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            ],
          ],
        },
      ],
      fieldSelection: {
        block: [BlockField.Number, BlockField.Timestamp, BlockField.Hash],
        log: [
          LogField.BlockNumber,
          LogField.LogIndex,
          LogField.TransactionIndex,
          LogField.TransactionHash,
          LogField.Data,
          LogField.Address,
          LogField.Topic0,
          LogField.Topic1,
          LogField.Topic2,
          LogField.Topic3,
        ],
        transaction: [
          TransactionField.BlockNumber,
          TransactionField.TransactionIndex,
          TransactionField.Hash,
          TransactionField.From,
          TransactionField.To,
          TransactionField.Value,
          TransactionField.Input,
        ],
      },
    };

    const res = await client.get(query);
    console.log(`Query ${queryCount} returned ${res.data.logs.length} logs`);
    totalLogsQueried += res.data.logs.length;

    if (res.data?.logs?.length > 0) {
      const decodedLogs = await decoder.decodeLogs(res.data.logs);

      for (let i = 0; i < decodedLogs.length; i++) {
        const decoded = decodedLogs[i];
        if (!decoded) continue;

        try {
          const logData = res.data.logs[i];
          const blockNumber = logData?.blockNumber;
          const blockData =
            (blockNumber && res.data.blocks?.[blockNumber]) || {};
          const blockTimestamp = (blockData as any)?.timestamp || 0;

          // Safely extract indexed parameters (from, to addresses)
          const fromAddr = parseAddress(decoded.indexed?.[0]);
          const toAddr = parseAddress(decoded.indexed?.[1]);

          // Extract amount from body
          const amountVal = decoded.body?.[0]?.val;
          const amount = typeof amountVal === "bigint" ? amountVal : BigInt(0);

          totalVolume += amount;

          const transfer = {
            blockNumber: logData?.blockNumber,
            timestamp: blockTimestamp,
            transactionHash: logData?.transactionHash,
            logIndex: logData?.logIndex,
            from: fromAddr,
            to: toAddr,
            amount: amount.toString(),
            amountFormatted: formatAmount(amount, decimals),
          };

          allTransfers.push(transfer);
        } catch (e) {
          console.error(`Error processing log at index ${i}:`, e);
          continue;
        }
      }
    }

    // Use HyperSync's nextBlock for pagination, or break if we've reached the end
    if (res.nextBlock && res.nextBlock < queryToBlock) {
      currentFromBlock = res.nextBlock;
      console.log(`Next query will start from block ${currentFromBlock}`);
    } else {
      // No more data to fetch
      console.log(`Pagination complete - reached end of range`);
      break;
    }
  }

  console.log(
    `Total queries: ${queryCount}, Total logs: ${totalLogsQueried}, Valid transfers: ${allTransfers.length}`
  );

  if (allTransfers.length === 0) {
    return {
      success: true,
      data: {
        tokenAddress,
        decimals,
        totalVolume: "0",
        totalVolumeFormatted: "0",
        totalBlocks: queryToBlock - queryFromBlock,
        totalTransfers: 0,
        validTransfers: 0,
        fromBlockActual: queryFromBlock,
        toBlockActual: queryToBlock,
        archiveHeight: currentBlock,
        currentTimestamp,
        cutoffTimestamp,
        transfers: [],
      },
      message: "No transfers found in this range.",
    };
  }

  // Use actual block range
  const totalBlocks = queryToBlock - queryFromBlock;

  return {
    success: true,
    data: {
      tokenAddress,
      decimals,
      totalVolume: totalVolume.toString(),
      totalVolumeFormatted: formatAmount(totalVolume, decimals),
      totalBlocks,
      totalTransfers: totalLogsQueried,
      validTransfers: allTransfers.length,
      fromBlockActual: queryFromBlock,
      toBlockActual: queryToBlock,
      archiveHeight: currentBlock,
      currentTimestamp,
      cutoffTimestamp,
      transfers: serializeBigInt(allTransfers), // Return ALL transfers for accuracy
    },
    message: `Found ${allTransfers.length} transfers. Time range: ${new Date(
      cutoffTimestamp * 1000
    ).toISOString()} to ${new Date(currentTimestamp * 1000).toISOString()}. Total volume: ${formatAmount(
      totalVolume,
      decimals
    )}`,
  };
}

// Binary search to find the block where timestamp crosses the cutoff
async function findBlockByTimestamp(
  client: any,
  tokenAddress: string,
  targetTimestamp: number,
  lowBlock: number,
  highBlock: number
): Promise<number> {
  // Termination: we've narrowed it down to 1 block
  if (lowBlock >= highBlock) {
    return highBlock;
  }

  const midBlock = Math.floor((lowBlock + highBlock) / 2);

  try {
    // Query with minimal filter to ensure we get block data even if no transfers exist
    // Use the same log filter as the main query to ensure consistency
    const query: any = {
      fromBlock: midBlock,
      toBlock: midBlock + 1,
      logs: [
        {
          address: [tokenAddress.toLowerCase()],
          topics: [
            [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            ],
          ],
        },
      ],
      fieldSelection: {
        block: [BlockField.Number, BlockField.Timestamp],
        log: [LogField.BlockNumber],
      },
    };

    const res = await client.get(query);

    // Try multiple ways to get the block timestamp
    let blockTimestamp = 0;

    // Method 1: Check all blocks in the response
    if (res.data?.blocks) {
      for (const blockNum in res.data.blocks) {
        const blockData = res.data.blocks[blockNum];
        if (blockData?.timestamp) {
          blockTimestamp = blockData.timestamp;
          break;
        }
      }
    }

    // Method 2: If no timestamp found, query a wider range or recent blocks
    if (blockTimestamp === 0) {
      // Try querying more blocks around midBlock to find one with data
      const widerQuery: any = {
        fromBlock: Math.max(0, midBlock - 100),
        toBlock: midBlock + 100,
        logs: [
          {
            address: [tokenAddress.toLowerCase()],
            topics: [
              [
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              ],
            ],
          },
        ],
        fieldSelection: {
          block: [BlockField.Number, BlockField.Timestamp],
          log: [LogField.BlockNumber],
        },
      };

      const widerRes = await client.get(widerQuery);
      if (widerRes.data?.blocks?.[midBlock]) {
        blockTimestamp = widerRes.data.blocks[midBlock].timestamp || 0;
      }
    }

    console.log(
      `[Binary search] Block ${midBlock}: timestamp ${blockTimestamp} vs target ${targetTimestamp}`
    );

    // If we still have 0 timestamp, estimate based on block number
    if (blockTimestamp === 0) {
      // Estimate: assume ~12 second block time from highBlock (current)
      const blocksFromCurrent = highBlock - midBlock;
      const estimatedSecondsAgo = blocksFromCurrent * 12;
      const currentEstimatedTimestamp = Math.floor(Date.now() / 1000);
      blockTimestamp = currentEstimatedTimestamp - estimatedSecondsAgo;
      console.log(
        `[Binary search] Using estimated timestamp for block ${midBlock}: ${blockTimestamp}`
      );
    }

    if (blockTimestamp >= targetTimestamp) {
      // Block timestamp is at or after cutoff - this block is in range, search earlier
      return findBlockByTimestamp(
        client,
        tokenAddress,
        targetTimestamp,
        lowBlock,
        midBlock
      );
    } else {
      // Block timestamp is before cutoff - need to search later
      return findBlockByTimestamp(
        client,
        tokenAddress,
        targetTimestamp,
        midBlock + 1,
        highBlock
      );
    }
  } catch (e) {
    console.warn(`Binary search step failed at block ${midBlock}:`, e);
    // If query fails, assume this block is after cutoff and search earlier
    return findBlockByTimestamp(
      client,
      tokenAddress,
      targetTimestamp,
      lowBlock,
      midBlock
    );
  }
}
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Get token - either by symbol or custom address
    const tokenInput = searchParams.get("token") || "USDC";
    const customTokenAddress = searchParams.get("tokenAddress");
    const customTokenDecimals = parseInt(searchParams.get("decimals") || "18");

    let tokenAddress: string;
    let decimals: number;
    let symbol: string;

    if (customTokenAddress) {
      // Custom token
      tokenAddress = customTokenAddress;
      decimals = customTokenDecimals;
      symbol = "CUSTOM";
    } else if (ERC20_TOKENS[tokenInput]) {
      // Preset token
      const token = ERC20_TOKENS[tokenInput];
      tokenAddress = token.address;
      decimals = token.decimals;
      symbol = tokenInput;
    } else {
      return Response.json(
        {
          success: false,
          error: `Token ${tokenInput} not found. Use preset or provide custom address.`,
          availableTokens: Object.keys(ERC20_TOKENS),
        },
        { status: 400 }
      );
    }

    // Get time range
    const timeRange = searchParams.get("timeRange") || "all";
    const minutesToQuery =
      TIME_RANGES[timeRange as keyof typeof TIME_RANGES] || 0;

    // Get custom block range if provided
    const customFromBlock = searchParams.get("fromBlock")
      ? parseInt(searchParams.get("fromBlock")!)
      : undefined;
    const customToBlock = searchParams.get("toBlock")
      ? parseInt(searchParams.get("toBlock")!)
      : undefined;

    // Determine query parameters - pass minutesToQuery directly, no pre-calculation
    let queryFromBlock = customFromBlock ?? 0;
    let queryToBlock = customToBlock;
    let queryMinutesToQuery = 0;

    // If time range is specified and no custom block range, use time-range mode
    if (!customFromBlock && !customToBlock && minutesToQuery > 0) {
      queryMinutesToQuery = minutesToQuery;
      console.log(`Time range: ${timeRange} = ${minutesToQuery} minutes`);
    }

    console.log(`🚀 Starting ${symbol} transfer query...`);

    const result = await queryERC20Transfers(
      tokenAddress,
      queryFromBlock,
      queryToBlock,
      decimals,
      queryMinutesToQuery
    );
    return Response.json(result);
  } catch (error) {
    console.error("Error in ERC20 query:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      token,
      tokenAddress,
      decimals = 18,
      timeRange = "all",
      fromBlock,
      toBlock,
    } = body;

    let resolvedAddress: string;
    let resolvedDecimals: number;

    if (tokenAddress) {
      resolvedAddress = tokenAddress;
      resolvedDecimals = decimals;
    } else if (token && ERC20_TOKENS[token]) {
      resolvedAddress = ERC20_TOKENS[token].address;
      resolvedDecimals = ERC20_TOKENS[token].decimals;
    } else {
      return Response.json(
        {
          success: false,
          error: "Must provide either token name or tokenAddress",
          availableTokens: Object.keys(ERC20_TOKENS),
        },
        { status: 400 }
      );
    }

    // Handle time range - pass minutesToQuery directly, no pre-calculation
    const minutesToQuery =
      TIME_RANGES[timeRange as keyof typeof TIME_RANGES] || 0;
    let queryMinutesToQuery = 0;

    if (!fromBlock && !toBlock && minutesToQuery > 0) {
      queryMinutesToQuery = minutesToQuery;
    }

    const result = await queryERC20Transfers(
      resolvedAddress,
      fromBlock ?? 0,
      toBlock,
      resolvedDecimals,
      queryMinutesToQuery
    );
    return Response.json(result);
  } catch (error) {
    console.error("Error in ERC20 query:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
