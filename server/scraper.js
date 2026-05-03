import { scrapeEvetech } from "./scrapers/evetech.js";
import { scrapeWootware } from "./scrapers/wootware.js";
import { scrapePriceCheck } from "./scrapers/pricecheck.js";
import { saveResults, logScrape } from "./db.js";

/**
 * All the search queries to scrape — maps to the parts in our frontend
 * Each query targets a specific component to find current prices
 */
export const SCRAPE_QUERIES = [
  // CPUs — AM4
  "AMD Ryzen 3 4100",
  "AMD Ryzen 5 5500",
  "AMD Ryzen 5 5600",
  "AMD Ryzen 5 5600X",
  "AMD Ryzen 7 5700X",
  "AMD Ryzen 7 5800X",
  "AMD Ryzen 7 5800X3D",
  "AMD Ryzen 9 5900X",
  // CPUs — AM5
  "AMD Ryzen 5 7600",
  "AMD Ryzen 5 7600X",
  "AMD Ryzen 7 7700X",
  "AMD Ryzen 7 7800X3D",
  "AMD Ryzen 9 7900X",
  "AMD Ryzen 9 7950X",
  // CPUs — Intel
  "Intel Core i3-12100F",
  "Intel Core i5-12400F",
  "Intel Core i5-12600K",
  "Intel Core i7-12700K",
  "Intel Core i5-13400F",
  "Intel Core i5-14600K",
  "Intel Core i7-14700K",
  "Intel Core i9-14900K",
  // GPUs
  "AMD Radeon RX 6600",
  "AMD Radeon RX 6650 XT",
  "NVIDIA RTX 3060 12GB",
  "AMD Radeon RX 6700 XT",
  "NVIDIA RTX 4060",
  "Intel Arc A770",
  "NVIDIA RTX 4060 Ti",
  "AMD Radeon RX 7700 XT",
  "AMD Radeon RX 7800 XT",
  "NVIDIA RTX 4070 Super",
  "NVIDIA RTX 4070 Ti Super",
  "AMD Radeon RX 7900 XTX",
  "NVIDIA RTX 4080 Super",
  "NVIDIA RTX 4090",
  // Motherboards
  "Gigabyte A520M",
  "MSI B450M PRO",
  "MSI B550M",
  "ASUS TUF B550 PLUS WiFi",
  "ASUS TUF X570 PLUS",
  "Gigabyte A620M",
  "MSI B650M",
  "MSI B650 Tomahawk WiFi",
  "ASUS ROG Strix X670E",
  "Gigabyte H610M",
  "MSI B660M",
  "MSI B760M Mortar WiFi",
  "ASUS TUF Z690 PLUS",
  "ASUS ROG Z790",
  // RAM
  "8GB DDR4 3200",
  "16GB DDR4 3200",
  "16GB DDR4 3600",
  "32GB DDR4 3600",
  "16GB DDR5 5600",
  "32GB DDR5 6000",
  "64GB DDR5",
  // Storage
  "500GB NVMe SSD",
  "1TB NVMe SSD",
  "2TB NVMe SSD",
  "4TB NVMe SSD",
  // PSU
  "650W 80 Plus Gold",
  "750W 80 Plus Gold",
  "850W 80 Plus Gold",
  "1000W 80 Plus Platinum",
  // Coolers
  "Noctua NH-U12S",
  "Noctua NH-D15",
  "240mm AIO cooler",
  "360mm AIO cooler",
];

const SCRAPERS = [
  { name: "evetech", fn: scrapeEvetech },
  { name: "wootware", fn: scrapeWootware },
  { name: "pricecheck", fn: scrapePriceCheck },
];

/**
 * Scrape a single query across all retailers
 */
export async function scrapeQuery(query) {
  console.log(`\n▸ Scraping: "${query}"`);
  const allResults = [];

  for (const scraper of SCRAPERS) {
    const start = Date.now();
    try {
      const results = await scraper.fn(query);
      const duration = Date.now() - start;
      saveResults(query, scraper.name, results);
      logScrape(query, scraper.name, results.length, duration);
      allResults.push(...results);
    } catch (err) {
      const duration = Date.now() - start;
      logScrape(query, scraper.name, 0, duration, err.message);
    }
  }

  return allResults;
}

/**
 * Scrape ALL queries — full refresh
 * With delays between queries to avoid hammering retailers
 */
export async function scrapeAll({ delayMs = 3000, onProgress } = {}) {
  console.log(`\n════════════════════════════════════════`);
  console.log(`  Starting full scrape: ${SCRAPE_QUERIES.length} queries × ${SCRAPERS.length} retailers`);
  console.log(`════════════════════════════════════════\n`);

  const startTime = Date.now();
  let completed = 0;
  let totalResults = 0;

  for (const query of SCRAPE_QUERIES) {
    const results = await scrapeQuery(query);
    totalResults += results.length;
    completed++;

    if (onProgress) {
      onProgress({ completed, total: SCRAPE_QUERIES.length, query, results: results.length });
    }

    // Delay between queries
    if (completed < SCRAPE_QUERIES.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n════════════════════════════════════════`);
  console.log(`  Done! ${totalResults} total results in ${duration}s`);
  console.log(`════════════════════════════════════════\n`);

  return { totalResults, duration: parseFloat(duration), queries: SCRAPE_QUERIES.length };
}
