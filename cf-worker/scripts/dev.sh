#!/bin/bash
# Local development server for LLM-FW

echo "🚀 Starting LLM-FW Development Server"
echo "====================================="

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

echo ""
echo "Starting Wrangler dev server..."
echo "API will be available at: http://localhost:8787"
echo ""
echo "Test endpoints:"
echo "  curl http://localhost:8787/health"
echo ""

wrangler dev --local
