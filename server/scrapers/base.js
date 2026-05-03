import fetch from "node-fetch";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
];

const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Rate limiter — one request per domain at a time, with delay
const domainTimestamps = {};
const RATE_LIMIT_MS = 1500; // 1.5s between requests to same domain

async function waitForDomain(domain) {
  const now = Date.now();
  const last = domainTimestamps[domain] || 0;
  const wait = Math.max(0, RATE_LIMIT_MS - (now - last));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  domainTimestamps[domain] = Date.now();
}

/**
 * Fetch a URL with retries, rate limiting, and rotating user agents
 */
export async function fetchPage(url, { retries = 3, timeout = 15000 } = {}) {
  const domain = new URL(url).hostname;
  await waitForDomain(domain);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        headers: {
          "User-Agent": randomUA(),
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-ZA,en;q=0.9",
          "Accept-Encoding": "gzip, deflate",
        },
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      const html = await res.text();
      return html;
    } catch (err) {
      console.error(`  [attempt ${attempt}/${retries}] ${url}: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt)); // exponential backoff
    }
  }
}

/**
 * Parse ZAR price string → number
 * Handles: "R 4,599.00", "R4599", "4 599", "R 4 599.00", etc.
 */
export function parseZAR(str) {
  if (!str) return null;
  const cleaned = str.replace(/[Rr\s,]/g, "").replace(/\u00a0/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : Math.round(num);
}

/**
 * Normalize product name for matching
 */
export function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Simple keyword matching score
 */
export function matchScore(productName, searchTerms) {
  const name = normalize(productName);
  const terms = searchTerms.toLowerCase().split(/\s+/);
  return terms.reduce((score, term) => score + (name.includes(term) ? 1 : 0), 0);
}
