import {
  HypersyncClient,
  Decoder,
  BlockField,
  LogField,
} from "@envio-dev/hypersync-client";
import { NextRequest } from "next/server";

// Validate and normalize Ethereum address
function validateAndNormalizeAddress(address: string): string | null {
  if (!address) return null;

  // Remove 0x prefix if present
  let cleanAddr = address.toLowerCase().replace(/^0x/, "");

  // Check if it's a valid hex string
  if (!/^[0-9a-f]*$/.test(cleanAddr)) {
    return null;
  }

  // Ethereum addresses should be exactly 40 hex characters (20 bytes)
  if (cleanAddr.length !== 40) {
    return null;
  }

  return "0x" + cleanAddr;
}

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

// Helper function to extract fields (handles different key formats)
function getFirstField(obj: any, keys: string[]): any {
  if (!obj) return undefined;

  // Direct key lookup
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) {
      return obj[k];
    }
  }

  // Case-insensitive lookup
  const lowerMap = Object.keys(obj).reduce((acc, k) => {
    acc[k.toLowerCase()] = obj[k];
    return acc;
  }, {} as any);

  for (const k of keys) {
    const v = lowerMap[k.toLowerCase()];
    if (v != null) return v;
  }

  return undefined;
}

// Parse address from various formats
function parseAddress(addr: any): string {
  if (!addr) return "0x0000000000000000000000000000000000000000";

  // If it's an object with 'val' property (decoded indexed param)
  if (addr && typeof addr === "object" && "val" in addr) {
    addr = addr.val;
  }

  if (typeof addr === "string") {
    return addr.startsWith("0x") ? addr : "0x" + addr;
  }
  if (Buffer.isBuffer(addr)) {
    return "0x" + addr.toString("hex");
  }
  return "0x" + String(addr).toLowerCase();
}

// Format BigInt amount safely
function formatAmount(amount: bigint, decimals: number): string {
  const amountStr = amount.toString();
  const decimalStr = amountStr.padStart(decimals + 1, "0");
  const intPart = decimalStr.slice(0, -decimals) || "0";
  const fracPart = decimalStr.slice(-decimals).padStart(decimals, "0");
  const trimmedFrac = fracPart.replace(/0+$/, "");
  return trimmedFrac ? `${intPart}.${trimmedFrac}` : intPart;
}

interface TransferData {
  from: string;
  to: string;
  amount: string;
  amountFormatted: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  logIndex: number;
}

interface PaginatedResponse {
  success: boolean;
  data?: {
    transfers: TransferData[];
    nextFromBlock: number | null;
    totalFetched: number;
    currentBlock: number;
    oldestBlock: number;
  };
  error?: string;
  message?: string;
}

async function fetchERC20TransactionsPaginated(
  tokenAddress: string,
  decimals: number = 18,
  fromBlock?: number,
  limit: number = 10
): Promise<PaginatedResponse> {
  return fetchERC20TransactionsPaginatedWithUrl(
    tokenAddress,
    decimals,
    fromBlock,
    limit
  );
}

