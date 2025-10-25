import {
  HypersyncClient,
  LogField,
  BlockField,
  TransactionField,
} from "@envio-dev/hypersync-client";
import type { Query } from "@envio-dev/hypersync-client";
import * as dotenv from "dotenv";
import fs from "fs/promises";
import { CHAINS } from "./multichain-address.js";

dotenv.config();

const TRANSFER_EVENT_SIGNATURE =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const APPROVAL_EVENT_SIGNATURE =
  "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";

export interface Transaction {
  blockNumber: number;
  timestamp: number;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  eventType: string;
  eventData: {
    from?: string;
    to?: string;
    owner?: string;
    spender?: string;
    value: string;
  };
  chainId: number;
  chainName: string;
}

export interface QuickStats {
  totalTransactions: number;
  transferCount: number;
  approvalCount: number;
  uniqueAddresses: number;
  firstActivity: number;
  lastActivity: number;
  ageInHours: number;
  txPerHour: number;
}

/**
 * Fetch all transactions for a token on a specific chain
 */
async function fetchTransactionsForChain(
  tokenAddress: string,
  chainId: number,
  chainName: string,
  hypersyncUrl: string
): Promise<{ transactions: Transaction[]; stats: QuickStats }> {
  console.log(`\n📡 Fetching transactions from ${chainName}...`);

  const hs = HypersyncClient.new({
    url: hypersyncUrl,
    bearerToken:
      process.env.HYPERSYNC_BEARER_TOKEN ||
      "c09215fd-568a-48f0-83b3-c96c2572ad85",
  });

  const allTransactions: Transaction[] = [];
  const uniqueAddresses = new Set<string>();
  let fromBlock = 0;
  let batchCount = 0;

  while (true) {
    try {
      batchCount++;

      const query: Query = {
        fromBlock,
        logs: [
          {
            address: [tokenAddress],
            topics: [[TRANSFER_EVENT_SIGNATURE, APPROVAL_EVENT_SIGNATURE]],
          },
        ],
        fieldSelection: {
          log: [
            LogField.BlockNumber,
            LogField.TransactionHash,
            LogField.TransactionIndex,
            LogField.LogIndex,
            LogField.Address,
            LogField.Topic0,
            LogField.Topic1,
            LogField.Topic2,
            LogField.Data,
          ],
          transaction: [
            TransactionField.Hash,
            TransactionField.From,
            TransactionField.To,
            TransactionField.Value,
            TransactionField.GasUsed,
            TransactionField.GasPrice,
            TransactionField.BlockNumber,
            TransactionField.TransactionIndex,
          ],
          block: [BlockField.Number, BlockField.Timestamp, BlockField.Hash],
        },
        maxNumLogs: 100000, // Large batches for efficiency
        includeAllBlocks: false,
      };

      const response = await hs.get(query);

      if (!response?.data?.logs || response.data.logs.length === 0) {
        break;
      }

      console.log(
        `   Batch ${batchCount}: ${response.data.logs.length} events (block ${fromBlock})`
      );

      // Process logs
      for (const log of response.data.logs) {
        const block = response.data.blocks?.find(
          (b) => b.number === log.blockNumber
        );
        const transaction = response.data.transactions?.find(
          (tx) => tx.hash?.toLowerCase() === log.transactionHash?.toLowerCase()
        );

        if (!log.topics || log.topics.length === 0) continue;

        const topic0 = log.topics[0];
        let eventType = "Unknown";
        const eventData: any = { value: "0" };

        // Decode Transfer event
        if (topic0 === TRANSFER_EVENT_SIGNATURE) {
          eventType = "Transfer";
          if (log.topics[1]) {
            eventData.from = "0x" + log.topics[1].slice(-40);
            uniqueAddresses.add(eventData.from);
          }
          if (log.topics[2]) {
            eventData.to = "0x" + log.topics[2].slice(-40);
            uniqueAddresses.add(eventData.to);
          }
          if (log.data) {
            try {
              eventData.value = BigInt(log.data).toString();
            } catch {
              eventData.value = log.data;
            }
          }
        }
        // Decode Approval event
        else if (topic0 === APPROVAL_EVENT_SIGNATURE) {
          eventType = "Approval";
          if (log.topics[1]) {
            eventData.owner = "0x" + log.topics[1].slice(-40);
            uniqueAddresses.add(eventData.owner);
          }
          if (log.topics[2]) {
            eventData.spender = "0x" + log.topics[2].slice(-40);
            uniqueAddresses.add(eventData.spender);
          }
          if (log.data) {
            try {
              eventData.value = BigInt(log.data).toString();
            } catch {
              eventData.value = log.data;
            }
          }
        }

        const txInfo: Transaction = {
          blockNumber: log.blockNumber ?? 0,
          timestamp: block?.timestamp ?? 0,
          transactionHash: log.transactionHash ?? "",
          transactionIndex: log.transactionIndex ?? 0,
          logIndex: log.logIndex ?? 0,
          from: transaction?.from ?? "",
          to: transaction?.to ?? "",
          value: transaction?.value?.toString() ?? "0",
          gasUsed: transaction?.gasUsed?.toString() ?? "0",
          gasPrice: transaction?.gasPrice?.toString() ?? "0",
          eventType,
          eventData,
          chainId,
          chainName,
        };

        allTransactions.push(txInfo);
      }

      fromBlock = response.nextBlock;

      if (response.data.logs.length < 100000) {
        break;
      }

      // Minimal rate limiting
      await new Promise((resolve) => setTimeout(resolve, 30));
    } catch (err) {
      console.error(`   ❌ Error in batch ${batchCount}:`, err);
      break;
    }
  }

  // Sort transactions
  allTransactions.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) return a.blockNumber - b.blockNumber;
    if (a.transactionIndex !== b.transactionIndex)
      return a.transactionIndex - b.transactionIndex;
    return a.logIndex - b.logIndex;
  });

  // Calculate quick stats
  const transferCount = allTransactions.filter(
    (tx) => tx.eventType === "Transfer"
  ).length;
  const approvalCount = allTransactions.filter(
    (tx) => tx.eventType === "Approval"
  ).length;
  const firstActivity = allTransactions[0]?.timestamp || 0;
  const lastActivity =
    allTransactions[allTransactions.length - 1]?.timestamp || 0;
  const ageInHours = Math.floor((lastActivity - firstActivity) / 3600);
  const txPerHour = ageInHours > 0 ? allTransactions.length / ageInHours : 0;

  const stats: QuickStats = {
    totalTransactions: allTransactions.length,
    transferCount,
    approvalCount,
    uniqueAddresses: uniqueAddresses.size,
    firstActivity,
    lastActivity,
    ageInHours,
    txPerHour,
  };

  console.log(`   ✅ Found ${allTransactions.length} transactions`);
  console.log(`   📊 ${transferCount} transfers, ${approvalCount} approvals`);
  console.log(`   👥 ${uniqueAddresses.size} unique addresses`);

  return { transactions: allTransactions, stats };
}

