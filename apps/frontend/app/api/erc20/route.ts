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
  blockOffsetFromEnd: number = 0 // For time-range queries: blocks back from current
) {
  const client = HypersyncClient.new(null);

  // Create decoder for ERC20 Transfer events
  const decoder = Decoder.fromSignatures([
    "Transfer(address indexed from, address indexed to, uint256 value)",
  ]);

  // Get current block height by querying the last block
  console.log("Fetching current block height...");
  let currentBlock = 0;
  try {
    // Query a very recent block to get archive height reliably
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
        block: [BlockField.Number],
        log: [LogField.BlockNumber],
      },
    };
    const heightRes = await client.get(heightQuery);
    currentBlock = heightRes.archiveHeight ?? 20000000;
    console.log(`Current block height (from archiveHeight): ${currentBlock}`);
  } catch (e) {
    console.warn("Failed to fetch block height, using fallback:", e);
    currentBlock = 20000000;
  }

  // Determine query range
  let queryFromBlock = fromBlock;
  let queryToBlock = toBlock ?? currentBlock;

  // If blockOffsetFromEnd is specified (time-range query), calculate from end backwards
  // Using accurate block time: Ethereum ~13-14 seconds per block = ~4.615 blocks per minute
  if (blockOffsetFromEnd > 0) {
    queryToBlock = currentBlock;
    const accurateBlocksPerMinute = 60 / 13; // ~4.615
    const offsetBlocks = Math.ceil(
      blockOffsetFromEnd * accurateBlocksPerMinute
    );
    queryFromBlock = Math.max(0, currentBlock - offsetBlocks);
    console.log(
      `Time-range offset: ${blockOffsetFromEnd} min blocks → ${offsetBlocks} accurate blocks`
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
  const MAX_BLOCKS_PER_QUERY = 1000000; // HyperSync limit per query

  // Pagination loop to handle large block ranges
  while (currentFromBlock < queryToBlock) {
    const currentQueryToBlock = Math.min(
      currentFromBlock + MAX_BLOCKS_PER_QUERY,
      queryToBlock
    );

    console.log(
      `Querying blocks ${currentFromBlock} to ${currentQueryToBlock} for token: ${tokenAddress}`
    );

    const query: any = {
      fromBlock: currentFromBlock,
      toBlock: currentQueryToBlock,
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
    console.log(`Query returned ${res.data.logs.length} logs`);
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

          // Safely extract indexed parameters (from, to addresses)
          const fromAddr = parseAddress(decoded.indexed?.[0]);
          const toAddr = parseAddress(decoded.indexed?.[1]);

          // Extract amount from body
          const amountVal = decoded.body?.[0]?.val;
          const amount = typeof amountVal === "bigint" ? amountVal : BigInt(0);

          totalVolume += amount;

          const transfer = {
            blockNumber: logData?.blockNumber,
            timestamp: (blockData as any)?.timestamp || 0, // Actual block timestamp
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

    currentFromBlock = currentQueryToBlock;
  }

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
        nextBlock: queryToBlock,
        archiveHeight: currentBlock,
        transfers: [],
      },
      message: "No transfers found in this range.",
    };
  }

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
      nextBlock: queryToBlock,
      archiveHeight: currentBlock,
      transfers: serializeBigInt(allTransfers), // Return ALL transfers for accuracy
    },
    message: `Found ${allTransfers.length} transfers across ${totalBlocks} blocks. Total volume: ${formatAmount(
      totalVolume,
      decimals
    )}`,
  };
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

    // Determine query parameters
    let queryFromBlock = customFromBlock ?? 0;
    let queryToBlock = customToBlock;
    let blockOffsetFromEnd = 0;

    // If time range is specified and no custom block range, calculate blocks from end backwards
    if (!customFromBlock && !customToBlock && minutesToQuery > 0) {
      // Calculate block offset: 5 blocks per minute
      blockOffsetFromEnd = minutesToQuery * 5;
      console.log(
        `Time range: ${timeRange} = ${minutesToQuery} minutes = ${blockOffsetFromEnd} blocks from end`
      );
    }

    console.log(`🚀 Starting ${symbol} transfer query...`);

    const result = await queryERC20Transfers(
      tokenAddress,
      queryFromBlock,
      queryToBlock,
      decimals,
      blockOffsetFromEnd
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

    // Handle time range
    const minutesToQuery =
      TIME_RANGES[timeRange as keyof typeof TIME_RANGES] || 0;
    let blockOffsetFromEnd = 0;

    if (!fromBlock && !toBlock && minutesToQuery > 0) {
      blockOffsetFromEnd = minutesToQuery * 5;
    }

    const result = await queryERC20Transfers(
      resolvedAddress,
      fromBlock ?? 0,
      toBlock,
      resolvedDecimals,
      blockOffsetFromEnd
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
