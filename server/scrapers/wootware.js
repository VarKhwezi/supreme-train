import * as cheerio from "cheerio";
import { fetchPage, parseZAR } from "./base.js";

const SEARCH_URL = "https://www.wootware.co.za/catalogsearch/result/?q=";

/**
 * Scrape Wootware search results
 * Wootware uses Magento — product listings typically in .product-item containers
 */
export async function scrapeWootware(query) {
  const url = SEARCH_URL + encodeURIComponent(query);
  console.log(`  [wootware] Searching: ${query}`);

  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    const results = [];

    // Wootware Magento selectors
    const selectors = [
      ".product-item",
      ".product-item-info",
      ".item.product.product-item",
      "li.product-item",
      "ol.products li",
    ];

    let items = $();
    for (const sel of selectors) {
      items = $(sel);
      if (items.length > 0) break;
    }

    if (items.length === 0) {
      // Fallback: regex-based extraction
      const priceRegex = /R\s?[\d,\s]+\.?\d{0,2}/g;
      const productLinks = $('a[href*="wootware.co.za/"]').filter((_, el) => {
        const href = $(el).attr("href") || "";
        return href.includes(".html") && !href.includes("/catalogsearch/");
      });

      const seen = new Set();
      productLinks.each((_, el) => {
        const $el = $(el);
        const name = $el.text().trim() || $el.attr("title") || "";
        const href = $el.attr("href") || "";
        if (!name || name.length < 5 || name.length > 200 || seen.has(href)) return;
        seen.add(href);

        const parent = $el.closest("div, li, td, article");
        const parentText = parent.text();
        const priceMatches = parentText.match(priceRegex);

        let price = null;
        if (priceMatches) {
          for (const pm of priceMatches) {
            const parsed = parseZAR(pm);
            if (parsed && parsed > 100 && parsed < 200000) { price = parsed; break; }
          }
        }

        if (price) {
          results.push({
            name: name.replace(/\s+/g, " ").trim(),
            price,
            url: href,
            inStock: !parentText.toLowerCase().includes("out of stock"),
            retailer: "wootware",
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    } else {
      items.each((_, el) => {
        const $el = $(el);
        const name =
          $el.find(".product-item-link, .product-name a, .product-item-name a").first().text().trim() ||
          $el.find("a").first().attr("title") ||
          $el.find("a").first().text().trim();
        const href =
          $el.find("a").first().attr("href") || "";
        const priceText =
          $el.find(".price, .special-price .price, .price-box .price").first().text() || "";

        const price = parseZAR(priceText);
        const stockEl = $el.find('[class*="stock"], [class*="availability"]').text().toLowerCase();

        if (name && price && price > 100) {
          results.push({
            name: name.replace(/\s+/g, " ").trim(),
            price,
            url: href,
            inStock: !stockEl.includes("out of stock"),
            retailer: "wootware",
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    }

    console.log(`  [wootware] Found ${results.length} results for "${query}"`);
    return results;
  } catch (err) {
    console.error(`  [wootware] Error scraping "${query}": ${err.message}`);
    return [];
  }
}
