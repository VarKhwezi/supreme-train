#!/bin/bash

# PC Builder ZA — Fresh Linux Mint Setup Script
# This script installs Node.js, npm, and all project dependencies

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PC Builder ZA — Linux Mint Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if running on Linux Mint
if ! grep -q "Linux Mint" /etc/os-release 2>/dev/null; then
    echo "⚠️  This script is designed for Linux Mint."
    echo "Continuing anyway... (should work on Ubuntu/Debian too)"
    echo ""
fi

# Update package manager
echo "1️⃣  Updating package manager..."
sudo apt update -y
echo "✓ Package manager updated"
echo ""

# Install Node.js (LTS version via NodeSource)
echo "2️⃣  Installing Node.js (LTS)..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt install -y nodejs
    echo "✓ Node.js installed"
else
    echo "✓ Node.js already installed: $(node --version)"
fi
echo ""

# Verify npm
echo "3️⃣  Checking npm..."
npm --version
echo "✓ npm ready: $(npm --version)"
echo ""

# Navigate to project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "4️⃣  Setting up project in: $SCRIPT_DIR"
cd "$SCRIPT_DIR"
echo ""

# Install project dependencies
echo "5️⃣  Installing project dependencies..."
echo "    (this may take a minute...)"
npm install
echo "✓ Dependencies installed"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo ""
echo "  Start dev server:"
echo "    npm run dev"
echo ""
echo "  Build for production:"
echo "    npm run build"
echo ""
echo "  Preview production build:"
echo "    npm run preview"
echo ""
echo "The dev server will open at http://localhost:3000"
echo ""
