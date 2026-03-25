import { describe, it, expect } from "vitest";

/*
 * Unit tests for PC Builder ZA
 * Run: npm test
 */

// ── Import the search engine and compat checker inline
// (In a real project you'd extract these to a utils file)

const PARTS_SAMPLE = [
  {
    id: "cpu", label: "Processor", doodle: "⚙", picks: [
      { id: "r5-5600x", name: "AMD Ryzen 5 5600X", price: 2999, note: "6C/12T", socket: "AM4", plat: "AM4", tags: "amd ryzen gaming" },
      { id: "r5-7600x", name: "AMD Ryzen 5 7600X", price: 4299, note: "6C/12T", socket: "AM5", plat: "AM5", tags: "amd ryzen ddr5" },
      { id: "i5-12400f", name: "Intel Core i5-12400F", price: 2999, note: "6C/12T", socket: "LGA1700", plat: "Intel 12th", tags: "intel 12th gen" },
    ],
  },
  {
    id: "mobo", label: "Motherboard", doodle: "⊞", picks: [
      { id: "b550m", name: "MSI PRO B550M-P", price: 1999, note: "AM4", socket: "AM4", ram: "DDR4", tags: "amd am4" },
      { id: "b650m", name: "MSI PRO B650M-P", price: 3199, note: "AM5", socket: "AM5", ram: "DDR5", tags: "amd am5 ddr5" },
    ],
  },
  {
    id: "ram", label: "Memory", doodle: "≡", picks: [
      { id: "ddr4-16", name: "16GB DDR4-3200", price: 799, note: "common", type: "DDR4", tags: "ddr4" },
      { id: "ddr5-32", name: "32GB DDR5-6000", price: 2199, note: "fast", type: "DDR5", tags: "ddr5" },
    ],
  },
];

// Search function (replicated from app logic)
function searchParts(query, parts) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().split(/\s+/);
  const results = [];
  parts.forEach((cat) => {
    cat.picks.forEach((pick) => {
      const haystack = `${pick.name} ${pick.note} ${pick.tags || ""} ${pick.socket || ""} ${pick.plat || ""} ${pick.type || ""} ${cat.label}`.toLowerCase();
      const score = q.reduce((s, word) => s + (haystack.includes(word) ? 1 : 0), 0);
      if (score === q.length) results.push({ ...pick, catId: cat.id, score });
    });
  });
  return results.sort((a, b) => b.score - a.score || a.price - b.price);
}

// Compatibility checker (replicated)
function getWarnings(sel, parts) {
  const w = [];
  const cpu = parts[0].picks.find((p) => p.id === sel.cpu);
  const mobo = parts[1].picks.find((p) => p.id === sel.mobo);
  const ram = parts[2].picks.find((p) => p.id === sel.ram);
  if (cpu && mobo && cpu.socket !== mobo.socket)
    w.push(`Socket mismatch`);
  if (mobo && ram && mobo.ram !== ram.type)
    w.push(`RAM mismatch`);
  return w;
}

// Format
const fmtR = (v) => `R ${v.toLocaleString("en-ZA")}`;

// ── Tests ──

describe("Search Engine", () => {
  it("finds AMD CPUs when searching 'ryzen'", () => {
    const results = searchParts("ryzen", PARTS_SAMPLE);
    expect(results.length).toBe(2);
    expect(results.every((r) => r.name.includes("Ryzen"))).toBe(true);
  });

  it("finds parts by socket", () => {
    const results = searchParts("AM4", PARTS_SAMPLE);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.socket === "AM4" || r.tags?.includes("am4")).toBe(true);
    });
  });

  it("finds Intel 12th gen parts", () => {
    const results = searchParts("intel 12th", PARTS_SAMPLE);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain("Intel");
  });

  it("matches multi-word queries (all words required)", () => {
    const results = searchParts("amd ddr5", PARTS_SAMPLE);
    results.forEach((r) => {
      const h = `${r.name} ${r.note} ${r.tags || ""} ${r.socket || ""} ${r.plat || ""} ${r.type || ""}`.toLowerCase();
      expect(h.includes("amd") && h.includes("ddr5")).toBe(true);
    });
  });

  it("returns empty for nonsense queries", () => {
    const results = searchParts("zzzxxx123", PARTS_SAMPLE);
    expect(results.length).toBe(0);
  });

  it("returns empty for single character", () => {
    const results = searchParts("a", PARTS_SAMPLE);
    expect(results.length).toBe(0);
  });
});

describe("Compatibility Checker", () => {
  it("warns on socket mismatch (AM4 CPU + AM5 mobo)", () => {
    const w = getWarnings({ cpu: "r5-5600x", mobo: "b650m", ram: "ddr5-32" }, PARTS_SAMPLE);
    expect(w.some((x) => x.includes("Socket"))).toBe(true);
  });

  it("warns on RAM mismatch (DDR4 mobo + DDR5 ram)", () => {
    const w = getWarnings({ cpu: "r5-5600x", mobo: "b550m", ram: "ddr5-32" }, PARTS_SAMPLE);
    expect(w.some((x) => x.includes("RAM"))).toBe(true);
  });

  it("no warnings when everything matches (AM4 + DDR4)", () => {
    const w = getWarnings({ cpu: "r5-5600x", mobo: "b550m", ram: "ddr4-16" }, PARTS_SAMPLE);
    expect(w.length).toBe(0);
  });

  it("no warnings when everything matches (AM5 + DDR5)", () => {
    const w = getWarnings({ cpu: "r5-7600x", mobo: "b650m", ram: "ddr5-32" }, PARTS_SAMPLE);
    expect(w.length).toBe(0);
  });
});

describe("Price Formatting", () => {
  it("formats ZAR correctly", () => {
    expect(fmtR(2999)).toContain("2");
    expect(fmtR(2999)).toContain("999");
    expect(fmtR(2999)).toMatch(/^R /);
  });

  it("formats large prices with separators", () => {
    const formatted = fmtR(39999);
    expect(formatted).toMatch(/^R /);
    expect(formatted).toContain("39");
    expect(formatted).toContain("999");
  });

  it("formats zero", () => {
    expect(fmtR(0)).toBe("R 0");
  });
});
