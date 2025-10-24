/**
 * MemeSentinel - Multi-Agent DeFi Intelligence System
 * Main Entry Point
 *
 * This starts the orchestrator which manages all agents:
 * - Scout Agent (Token Discovery)
 * - Yield Agent (Liquidity Analysis)
 * - Risk Agent (Risk Assessment)
 * - Alert Agent (Alert Generation)
 * - Settlement Agent (Transaction Management)
 * - Assistant Agent (User Interface)
 */

import * as dotenv from "dotenv";
import { MemeSentinelOrchestrator } from "./orchestrator";

// Load environment variables
dotenv.config();

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║           🚀 MemeSentinel Starting...                   ║");
  console.log("║   Multi-Agent DeFi Intelligence System for Memecoins    ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log();

  try {
    const orchestrator = new MemeSentinelOrchestrator();
    await orchestrator.start();
  } catch (error) {
    console.error("❌ Fatal error starting MemeSentinel:", error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the application
main();
