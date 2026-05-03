#!/usr/bin/env node
/**
 * Manual full scrape — run to populate the database with current prices
 *
 * Usage:
 *   node scripts/scrape-all.js
 *   node scripts/scrape-all.js --delay 5000   (5s between queries)
 */
import { scrapeAll } from "../scraper.js";
import { getStats } from "../db.js";

const delayMs = parseInt(process.argv.find((a) => a.startsWith("--delay="))?.split("=")[1]) || 3000;

console.log("🇿🇦 PC Builder ZA — Full Price Scrape");
console.log(`   Delay between queries: ${delayMs}ms\n`);

const result = await scrapeAll({
  delayMs,
  onProgress: ({ completed, total, query, results }) => {
    const pct = ((completed / total) * 100).toFixed(0);
    console.log(`  [${pct}%] ${completed}/${total} — "${query}" → ${results} results`);
  },
});

console.log("\n📊 Database stats:");
console.log(getStats());

process.exit(0);
