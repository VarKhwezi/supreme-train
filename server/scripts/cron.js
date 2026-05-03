#!/usr/bin/env node
/**
 * Cron-based scheduled scraping
 *
 * Runs a full scrape every 6 hours and cleans old data weekly.
 *
 * Usage:
 *   node scripts/cron.js           (runs in foreground)
 *   pm2 start scripts/cron.js      (runs as daemon)
 */
import cron from "node-cron";
import { scrapeAll } from "../scraper.js";
import { cleanup, getStats } from "../db.js";

console.log("🕐 PC Builder ZA — Cron Scheduler Started");
console.log("   Full scrape: every 6 hours (0 */6 * * *)");
console.log("   Cleanup: weekly Sundays at 3am (0 3 * * 0)\n");

// Full scrape every 6 hours
cron.schedule("0 */6 * * *", async () => {
  console.log(`\n[${new Date().toISOString()}] ⏰ Scheduled scrape starting...`);
  try {
    const result = await scrapeAll({ delayMs: 3000 });
    console.log(`[${new Date().toISOString()}] ✅ Scrape done: ${result.totalResults} results in ${result.duration}s`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Scrape failed:`, err.message);
  }
});

// Cleanup old data every Sunday at 3am
cron.schedule("0 3 * * 0", () => {
  console.log(`\n[${new Date().toISOString()}] 🧹 Running weekly cleanup...`);
  cleanup(7);
  console.log("   Stats:", getStats());
});

// Initial scrape on startup
console.log("Running initial scrape...");
scrapeAll({ delayMs: 2000 }).then((result) => {
  console.log(`Initial scrape done: ${result.totalResults} results`);
  console.log("Stats:", getStats());
}).catch((err) => {
  console.error("Initial scrape error:", err.message);
});