/**
 * Fetch transactions for a token across multiple chains
 */
export async function getAllTokenTransactionsMultichain(
  tokenAddress: string,
  chainIds?: number[]
): Promise<{
  allTransactions: Transaction[];
  byChain: Map<number, { transactions: Transaction[]; stats: QuickStats }>;
  aggregatedStats: any;
}> {
  console.log("\n🔍 MULTICHAIN TRANSACTION FETCHER");
  console.log("━".repeat(70));
  console.log(`Token: ${tokenAddress}`);

  const chainsToFetch = chainIds
    ? CHAINS.filter((c) => chainIds.includes(c.id))
    : CHAINS;

  console.log(`Chains: ${chainsToFetch.map((c) => c.name).join(", ")}\n`);

  const startTime = Date.now();
  const byChain = new Map<
    number,
    { transactions: Transaction[]; stats: QuickStats }
  >();

  // Fetch from all chains in parallel
  const results = await Promise.allSettled(
    chainsToFetch.map((chain) =>
      fetchTransactionsForChain(tokenAddress, chain.id, chain.name, chain.url)
    )
  );

  // Collect results
  const allTransactions: Transaction[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const chain = chainsToFetch[index];
      if (chain) {
        byChain.set(chain.id, result.value);
        allTransactions.push(...result.value.transactions);
      }
    } else {
      const chainName = chainsToFetch[index]?.name || "Unknown";
      // Failed to fetch transactions
    }
  });

  // Sort all transactions by timestamp
  allTransactions.sort((a, b) => {
    if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
    if (a.blockNumber !== b.blockNumber) return a.blockNumber - b.blockNumber;
    return a.logIndex - b.logIndex;
  });

  // Aggregate stats
  const aggregatedStats = {
    totalTransactions: allTransactions.length,
    totalTransfers: allTransactions.filter((tx) => tx.eventType === "Transfer")
      .length,
    totalApprovals: allTransactions.filter((tx) => tx.eventType === "Approval")
      .length,
    uniqueAddresses: new Set(
      allTransactions.flatMap((tx) =>
        [
          tx.eventData.from,
          tx.eventData.to,
          tx.eventData.owner,
          tx.eventData.spender,
        ].filter(Boolean)
      )
    ).size,
    chainCount: byChain.size,
    byChain: Object.fromEntries(
      Array.from(byChain.entries()).map(([chainId, data]) => [
        CHAINS.find((c) => c.id === chainId)?.name || chainId,
        {
          transactions: data.stats.totalTransactions,
          transfers: data.stats.transferCount,
          uniqueAddresses: data.stats.uniqueAddresses,
          txPerHour: data.stats.txPerHour.toFixed(2),
        },
      ])
    ),
  };

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("\n✅ FETCH COMPLETE");
  console.log("━".repeat(70));
  console.log(`Total transactions: ${aggregatedStats.totalTransactions}`);
  console.log(`Duration: ${duration}s\n`);

  console.log("📊 Aggregated Stats:");
  console.table({
    "Total Transactions": aggregatedStats.totalTransactions,
    Transfers: aggregatedStats.totalTransfers,
    Approvals: aggregatedStats.totalApprovals,
    "Unique Addresses": aggregatedStats.uniqueAddresses,
    Chains: aggregatedStats.chainCount,
  });

  console.log("\n📊 By Chain:");
  console.table(aggregatedStats.byChain);

  // Save to file
  try {
    const output = {
      tokenAddress,
      fetchedAt: new Date().toISOString(),
      aggregatedStats,
      transactions: allTransactions,
    };

    await fs.writeFile(
      `./transactions_${tokenAddress.slice(0, 10)}.json`,
      JSON.stringify(output, null, 2)
    );
    console.log(
      `\n💾 Saved to: ./transactions_${tokenAddress.slice(0, 10)}.json`
    );
  } catch (error) {
    console.error("Failed to save file:", error);
  }

  return { allTransactions, byChain, aggregatedStats };
}

