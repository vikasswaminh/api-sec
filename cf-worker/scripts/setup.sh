#!/bin/bash
# Setup script for Cloudflare LLM-FW deployment
# Usage: ./scripts/setup.sh

set -e

echo "🚀 Setting up Cloudflare LLM-FW Infrastructure"
echo "================================================"

# Check prerequisites
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Install with: npm install -g wrangler"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo ""
echo "Step 1: Installing dependencies..."
npm install

echo ""
echo "Step 2: Authenticating with Cloudflare..."
wrangler whoami || wrangler login

echo ""
echo "Step 3: Creating D1 Database..."
echo "-----------------------------------"
read -p "Enter database name [llm-fw-db]: " DB_NAME
DB_NAME=${DB_NAME:-llm-fw-db}

wrangler d1 create "$DB_NAME" || echo "Database may already exist, continuing..."

echo ""
echo "⚠️  IMPORTANT: Copy the database_id from above and paste it into wrangler.toml"
echo "   Under: [[d1_databases]] -> database_id"
read -p "Press Enter after updating wrangler.toml..."

echo ""
echo "Step 4: Running database migrations..."
wrangler d1 migrations apply "$DB_NAME"

echo ""
echo "Step 5: Creating KV Namespaces..."
echo "-----------------------------------"

echo "Creating CACHE namespace..."
wrangler kv:namespace create CACHE || echo "CACHE namespace may already exist"

echo "Creating SIGNATURES namespace..."
wrangler kv:namespace create SIGNATURES || echo "SIGNATURES namespace may already exist"

echo "Creating RATE_LIMIT namespace..."
wrangler kv:namespace create RATE_LIMIT || echo "RATE_LIMIT namespace may already exist"

echo ""
echo "⚠️  IMPORTANT: Copy the KV IDs from above and paste them into wrangler.toml"
echo "   Under: [[kv_namespaces]] -> id"
read -p "Press Enter after updating wrangler.toml..."

echo ""
echo "Step 6: Creating R2 Buckets..."
echo "-----------------------------------"
wrangler r2 bucket create llm-fw-logs || echo "Bucket may already exist"
wrangler r2 bucket create llm-fw-models || echo "Bucket may already exist"

echo ""
echo "Step 7: Creating Queues..."
echo "-----------------------------------"
wrangler queues create llm-fw-log-queue || echo "Queue may already exist"
wrangler queues create llm-fw-analytics-queue || echo "Queue may already exist"

echo ""
echo "Step 8: Seeding attack signatures to KV..."
node scripts/seed-signatures.js

echo ""
echo "Step 9: Building and deploying..."
npm run build
wrangler deploy

echo ""
echo "================================================"
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Update ML_BACKEND_URL in wrangler.toml with your DO droplet IP"
echo "2. Deploy the dashboard: cd ../cf-dashboard && npm run deploy"
echo "3. Test the API: curl https://your-worker.your-subdomain.workers.dev/health"
echo ""
echo "Your API Key: sk-admin-test-key-change-in-prod"
echo "(Change this in production!)"
echo ""
