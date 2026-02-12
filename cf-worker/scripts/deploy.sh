#!/bin/bash
# Deploy script for LLM-FW Cloudflare Workers

set -e

echo "🚀 Deploying LLM-FW Edge Layer"
echo "==============================="

# Check if we're in the right directory
if [ ! -f "wrangler.toml" ]; then
    echo "❌ Error: wrangler.toml not found. Are you in the cf-worker directory?"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run type check
echo "🔍 Running type check..."
npm run typecheck

# Build
echo "🔨 Building..."
npm run build

# Deploy
echo "📤 Deploying to Cloudflare..."
wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo ""

# Get the worker URL
WORKER_URL=$(wrangler whoami 2>/dev/null | grep -oP 'https://[^\s]+\.workers\.dev' || echo "https://llm-fw-edge.your-subdomain.workers.dev")
echo "Your API URL: $WORKER_URL"
echo ""
echo "Test it:"
echo "  curl $WORKER_URL/health"
echo ""
