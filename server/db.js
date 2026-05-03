import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "data", "prices.db");

// Ensure data dir exists
mkdirSync(join(__dirname, "data"), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent reads
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    url TEXT,
    in_stock INTEGER DEFAULT 1,
    retailer TEXT NOT NULL,
    scraped_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_products_query ON products(query);
  CREATE INDEX IF NOT EXISTS idx_products_retailer ON products(retailer);
  CREATE INDEX IF NOT EXISTS idx_products_scraped ON products(scraped_at);

  CREATE TABLE IF NOT EXISTS scrape_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    retailer TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    duration_ms INTEGER,
    error TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    retailer TEXT NOT NULL,
    price INTEGER NOT NULL,
    recorded_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_history_name ON price_history(product_name);
`);

// Prepared statements
const insertProduct = db.prepare(`
  INSERT INTO products (query, name, price, url, in_stock, retailer, scraped_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertLog = db.prepare(`
  INSERT INTO scrape_log (query, retailer, result_count, duration_ms, error)
  VALUES (?, ?, ?, ?, ?)
`);

const insertHistory = db.prepare(`
  INSERT INTO price_history (product_name, retailer, price)
  VALUES (?, ?, ?)
`);

const deleteOldProducts = db.prepare(`
  DELETE FROM products WHERE query = ? AND retailer = ?
`);

/**
 * Save scrape results — replaces old results for same query+retailer
 */
export function saveResults(query, retailer, results) {
  const txn = db.transaction(() => {
    deleteOldProducts.run(query, retailer);
    for (const r of results) {
      insertProduct.run(query, r.name, r.price, r.url, r.inStock ? 1 : 0, r.retailer, r.scrapedAt);
      insertHistory.run(r.name, r.retailer, r.price);
    }
  });
  txn();
}

/**
 * Log a scrape attempt
 */
export function logScrape(query, retailer, resultCount, durationMs, error = null) {
  insertLog.run(query, retailer, resultCount, durationMs, error);
}

/**
 * Get cached results for a query (all retailers)
 * Returns results if fresh (within maxAgeMinutes), null if stale
 */
export function getCached(query, maxAgeMinutes = 60) {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();
  const rows = db.prepare(`
    SELECT name, price, url, in_stock as inStock, retailer, scraped_at as scrapedAt
    FROM products
    WHERE query = ? AND scraped_at > ?
    ORDER BY price ASC
  `).all(query, cutoff);

  return rows.length > 0 ? rows : null;
}

/**
 * Search across all cached products by keyword
 */
export function searchCached(keyword) {
  const pattern = `%${keyword}%`;
  return db.prepare(`
    SELECT DISTINCT name, price, url, in_stock as inStock, retailer, scraped_at as scrapedAt
    FROM products
    WHERE name LIKE ?
    ORDER BY price ASC
    LIMIT 50
  `).all(pattern);
}

/**
 * Get price history for a product
 */
export function getPriceHistory(productName, days = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  return db.prepare(`
    SELECT retailer, price, recorded_at as recordedAt
    FROM price_history
    WHERE product_name LIKE ? AND recorded_at > ?
    ORDER BY recorded_at ASC
  `).all(`%${productName}%`, cutoff);
}

/**
 * Get scrape stats
 */
export function getStats() {
  const productCount = db.prepare("SELECT COUNT(*) as n FROM products").get().n;
  const queryCount = db.prepare("SELECT COUNT(DISTINCT query) as n FROM products").get().n;
  const lastScrape = db.prepare("SELECT MAX(scraped_at) as t FROM products").get().t;
  const historyCount = db.prepare("SELECT COUNT(*) as n FROM price_history").get().n;
  return { productCount, queryCount, lastScrape, historyCount };
}

/**
 * Clean old data (older than N days)
 */
export function cleanup(days = 7) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const del = db.prepare("DELETE FROM products WHERE scraped_at < ?").run(cutoff);
  console.log(`Cleaned ${del.changes} old product rows`);
}

export default db;
