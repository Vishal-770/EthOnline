import {
  HypersyncClient,
  LogField,
  BlockField,
  TransactionField,
} from "@envio-dev/hypersync-client";
import type { Query } from "@envio-dev/hypersync-client";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import type { Transaction } from "./aggregate.js";

dotenv.config();

const hypersyncUrl = "https://eth.hypersync.xyz";

const TRANSFER_EVENT_SIGNATURE =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const APPROVAL_EVENT_SIGNATURE =
  "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";

export async function getAllTokenTransactions(
  tokenAddress: string,
  hypersyncUrl: string = "https://eth.hypersync.xyz"
) {
  console.log(`🔗 Connecting to HyperSync: ${hypersyncUrl}`);
  console.log(`📍 Fetching all transactions for token: ${tokenAddress}\n`);

  const hs = HypersyncClient.new({
    url: hypersyncUrl,
    bearerToken: "c09215fd-568a-48f0-83b3-c96c2572ad85",
  });

  const allTransactions: Transaction[] = [];
  let fromBlock = 0;
  let hasMore = true;
  let batchCount = 0;

  console.log("⏳ Fetching transactions in batches...\n");

  while (hasMore) {
    try {
      batchCount++;
      console.log(
        `📦 Batch ${batchCount}: Querying from block ${fromBlock}...`
      );

      const query: Query = {
        fromBlock: fromBlock,
        logs: [
          {
            address: [tokenAddress],
            topics: [
              [TRANSFER_EVENT_SIGNATURE, APPROVAL_EVENT_SIGNATURE], // Get both Transfer and Approval events
            ],
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
            LogField.Topic3,
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
        maxNumLogs: 10000,
        includeAllBlocks: false,
      };

      const response = await hs.get(query);

      if (!response?.data?.logs || response.data.logs.length === 0) {
        hasMore = false;
        console.log("✅ No more transactions found.");
        break;
      }

      console.log(`   Found ${response.data.logs.length} events`);

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
        const eventData: any = {};

        // Decode Transfer event
        if (topic0 === TRANSFER_EVENT_SIGNATURE) {
          eventType = "Transfer";
          if (log.topics[1]) {
            eventData.from = "0x" + log.topics[1].slice(-40);
          }
          if (log.topics[2]) {
            eventData.to = "0x" + log.topics[2].slice(-40);
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
          }
          if (log.topics[2]) {
            eventData.spender = "0x" + log.topics[2].slice(-40);
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
        };

        allTransactions.push(txInfo);
      }

      // Prepare for next batch
      fromBlock = response.nextBlock;

      // If nextBlock is same or we got less than requested, we're done
      if (
        response.nextBlock === fromBlock ||
        response.data.logs.length < 10000
      ) {
        hasMore = false;
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      console.error("❌ Error fetching batch:", err);
      hasMore = false;
    }
  }

  // Sort transactions by block number, then transaction index, then log index
  allTransactions.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) {
      return a.blockNumber - b.blockNumber;
    }
    if (a.transactionIndex !== b.transactionIndex) {
      return a.transactionIndex - b.transactionIndex;
    }
    return a.logIndex - b.logIndex;
  });

  console.log(`\n✅ Total transactions fetched: ${allTransactions.length}`);

  // Save to JSON file
  const fs = await import("fs/promises");
  const outputPath = "./token_transactions.json";

  const jsonString = JSON.stringify(
    {
      tokenAddress,
      totalTransactions: allTransactions.length,
      fetchedAt: new Date().toISOString(),
      transactions: allTransactions,
    },
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  );

  // await fs.writeFile(outputPath, jsonString);
  console.log(`💾 Transactions saved to: ${outputPath}`);

  // Print summary statistics
  const transferCount = allTransactions.filter(
    (tx) => tx.eventType === "Transfer"
  ).length;
  const approvalCount = allTransactions.filter(
    (tx) => tx.eventType === "Approval"
  ).length;

  const uniqueAddresses = new Set<string>();
  allTransactions.forEach((tx) => {
    if (tx.eventData.from) uniqueAddresses.add(tx.eventData.from);
    if (tx.eventData.to) uniqueAddresses.add(tx.eventData.to);
    // if (tx.eventData.owner) uniqueAddresses.add(tx.eventData.owner);
    // if (tx.eventData.spender) uniqueAddresses.add(tx.eventData.spender);
  });

  console.log("\n📊 TRANSACTION SUMMARY:");
  console.log("━".repeat(60));
  console.table({
    "Total Events": allTransactions.length,
    Transfers: transferCount,
    Approvals: approvalCount,
    "Unique Addresses": uniqueAddresses.size,
    "First Block": allTransactions[0]?.blockNumber || "N/A",
    "Last Block":
      allTransactions[allTransactions.length - 1]?.blockNumber || "N/A",
  });

  // Show first 10 and last 10 transactions
  console.log("\n📋 FIRST 10 TRANSACTIONS:");
  console.log("━".repeat(60));
  allTransactions.slice(0, 10).forEach((tx, idx) => {
    console.log(
      `${idx + 1}. Block ${tx.blockNumber} | ${tx.eventType} | ${tx.transactionHash.slice(0, 10)}...`
    );
    if (tx.eventType === "Transfer") {
      console.log(
        `   From: ${tx.eventData.from?.slice(0, 10)}... To: ${tx.eventData.to?.slice(0, 10)}...`
      );
    }
  });

  console.log("\n📋 LAST 10 TRANSACTIONS:");
  console.log("━".repeat(60));
  allTransactions.slice(-10).forEach((tx, idx) => {
    console.log(
      `${allTransactions.length - 9 + idx}. Block ${tx.blockNumber} | ${tx.eventType} | ${tx.transactionHash.slice(0, 10)}...`
    );
    if (tx.eventType === "Transfer") {
      console.log(
        `   From: ${tx.eventData.from?.slice(0, 10)}... To: ${tx.eventData.to?.slice(0, 10)}...`
      );
    }
  });

  return allTransactions;
}

// // Run the script
// getAllTokenTransactions("0x00c83aecc790e8a4453e5dd3b0b4b3680501a7a7")
//   .then(() => {
//     console.log("\n✅ Script completed successfully!");
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error("\n❌ Script failed:", error);
//     process.exit(1);
//   });
