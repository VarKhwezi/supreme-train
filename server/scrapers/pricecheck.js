import * as cheerio from "cheerio";
import { fetchPage, parseZAR } from "./base.js";

const SEARCH_URL = "https://www.pricecheck.co.za/search?search=";

/**
 * Scrape PriceCheck.co.za — SA's main price comparison engine
 * Returns aggregated results from multiple retailers
 */
export async function scrapePriceCheck(query) {
  const url = SEARCH_URL + encodeURIComponent(query);
  console.log(`  [pricecheck] Searching: ${query}`);

  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    const results = [];

    // PriceCheck product cards
    const selectors = [
      ".product-item",
      ".product-listing",
      '[class*="product-item"]',
      ".product",
      "article",
    ];

    let items = $();
    for (const sel of selectors) {
      items = $(sel);
      if (items.length > 0) break;
    }

    if (items.length === 0) {
      // Fallback: extract from structured text
      const priceRegex = /R\s?[\d,\s]+\.?\d{0,2}/g;
      const links = $('a[href*="/offers/"]');
      const seen = new Set();

      links.each((_, el) => {
        const $el = $(el);
        const name = $el.text().trim() || $el.attr("title") || "";
        const href = $el.attr("href") || "";
        if (!name || name.length < 5 || name.length > 200 || seen.has(name)) return;
        seen.add(name);

        const parent = $el.closest("div, li, td, article, section");
        const parentText = parent.text();
        const priceMatches = parentText.match(priceRegex);

        let price = null;
        if (priceMatches) {
          for (const pm of priceMatches) {
            const parsed = parseZAR(pm);
            if (parsed && parsed > 50 && parsed < 200000) { price = parsed; break; }
          }
        }

        // Try to extract shop name
        const shopText = parent.find('[class*="shop"], [class*="merchant"], [class*="store"]').first().text().trim();

        if (price) {
          results.push({
            name: name.replace(/\s+/g, " ").trim(),
            price,
            url: href.startsWith("http") ? href : `https://www.pricecheck.co.za${href}`,
            inStock: true,
            retailer: shopText || "pricecheck",
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    } else {
      items.each((_, el) => {
        const $el = $(el);
        const name =
          $el.find("h2, h3, h4, .product-name, .product-title, a").first().text().trim();
        const href = $el.find("a").first().attr("href") || "";
        const priceText = $el.find('[class*="price"], .price').first().text() || "";
        const price = parseZAR(priceText);
        const shop = $el.find('[class*="shop"], [class*="merchant"]').first().text().trim();

        if (name && price && price > 50) {
          results.push({
            name: name.replace(/\s+/g, " ").trim(),
            price,
            url: href.startsWith("http") ? href : `https://www.pricecheck.co.za${href}`,
            inStock: true,
            retailer: shop || "pricecheck",
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    }

    console.log(`  [pricecheck] Found ${results.length} results for "${query}"`);
    return results;
  } catch (err) {
    console.error(`  [pricecheck] Error scraping "${query}": ${err.message}`);
    return [];
  }
}
