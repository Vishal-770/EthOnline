import { fetchTokenAddresses } from "./fetch-token-address.js";
import { fetchTokenMetadata } from "./fetch-token-metadata.js";
import * as fs from "fs";

async function main() {
  console.log("=".repeat(60));
  console.log("🚀 TOKEN FETCHER - Starting Complete Process");
  console.log("=".repeat(60));

  try {
    // Configuration
    const DAYS_TO_LOOK_BACK = 365; // Adjust as needed
    const BATCH_SIZE = 100;

    // Step 1: Get all token addresses
    const tokenAddresses = await fetchTokenAddresses(DAYS_TO_LOOK_BACK);

    if (tokenAddresses.length === 0) {
      console.log("⚠️  No token addresses found. Exiting...");
      return;
    }

    // Save addresses to file
    fs.writeFileSync('token-addresses.json', JSON.stringify(tokenAddresses, null, 2));
    console.log(`📄 Token addresses saved to token-addresses.json\n`);

    // Step 2: Fetch metadata for all tokens with progress tracking
    const tokensWithMetadata = await fetchTokenMetadata(
      tokenAddresses, 
      BATCH_SIZE,
      (processed, total, found) => {
        // Progress callback - save intermediate results every 500 tokens
        if (processed % 500 === 0 || processed === total) {
          const currentData = tokensWithMetadata.slice(0, found);
          fs.writeFileSync('tokens-metadata-progress.json', JSON.stringify(currentData, null, 2));
        }
      }
    );

    // Final results
    console.log("\n" + "=".repeat(60));
    console.log("✅ PROCESS COMPLETE!");
    console.log("=".repeat(60));
    console.log(`Total addresses found: ${tokenAddresses.length}`);
    console.log(`Tokens with valid metadata: ${tokensWithMetadata.length}`);
    console.log(`Success rate: ${((tokensWithMetadata.length / tokenAddresses.length) * 100).toFixed(2)}%`);

    // Save final results
    fs.writeFileSync('tokens-complete.json', JSON.stringify(tokensWithMetadata, null, 2));
    console.log(`\n📄 Final results saved to tokens-complete.json`);

    // Show sample of results
    console.log("\n📊 Sample of fetched tokens (first 10):");
    console.table(tokensWithMetadata.slice(0, 10));

    // Statistics by time period
    const now = Date.now() / 1000;
    const oneDay = 24 * 60 * 60;
    const tokensLast24h = tokensWithMetadata.filter(t => t.firstSeenTimestamp > now - oneDay).length;
    const tokensLast7d = tokensWithMetadata.filter(t => t.firstSeenTimestamp > now - (7 * oneDay)).length;
    const tokensLast30d = tokensWithMetadata.filter(t => t.firstSeenTimestamp > now - (30 * oneDay)).length;

    console.log("\n📈 Token Statistics:");
    console.log(`Tokens deployed in last 24 hours: ${tokensLast24h}`);
    console.log(`Tokens deployed in last 7 days: ${tokensLast7d}`);
    console.log(`Tokens deployed in last 30 days: ${tokensLast30d}`);

    console.log("\n✨ All done! Check the output files for complete data.");

    return tokensWithMetadata;

  } catch (error) {
    console.error("\n❌ Error occurred:", error);
    throw error;
  }
}

// Run the main function
main().catch(console.error);