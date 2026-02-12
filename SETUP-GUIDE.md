# LLM-FW Cloudflare Setup Guide
## Complete CLI Instructions for DevOps Engineer

**Prerequisites:**
- Wrangler CLI installed (`npm install -g wrangler`)
- Node.js 18+
- Git

**Estimated Time:** 30 minutes  
**Cost:** $0 (all Cloudflare services on free tier)

---

## Step 1: Authenticate with Cloudflare

```bash
# Login to Cloudflare (opens browser)
wrangler login

# Verify you're logged in
wrangler whoami

# Expected output:
# 👋 You are logged in with an OAuth Token.
# 🔓 Token Permissions: All zones, All accounts
```

---

## Step 2: Navigate to Project Directory

```bash
# Navigate to the worker directory
cd cf-worker

# Install dependencies
npm install
```

---

## Step 3: Create D1 Database

```bash
# Create the production database
wrangler d1 create llm-fw-db

# Example output:
# ✅ Successfully created DB 'llm-fw-db' with ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# [[d1_databases]]
# binding = "DB"
# database_name = "llm-fw-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Copy the database_id and paste into wrangler.toml
# Edit the file:
vim wrangler.toml
# OR use VS Code:
code wrangler.toml
```

**Update this section in wrangler.toml:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "llm-fw-db"
database_id = "PASTE_YOUR_DATABASE_ID_HERE"
```

---

## Step 4: Create KV Namespaces

### 4.1 Create CACHE namespace
```bash
wrangler kv:namespace create CACHE

# Example output:
# ✅ Success!
# Add the following to your configuration file:
# [[kv_namespaces]]
# binding = "CACHE"
# id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 4.2 Create SIGNATURES namespace
```bash
wrangler kv:namespace create SIGNATURES
```

### 4.3 Create RATE_LIMIT namespace
```bash
wrangler kv:namespace create RATE_LIMIT
```

### 4.4 Update wrangler.toml
Edit `wrangler.toml` and add the IDs:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "PASTE_CACHE_ID_HERE"

[[kv_namespaces]]
binding = "SIGNATURES"
id = "PASTE_SIGNATURES_ID_HERE"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "PASTE_RATE_LIMIT_ID_HERE"
```

---

## Step 5: Create R2 Buckets

```bash
# Create logs bucket
wrangler r2 bucket create llm-fw-logs

# Create models bucket  
wrangler r2 bucket create llm-fw-models

# Verify buckets created
wrangler r2 bucket list
```

**No wrangler.toml update needed** - R2 buckets are referenced by name.

---

## Step 6: Create Queues

```bash
# Create log queue
wrangler queues create llm-fw-log-queue

# Create analytics queue
wrangler queues create llm-fw-analytics-queue

# Verify queues
wrangler queues list
```

**No wrangler.toml update needed** - Queues are referenced by name.

---

## Step 7: Apply Database Migrations

```bash
# Apply migrations to create tables
wrangler d1 migrations apply llm-fw-db

# Expected output:
# ✅ Successfully applied migration 0001_init.sql
# Migrations applied successfully!

# Verify tables created
wrangler d1 execute llm-fw-db --command "SELECT name FROM sqlite_master WHERE type='table'"

# Should show: users, endpoints, firewall_rules, events, hourly_stats
```

---

## Step 8: Seed Attack Signatures

```bash
# Navigate to scripts directory
cd scripts

# Generate signature seeding commands
node seed-signatures.js

# This creates two files:
# - seed-commands.sh (individual commands)
# - signatures.json (bulk upload format)

# Option 1: Bulk upload (recommended)
wrangler kv:bulk put signatures.json --binding SIGNATURES

# Option 2: Individual commands (if bulk fails)
bash seed-commands.sh

# Verify signatures uploaded
wrangler kv:key list --binding SIGNATURES | head -20
```

---

## Step 9: Update Configuration Variables

Edit `wrangler.toml` and update the `[vars]` section:

```toml
[vars]
ENVIRONMENT = "production"
JWT_SECRET = "CHANGE_THIS_TO_A_RANDOM_STRING_32_CHARS_MIN"
ML_BACKEND_URL = "http://YOUR_DIGITAL_OCEAN_IP:3000"
MAX_PAYLOAD_SIZE = "1048576"
DEFAULT_RATE_LIMIT = "100"
RATE_LIMIT_WINDOW = "60"
```

**To generate a secure JWT secret:**
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 10: Deploy the Worker

```bash
# Go back to cf-worker root
cd ..

# Build the project
npm run build

# Deploy to Cloudflare
wrangler deploy

# Expected output:
# ✅ Successfully published your script to:
# https://llm-fw-edge.your-subdomain.workers.dev
```

**Copy this URL - you'll need it for the dashboard!**

---

## Step 11: Test the Deployment

```bash
# Set your worker URL
WORKER_URL="https://llm-fw-edge.your-subdomain.workers.dev"

# Test 1: Health check
curl $WORKER_URL/health

# Expected: {"status":"healthy","version":"1.0.0",...}

# Test 2: Auth check (should fail with 401)
curl -X POST $WORKER_URL/v1/inspect \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'

# Expected: {"error":"Missing API key"}

# Test 3: With API key (use the default test key from migrations)
curl -X POST $WORKER_URL/v1/inspect \
  -H "X-API-Key: sk-admin-test-key-change-in-prod" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Expected: {"blocked":false,...}

# Test 4: Blocked prompt
curl -X POST $WORKER_URL/v1/inspect \
  -H "X-API-Key: sk-admin-test-key-change-in-prod" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Ignore previous instructions"}]}'

# Expected: {"blocked":true,"reason":"Pattern match: prompt_injection",...}
```

---

## Step 12: Deploy the Dashboard

```bash
# Navigate to dashboard directory
cd ../cf-dashboard