/**
 * Batch fetch transactions for multiple tokens
 */
export async function batchFetchTransactions(
  tokens: Array<{ address: string; chainId?: number }>
): Promise<
  Map<string, { allTransactions: Transaction[]; aggregatedStats: any }>
> {
  console.log(`\n🚀 BATCH TRANSACTION FETCHER`);
  console.log("━".repeat(70));
  console.log(`Fetching transactions for ${tokens.length} tokens\n`);

  const results = new Map();
  const CONCURRENCY = 2; // Limit concurrent requests

  for (let i = 0; i < tokens.length; i += CONCURRENCY) {
    const batch = tokens.slice(i, i + CONCURRENCY);

    const batchResults = await Promise.allSettled(
      batch.map(async (token) => {
        const chainIds = token.chainId ? [token.chainId] : undefined;
        const data = await getAllTokenTransactionsMultichain(
          token.address,
          chainIds
        );
        return {
          key: `${token.chainId || "all"}-${token.address}`,
          data: {
            allTransactions: data.allTransactions,
            aggregatedStats: data.aggregatedStats,
          },
        };
      })
    );

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.set(result.value.key, result.value.data);
      }
    });

    // Rate limiting between batches
    if (i + CONCURRENCY < tokens.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log(
    `\n✅ Batch complete. Fetched ${results.size}/${tokens.length} tokens`
  );

  return results;
}

// CLI execution
// if (require.main === module) {
const args = process.argv.slice(2);
const tokenAddress = "0x00c83aecc790e8a4453e5dd3b0b4b3680501a7a7";
const chainIds = args[1]
  ? args[1].split(",").map((id) => parseInt(id.trim()))
  : undefined;

if (!tokenAddress) {
  console.error(
    "Usage: ts-node multichain-transactions.ts <tokenAddress> [chainIds]"
  );
  console.error("Example: ts-node multichain-transactions.ts 0x123... 1,8453");
  process.exit(1);
}

getAllTokenTransactionsMultichain(tokenAddress, chainIds)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
// }
