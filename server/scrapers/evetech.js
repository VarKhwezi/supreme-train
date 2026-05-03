import * as cheerio from "cheerio";
import { fetchPage, parseZAR } from "./base.js";

const SEARCH_URL = "https://www.evetech.co.za/search?query=";

/**
 * Scrape Evetech search results for a given query
 * Returns array of { name, price, url, inStock, retailer }
 */
export async function scrapeEvetech(query) {
  const url = SEARCH_URL + encodeURIComponent(query);
  console.log(`  [evetech] Searching: ${query}`);

  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    const results = [];

    // Evetech search results are typically in product listing divs
    // They use various class patterns — we try multiple selectors
    const selectors = [
      ".product-item",
      ".productItem",
      ".product-box",
      '[class*="product"]',
      ".listing-item",
    ];

    let items = $();
    for (const sel of selectors) {
      items = $(sel);
      if (items.length > 0) break;
    }

    // If structured selectors fail, try parsing the raw HTML for price patterns
    if (items.length === 0) {
      // Fallback: find all links that look like product pages + nearby prices
      const priceRegex = /R\s?[\d,\s]+\.?\d{0,2}/g;
      const productLinks = $('a[href*="/best-deal/"], a[href*="/best-pc-deal/"]');

      productLinks.each((_, el) => {
        const $el = $(el);
        const name = $el.text().trim();
        const href = $el.attr("href");
        if (!name || name.length < 5 || name.length > 200) return;

        // Look for price near this element
        const parent = $el.closest("div, td, li, article");
        const parentText = parent.text();
        const priceMatches = parentText.match(priceRegex);

        let price = null;
        if (priceMatches) {
          // Take the first reasonable price
          for (const pm of priceMatches) {
            const parsed = parseZAR(pm);
            if (parsed && parsed > 100 && parsed < 200000) {
              price = parsed;
              break;
            }
          }
        }

        if (price) {
          results.push({
            name: name.replace(/\s+/g, " ").trim(),
            price,
            url: href.startsWith("http") ? href : `https://www.evetech.co.za${href}`,
            inStock: !parentText.toLowerCase().includes("out of stock"),
            retailer: "evetech",
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    } else {
      items.each((_, el) => {
        const $el = $(el);
        const name =
          $el.find('[class*="name"], [class*="title"], h2, h3, h4').first().text().trim() ||
          $el.find("a").first().text().trim();
        const href =
          $el.find("a").first().attr("href") || "";
        const priceText =
          $el.find('[class*="price"], [class*="Price"]').first().text() ||
          $el.text().match(/R\s?[\d,\s]+\.?\d{0,2}/)?.[0] || "";

        const price = parseZAR(priceText);

        if (name && price && price > 100) {
          results.push({
            name: name.replace(/\s+/g, " ").trim(),
            price,
            url: href.startsWith("http") ? href : `https://www.evetech.co.za${href}`,
            inStock: !$el.text().toLowerCase().includes("out of stock"),
            retailer: "evetech",
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    }

    console.log(`  [evetech] Found ${results.length} results for "${query}"`);
    return results;
  } catch (err) {
    console.error(`  [evetech] Error scraping "${query}": ${err.message}`);
    return [];
  }
}