async function fetchERC20TransactionsPaginatedWithUrl(
  tokenAddress: string,
  decimals: number = 18,
  fromBlock?: number,
  limit: number = 10,
  hypersyncUrl?: string
): Promise<PaginatedResponse> {
  try {
    const client = hypersyncUrl
      ? HypersyncClient.new({ url: hypersyncUrl })
      : HypersyncClient.new(null);
    const decoder = Decoder.fromSignatures([
      "Transfer(address indexed from, address indexed to, uint256 value)",
    ]);

    // Get current block height if not provided
    let currentBlock = fromBlock;
    if (!currentBlock) {
      console.log("Fetching current block height...");
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
            block: [BlockField.Number],
            log: [LogField.BlockNumber],
          },
        };
        const heightRes = await client.get(heightQuery);
        currentBlock = heightRes.archiveHeight ?? 21000000;
        console.log(`Current block: ${currentBlock}`);
      } catch (e) {
        console.warn("Failed to fetch block height, using fallback");
        currentBlock = 21000000;
      }
    }

    const allTransfers: TransferData[] = [];
    let queryFromBlock = currentBlock;
    let queryCount = 0;
    const MAX_QUERIES = 100;
    const CHUNK_SIZE = 1000; // Query in chunks of 1000 blocks

    console.log(
      `Starting paginated query from block ${queryFromBlock} for token ${tokenAddress}`
    );

    // Query backward in chunks until we get enough transfers
    while (
      allTransfers.length < limit &&
      queryFromBlock > 0 &&
      queryCount < MAX_QUERIES
    ) {
      queryCount++;
      const toBlock = queryFromBlock;
      const fromBlockQuery = Math.max(0, queryFromBlock - CHUNK_SIZE);

      console.log(
        `Query ${queryCount}: Blocks ${fromBlockQuery} to ${toBlock}`
      );

      const query: any = {
        fromBlock: fromBlockQuery,
        toBlock: toBlock,
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
          log: [
            LogField.BlockNumber,
            LogField.LogIndex,
            LogField.TransactionHash,
            LogField.Data,
            LogField.Topic0,
            LogField.Topic1,
            LogField.Topic2,
          ],
        },
      };

      const res = await client.get(query);
      console.log(`Found ${res.data.logs.length} logs`);
      console.log(
        `Blocks data:`,
        res.data.blocks ? `${res.data.blocks.length} blocks` : "No blocks"
      );

      // Debug: Log first block structure
      if (res.data.blocks && res.data.blocks.length > 0) {
        console.log(
          "First block sample:",
          JSON.stringify(res.data.blocks[0], null, 2)
        );
      }

      if (res.data?.logs?.length > 0) {
        const decodedLogs = await decoder.decodeLogs(res.data.logs);

        // Group logs by block to ensure we complete each block
        const logsByBlock = new Map<number, any[]>();
        for (let i = 0; i < decodedLogs.length; i++) {
          const decoded = decodedLogs[i];
          if (!decoded) continue;

          const logData = res.data.logs[i];
          const blockNumber =
            getFirstField(logData, ["blockNumber", "block_number", "number"]) ??
            0;

          // Debug first log
          if (i === 0) {
            console.log("First decoded log:", {
              indexed: decoded.indexed,
              body: decoded.body,
              logData: logData,
            });
          }

          if (!logsByBlock.has(blockNumber)) {
            logsByBlock.set(blockNumber, []);
          }
          logsByBlock.get(blockNumber)!.push({ decoded, logData });
        }

        // Process blocks in descending order (newest first)
        const sortedBlocks = Array.from(logsByBlock.keys()).sort(
          (a, b) => b - a
        );

        for (const blockNumber of sortedBlocks) {
          const blockLogs = logsByBlock.get(blockNumber)!;

          // Find the block data - need to search through blocks array
          let blockTimestamp = 0;
          if (res.data.blocks && Array.isArray(res.data.blocks)) {
            const block = res.data.blocks.find((b: any) => {
              const bn = getFirstField(b, [
                "number",
                "blockNumber",
                "block_number",
              ]);
              return bn === blockNumber;
            });
            if (block) {
              blockTimestamp = getFirstField(block, ["timestamp", "time"]) || 0;
            }
          }

          // Process all transfers in this block
          for (const { decoded, logData } of blockLogs) {
            try {
              // Extract from and to addresses from indexed parameters
              const fromAddr = parseAddress(decoded.indexed?.[0]);
              const toAddr = parseAddress(decoded.indexed?.[1]);

              // Extract amount from body
              const amountVal = decoded.body?.[0]?.val;
              const amount =
                typeof amountVal === "bigint" ? amountVal : BigInt(0);

              // Extract transaction hash from log data
              const txHash =
                getFirstField(logData, [
                  "transactionHash",
                  "transaction_hash",
                  "txHash",
                  "tx_hash",
                ]) || "0x";

              const transfer: TransferData = {
                from: fromAddr,
                to: toAddr,
                amount: amount.toString(),
                amountFormatted: formatAmount(amount, decimals),
                transactionHash: txHash,
                blockNumber: blockNumber,
                timestamp: blockTimestamp,
                logIndex:
                  getFirstField(logData, ["logIndex", "log_index"]) ?? 0,
              };

              allTransfers.push(transfer);
            } catch (e) {
              console.error(`Error processing log:`, e);
              continue;
            }
          }

          // Check if we have enough transfers after completing this block
          if (allTransfers.length >= limit) {
            queryFromBlock = blockNumber - 1;
            break;
          }
        }
      }

      // Move to next chunk if we haven't found enough transfers
      if (allTransfers.length < limit) {
        queryFromBlock = fromBlockQuery - 1;
        if (queryFromBlock <= 0) break;
      } else {
        break;
      }
    }

    const oldestBlock =
      allTransfers.length > 0
        ? Math.min(...allTransfers.map((t) => t.blockNumber))
        : queryFromBlock;
    const nextFromBlock = oldestBlock > 0 ? oldestBlock - 1 : null;

    return {
      success: true,
      data: {
        transfers: serializeBigInt(allTransfers),
        nextFromBlock,
        totalFetched: allTransfers.length,
        currentBlock: fromBlock || currentBlock,
        oldestBlock,
      },
      message: `Fetched ${allTransfers.length} transfers across ${queryCount} queries`,
    };
  } catch (error) {
    console.error("Error fetching paginated transfers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const tokenAddressRaw = searchParams.get("tokenAddress");
    const decimals = parseInt(searchParams.get("decimals") || "18");
    const fromBlock = searchParams.get("fromBlock")
      ? parseInt(searchParams.get("fromBlock")!)
      : undefined;
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!tokenAddressRaw) {
      return Response.json(
        {
          success: false,
          error: "tokenAddress is required",
        },
        { status: 400 }
      );
    }

    // Validate and normalize the address
    const tokenAddress = validateAndNormalizeAddress(tokenAddressRaw);
    if (!tokenAddress) {
      return Response.json(
        {
          success: false,
          error: `Invalid token address: ${tokenAddressRaw}. Must be a valid 40-character hex string (with or without 0x prefix)`,
        },
        { status: 400 }
      );
    }

    console.log(`Validated token address: ${tokenAddress}`);

    const result = await fetchERC20TransactionsPaginated(
      tokenAddress,
      decimals,
      fromBlock,
      limit
    );

    return Response.json(result);
  } catch (error) {
    console.error("Error in GET handler:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      tokenAddress: tokenAddressRaw,
      decimals = 18,
      fromBlock,
      limit = 10,
      hypersyncUrl,
    } = body;

    if (!tokenAddressRaw) {
      return Response.json(
        {
          success: false,
          error: "tokenAddress is required",
        },
        { status: 400 }
      );
    }

    // Validate and normalize the address
    const tokenAddress = validateAndNormalizeAddress(tokenAddressRaw);
    if (!tokenAddress) {
      return Response.json(
        {
          success: false,
          error: `Invalid token address: ${tokenAddressRaw}. Must be a valid 40-character hex string (with or without 0x prefix)`,
        },
        { status: 400 }
      );
    }

    console.log(`Validated token address: ${tokenAddress}`);
    console.log(`Using Hypersync URL: ${hypersyncUrl || "default"}`);

    const result = await fetchERC20TransactionsPaginatedWithUrl(
      tokenAddress,
      decimals,
      fromBlock,
      limit,
      hypersyncUrl
    );

    return Response.json(result);
  } catch (error) {
    console.error("Error in POST handler:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
