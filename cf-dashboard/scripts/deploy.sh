#!/bin/bash
# Deploy script for LLM-FW Dashboard (Cloudflare Pages)

set -e

echo "🚀 Deploying LLM-FW Dashboard"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "wrangler.toml" ]; then
    echo "❌ Error: wrangler.toml not found. Are you in the cf-dashboard directory?"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build
echo "🔨 Building dashboard..."
npm run build

# Deploy to Pages
echo "📤 Deploying to Cloudflare Pages..."
wrangler pages deploy dist

echo ""
echo "✅ Dashboard deployed!"
echo ""
echo "Your dashboard should be available shortly at your Pages URL"
echo ""
