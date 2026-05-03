# Quick Start on Fresh Linux Mint

## One-liner Setup (automatic)

```bash
cd pc-builder-za
chmod +x setup.sh
./setup.sh
```

This will:
1. Update apt packages
2. Install Node.js LTS (via NodeSource)
3. Install npm
4. Install all project dependencies
5. Tell you how to start the dev server

---

## Manual Setup (step-by-step)

### 1. Update package manager
```bash
sudo apt update
```

### 2. Install Node.js LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Verify installation
```bash
node --version    # Should show v20.x or higher
npm --version     # Should show 10.x or higher
```

### 4. Install project dependencies
```bash
cd pc-builder-za
npm install
```

### 5. Start dev server
```bash
npm run dev
```

Your browser will open to `http://localhost:3000`

---

## Troubleshooting

**Issue: `node: command not found`**
- Restart your terminal or run `source ~/.bashrc`

**Issue: `npm ERR! ERR! 404`**
- Your internet connection may be down. Check and try again.

**Issue: `EACCES: permission denied`**
- Make sure you ran `sudo apt install -y nodejs` (with sudo)

**Issue: Port 3000 is already in use**
- Edit `vite.config.js` and change the port to 3001 or another unused port:
  ```js
  server: {
    port: 3001,
    open: true,
  }
  ```

---

## Next Steps

Once dev server is running at `localhost:3000`:

- **Build for production**: `npm run build` (creates `dist/` folder)
- **Deploy to Netlify**: See [Vite + Netlify guide](https://docs.netlify.com/integrations/frameworks/vite/)
- **Modify parts**: Edit the `PARTS` array in `src/App.jsx`
- **Add retailers**: Edit the `RETAILERS` object in `src/App.jsx`

---

## System Requirements

- Linux Mint 20+ (or Ubuntu 18+)
- 2GB RAM (1GB for dev, 1GB for Node/npm)
- ~500MB disk space
- Internet connection (for npm install)

---

For more details, see `README.md`
