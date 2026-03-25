# 🇿🇦 PC Builder ZA

A South African PC part picker with instant search, compatibility checking, and links to local retailers (Evetech, Wootware, Dreamware, Titan Ice). All prices in ZAR including VAT.

Supports AM4, AM5, Intel 12th/13th/14th Gen, DDR4/DDR5, and 60+ components.

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/pc-builder-za.git
cd pc-builder-za

# 2. Install
npm install

# 3. Run dev server (opens http://localhost:3000)
npm run dev
```

That's it. Open `http://localhost:3000` and start building.

---

## Scripts

| Command                | What it does                          |
|------------------------|---------------------------------------|
| `npm run dev`          | Start dev server with hot reload      |
| `npm run build`        | Production build → `dist/`            |
| `npm run preview`      | Preview production build locally      |
| `npm test`             | Run tests once                        |
| `npm run test:watch`   | Run tests in watch mode               |
| `npm run test:coverage`| Run tests with coverage report        |
| `npm run lint`         | Lint with ESLint                      |

---

## Project Structure

```
pc-builder-za/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── public/                     # Static assets
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Main PC Builder component
│   └── test/
│       ├── setup.js            # Test setup
│       └── app.test.js         # Unit tests
├── .eslintrc.json              # ESLint config
├── .gitignore
├── Dockerfile                  # Docker build (nginx)
├── nginx.conf                  # Nginx SPA config
├── netlify.toml                # Netlify deploy config
├── vite.config.js              # Vite config
├── package.json
└── README.md
```

---

## CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

Triggers on every push to `main`/`develop` and on pull requests to `main`.

**Pipeline stages:**

```
Push / PR
  │
  ├─ ① Test ──────── npm ci → npm test → coverage report
  │
  ├─ ② Build ─────── npm ci → npm run build → upload artifact
  │
  └─ ③ Deploy ────── GitHub Pages (main branch only)
```

### Setup GitHub Pages deployment:

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/pc-builder-za.git
   git push -u origin main
   ```

2. Go to **Settings → Pages → Source** → set to **GitHub Actions**

3. Every push to `main` will auto-deploy to:
   `https://YOUR_USERNAME.github.io/pc-builder-za/`

   > If using a subpath, add `base: '/pc-builder-za/'` to `vite.config.js`

---

## Alternative Deployment Options

### Netlify (one-click)

1. Connect your GitHub repo at [netlify.com](https://netlify.com)
2. Config is already in `netlify.toml` — auto-detected
3. Every push deploys automatically

### Vercel

```bash
npm i -g vercel
vercel
```

Vercel auto-detects Vite. Zero config needed.

### Docker

```bash
# Build
docker build -t pc-builder-za .

# Run on port 8080
docker run -p 8080:80 pc-builder-za

# Open http://localhost:8080
```

### VPS / Manual Deploy

```bash
npm run build
# Upload the `dist/` folder to any static host
# (Apache, Nginx, Caddy, S3, etc.)
```

---

## Adding/Editing Parts

All parts live in the `PARTS` array in `src/App.jsx`. Each category has this shape:

```js
{
  id: "cpu",              // category key
  label: "Processor",     // display name
  doodle: "⚙",           // icon
  picks: [
    {
      id: "r5-5600x",                    // unique ID
      name: "AMD Ryzen 5 5600X",         // display name (also used for retailer search)
      price: 2999,                       // ZAR incl VAT
      note: "6C/12T · 3.7GHz · legend",  // short description
      socket: "AM4",                     // for compatibility checks
      plat: "AM4",                       // platform badge
      tags: "amd ryzen gaming popular",  // search keywords
    },
  ],
}
```

The search engine indexes `name`, `note`, `tags`, `socket`, `plat`, `type`, and the category `label` — so make tags descriptive.

---

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Dev server & bundler
- **Vitest** — Unit testing
- **ESLint** — Linting
- **GitHub Actions** — CI/CD
- **Nginx** — Production Docker image

---

## License

MIT — do whatever you want with it.