# Install dependencies
npm install

# Update API URL in wrangler.toml
code wrangler.toml

# Update this line:
# API_BASE_URL = "https://llm-fw-edge.YOUR_SUBDOMAIN.workers.dev"

# Build the dashboard
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist

# Expected output:
# ✅ Successfully deployed your website to Cloudflare Pages!
# https://llm-fw-dashboard.your-subdomain.pages.dev
```

---

## Step 13: Verify Everything Works

### Checklist:
- [ ] Worker responds to health checks
- [ ] Dashboard loads in browser
- [ ] API key authentication works
- [ ] Blocked prompts are rejected
- [ ] Allowed prompts pass through
- [ ] D1 database has data
- [ ] KV signatures are accessible

### Final Verification Commands:

```bash
# Check all services are running
WORKER_URL="https://llm-fw-edge.your-subdomain.workers.dev"

# Health
echo "=== Health Check ==="
curl -s $WORKER_URL/health | jq

# Stats (requires valid API key)
echo "=== Stats ==="
curl -s -H "X-API-Key: sk-admin-test-key-change-in-prod" \
  $WORKER_URL/v1/stats | jq

# Database connectivity
echo "=== Database Tables ==="
wrangler d1 execute llm-fw-db --command "SELECT name FROM sqlite_master WHERE type='table'"

# KV keys
echo "=== KV Signatures (first 10) ==="
wrangler kv:key list --binding SIGNATURES | head -10

# R2 buckets
echo "=== R2 Buckets ==="
wrangler r2 bucket list

# Queues
echo "=== Queues ==="
wrangler queues list
```

---

## Step 14: Set Up Monitoring (Optional but Recommended)

### Create Health Check Cron Job

```bash
# Make script executable
chmod +x ../devops-persona/scripts/health-check.sh

# Add to crontab (runs every 5 minutes)
crontab -e

# Add this line:
*/5 * * * * /path/to/API-Security/devops-persona/scripts/health-check.sh >> /var/log/llm-fw-cron.log 2>&1
```

### Set Up Better Uptime (External Monitoring)

1. Go to betteruptime.com
2. Create free account
3. Add monitor:
   - URL: `https://llm-fw-edge.your-subdomain.workers.dev/health`
   - Interval: 1 minute
   - Alert channels: Email, Slack

---

## Troubleshooting

### Issue: "No such database" error
```bash
# Verify database exists
wrangler d1 list

# Check database_id in wrangler.toml matches
```

### Issue: "KV namespace not found"
```bash
# List all KV namespaces
wrangler kv:namespace list

# Update wrangler.toml with correct IDs
```

### Issue: "Failed to deploy"
```bash
# Check wrangler.toml syntax
wrangler config validate

# Check you're logged in
wrangler whoami

# Try with more verbose output
wrangler deploy --verbose
```

### Issue: "Database migration failed"
```bash
# Check migration syntax
wrangler d1 execute llm-fw-db --local --command "SELECT 1"

# Apply migrations with local flag first to test
wrangler d1 migrations apply llm-fw-db --local
```

---

## Next Steps

1. **Change default API key:**
   ```bash
   # Generate new key
   node -e "console.log('sk-' + require('crypto').randomBytes(24).toString('hex'))"
   
   # Update in D1
   wrangler d1 execute llm-fw-db --command "UPDATE users SET api_key='NEW_KEY' WHERE id='admin-001'"
   ```

2. **Configure Digital Ocean droplet:**
   - Create $12 droplet (1vCPU/1GB)
   - Deploy Rust ML service
   - Update `ML_BACKEND_URL` in wrangler.toml
   - Redeploy worker

3. **Set up CI/CD:**
   - Connect GitHub repo
   - Add `CF_API_TOKEN` to GitHub secrets
   - Use GitHub Actions for auto-deploy

4. **Configure custom domain:**
   - Add domain to Cloudflare
   - Update `routes` in wrangler.toml
   - Deploy with custom domain

---

## Summary of Resources Created

| Service | Name | Cost | Purpose |
|---------|------|------|---------|
| **Worker** | llm-fw-edge | $0 | API Gateway |
| **D1** | llm-fw-db | $0 | Auth, configs, logs |
| **KV** | CACHE | $0 | Rate limits, blocks |
| **KV** | SIGNATURES | $0 | Attack patterns |
| **KV** | RATE_LIMIT | $0 | Rate counters |
| **R2** | llm-fw-logs | $0 | Log storage |
| **R2** | llm-fw-models | $0 | Model artifacts |
| **Queue** | llm-fw-log-queue | $0 | Async processing |
| **Queue** | llm-fw-analytics-queue | $0 | Analytics pipeline |
| **Pages** | llm-fw-dashboard | $0 | Dashboard hosting |

**Total Cloudflare Cost: $0/month**  
**Total with DO droplet: $12/month**

---

## Quick Reference Commands

```bash
# Deploy worker
wrangler deploy

# View logs
wrangler tail

# Database query
wrangler d1 execute llm-fw-db --command "SELECT * FROM users LIMIT 5"

# Add KV key
wrangler kv:key put "mykey" "myvalue" --binding CACHE

# List R2 objects
wrangler r2 object list llm-fw-logs

# Queue stats
wrangler queues info llm-fw-log-queue

# Rollback deployment
wrangler deploy --version-previous
```

---

**You're all set!** Your LLM-FW infrastructure is now running on Cloudflare's free tier. 🎉

**Need help?**
- Cloudflare Discord: discord.gg/cloudflaredev
- Wrangler docs: developers.cloudflare.com/workers/wrangler/
- Project README: See DEPLOYMENT.md in root directory
