# PC Builder ZA 🇿🇦

A South African PC parts picker with a chalkboard/whiteboard aesthetic, real-time compatibility filtering, search-first UX, and links to local retailers.

![Chalkboard Mode](https://img.shields.io/badge/theme-chalkboard-2a3a2a) ![Whiteboard Mode](https://img.shields.io/badge/theme-whiteboard-f3f1ec)

## Features

- **Search-first UX** — Prominent search bar as the hero element. Type any part name, spec, platform, or keyword. Keyboard navigation with `↑↓ Enter`, `/` to focus, `Esc` to close.
- **Compatibility filtering** — Incompatible parts are automatically hidden (not just dimmed). Pick a CPU and only matching motherboards, RAM types, and PSU wattages appear.
- **ZAR pricing** — All prices in South African Rand, inclusive of 15% VAT.
- **Local retailer links** — Every selected part links to search pages on Evetech, Wootware, Dreamware, and Titan Ice.
- **Dual theme** — Chalkboard (dark green with chalk textures) and Whiteboard (light with grid lines). Toggle anytime.
- **60+ components** — CPUs (AM4 Ryzen 5000, AM5 Ryzen 7000, Intel 12th/13th/14th Gen), GPUs, Motherboards, RAM (DDR4 & DDR5), Storage, PSUs, Cases, Coolers.
- **Preset builds** — Budget AM4 (~R14k), Sweet Spot (~R25k), Intel Mid (~R28k), Ultra (~R80k+).
- **Collapsible categories** — Parts collapsed by default; discovery via search. Auto-expands when you select a part.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **React 18** + **Vite 5**
- Zero external UI dependencies — all styling is inline
- Google Fonts: Caveat, Patrick Hand, Indie Flower
- No build-time CSS — works out of the box

## Project Structure

```
pc-builder-za/
├── index.html          # Entry HTML
├── package.json        # Dependencies & scripts
├── vite.config.js      # Vite configuration
├── src/
│   ├── main.jsx        # React entry point + global styles
│   └── App.jsx         # Full app (single component)
└── README.md
```

## Retailers

| Retailer | URL |
|----------|-----|
| Evetech | [evetech.co.za](https://www.evetech.co.za) |
| Wootware | [wootware.co.za](https://www.wootware.co.za) |
| Dreamware | [dreamwaretech.co.za](https://dreamwaretech.co.za) |
| Titan Ice | [titanice.co.za](https://www.titanice.co.za) |

## Compatibility Rules

The app filters out incompatible parts based on your current selections:

- **CPU ↔ Motherboard**: Socket match (AM4, AM5, LGA1700)
- **Motherboard ↔ RAM**: DDR type match (DDR4 vs DDR5)
- **AM4 + DDR5**: Blocked (AM4 only supports DDR4)
- **GPU + CPU → PSU**: Estimates total wattage and hides underpowered PSUs

## Extending

### Adding parts
Add entries to the `PARTS` array in `src/App.jsx`. Each pick needs:
```js
{ id: "unique-id", name: "Display Name", price: 3999, note: "short desc", tags: "search keywords" }
```
Category-specific fields: `socket`, `plat`, `tdp` (CPU), `watt` (GPU/PSU), `ram` (Motherboard), `type` (RAM).

### Adding retailers
Add to the `RETAILERS` object:
```js
newshop: { name: "Shop Name", url: "https://...", color: "#hex", search: "https://...?q=" }
```

## License

MIT

---

*Made for Mzansi 🇿🇦 — prices are estimates, always confirm at the retailer.*
