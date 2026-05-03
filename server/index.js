import express from "express";
import cors from "cors";
import { getCached, searchCached, getPriceHistory, getStats, cleanup } from "./db.js";
import { scrapeQuery, scrapeAll, SCRAPE_QUERIES } from "./scraper.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Health check ──
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ── Stats ──
app.get("/api/stats", (_, res) => {
  res.json(getStats());
});

// ══════════════════════════════════════
//  SEARCH — the main endpoint
//  GET /api/search?q=RTX+4060
// ══════════════════════════════════════
app.get("/api/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q || q.length < 2) {
    return res.status(400).json({ error: "Query must be at least 2 characters" });
  }

  // 1. Check cache first (results less than 60 min old)
  const cached = getCached(q, 60);
  if (cached) {
    return res.json({
      results: cached,
      source: "cache",
      query: q,
      count: cached.length,
    });
  }

  // 2. Also try fuzzy search across all cached products
  const fuzzy = searchCached(q);
  if (fuzzy.length > 0) {
    return res.json({
      results: fuzzy,
      source: "cache-fuzzy",
      query: q,
      count: fuzzy.length,
    });
  }

  // 3. Live scrape if nothing cached
  try {
    const results = await scrapeQuery(q);
    return res.json({
      results: results.sort((a, b) => a.price - b.price),
      source: "live",
      query: q,
      count: results.length,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message, query: q });
  }
});

// ══════════════════════════════════════
//  PRICE COMPARE — for a specific part
//  GET /api/compare?part=AMD+Ryzen+5+5600X
// ══════════════════════════════════════
app.get("/api/compare", async (req, res) => {
  const part = (req.query.part || "").trim();
  if (!part) return res.status(400).json({ error: "part parameter required" });

  // Check cache
  const cached = getCached(part, 120);
  if (cached) {
    return res.json({
      results: cached,
      source: "cache",
      part,
    });
  }

  // Live scrape
  const results = await scrapeQuery(part);
  res.json({
    results: results.sort((a, b) => a.price - b.price),
    source: "live",
    part,
  });
});

// ══════════════════════════════════════
//  PRICE HISTORY
//  GET /api/history?product=RTX+4060&days=30
// ══════════════════════════════════════
app.get("/api/history", (req, res) => {
  const product = (req.query.product || "").trim();
  const days = parseInt(req.query.days) || 30;
  if (!product) return res.status(400).json({ error: "product parameter required" });

  const history = getPriceHistory(product, days);
  res.json({ product, days, history, count: history.length });
});

// ══════════════════════════════════════
//  TRIGGER SCRAPE — manual
//  POST /api/scrape        (full scrape)
//  POST /api/scrape/query  (single query)
// ══════════════════════════════════════
let scrapeRunning = false;

app.post("/api/scrape", async (_, res) => {
  if (scrapeRunning) {
    return res.status(409).json({ error: "Scrape already in progress" });
  }
  scrapeRunning = true;
  res.json({ message: "Full scrape started", queries: SCRAPE_QUERIES.length });

  // Run in background
  try {
    await scrapeAll();
  } catch (err) {
    console.error("Full scrape error:", err);
  } finally {
    scrapeRunning = false;
  }
});

app.post("/api/scrape/query", async (req, res) => {
  const q = (req.body.query || "").trim();
  if (!q) return res.status(400).json({ error: "query required in body" });

  try {
    const results = await scrapeQuery(q);
    res.json({ query: q, results, count: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════
//  CLEANUP
// ══════════════════════════════════════
app.post("/api/cleanup", (req, res) => {
  const days = parseInt(req.body?.days) || 7;
  cleanup(days);
  res.json({ message: `Cleaned data older than ${days} days` });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  PC Builder ZA — Price Scraper API       ║
║  http://localhost:${PORT}                    ║
╠══════════════════════════════════════════╣
║  GET  /api/search?q=RTX+4060            ║
║  GET  /api/compare?part=Ryzen+5+5600X   ║
║  GET  /api/history?product=RTX+4060     ║
║  POST /api/scrape          (full)        ║
║  POST /api/scrape/query    (single)      ║
║  GET  /api/stats                         ║
║  GET  /api/health                        ║
╚══════════════════════════════════════════╝
  `);
});
