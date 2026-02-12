# LLM-FW Cloudflare-First Deployment Guide

Complete guide to deploy LLM-FW with Cloudflare (free tier) + Digital Ocean ($12/month).

## 📁 Project Structure

```
C:\API Security\
├── cf-worker\          # Cloudflare Workers (Edge Layer)
│   ├── src/
│   │   └── index.ts    # Main worker code
│   ├── migrations/     # D1 database migrations
│   ├── scripts/        # Setup & deploy scripts
│   ├── wrangler.toml   # Cloudflare config
│   └── package.json
│
├── cf-dashboard\       # React Dashboard (Cloudflare Pages)
│   ├── src/
│   │   ├── components/
│   │   └── ...
│   ├── wrangler.toml
│   └── package.json
│
└── rust-ml/            # Rust ML Inference (Digital Ocean)
    └── ...
```

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- Wrangler CLI: `npm install -g wrangler`
- Cloudflare account (free)

### Step 1: Setup Cloudflare Infrastructure

```bash
cd cf-worker

# Login to Cloudflare
wrangler login

# Run automated setup
bash scripts/setup.sh
```

This creates:
- ✅ D1 Database (5GB free)
- ✅ 3 KV Namespaces (3GB free)
- ✅ 2 R2 Buckets (10GB free)
- ✅ 2 Queues (1M ops free)

### Step 2: Update Configuration

Edit `wrangler.toml` with the IDs from setup:

```toml
[[d1_databases]]
binding = "DB"
database_name = "llm-fw-db"
database_id = "PASTE_YOUR_ID_HERE"  # <-- From setup output

[[kv_namespaces]]
binding = "CACHE"
id = "PASTE_YOUR_ID_HERE"

[vars]
ML_BACKEND_URL = "http://YOUR_DO_IP:3000"  # <-- Your DO droplet IP
```

### Step 3: Deploy Edge Layer

```bash
bash scripts/deploy.sh
```

Your API is now live at: `https://llm-fw-edge.YOUR_SUBDOMAIN.workers.dev`

### Step 4: Deploy Dashboard

```bash
cd ../cf-dashboard
npm install
bash scripts/deploy.sh
```

Dashboard live at: `https://llm-fw-dashboard.YOUR_SUBDOMAIN.pages.dev`

### Step 5: Setup ML Backend (Optional for MVP)

```bash
# Create $12 DO droplet (1vCPU/1GB)
# SSH in and run:
docker run -d -p 3000:3000 \
  --name llm-ml \
  --restart unless-stopped \
  -v models:/models \
  your-registry/llm-ml:latest
```

## 📊 Architecture Flow

```
User Request
    ↓
Cloudflare Workers (Free)
    ↓
├─→ KV: Check IP blocklist (<1ms)
├─→ Rate limiting check
├─→ Simple pattern match (90% blocked here)
│
└─→ Complex? → Forward to DO ($12)
        ↓
    Rust ML Inference
        ↓
    D1 + R2 + Queues (Free)
```

## 💰 Cost Breakdown

| Component | Service | Cost |
|-----------|---------|------|
| **Edge Computing** | Cloudflare Workers | $0 |
| **Database** | D1 | $0 |
| **Cache** | KV | $0 |
| **Storage** | R2 | $0 |
| **Queue** | Queues | $0 |
| **Dashboard** | Pages | $0 |
| **ML Inference** | DO Droplet | $12 |
| **TOTAL** | | **$12/month** |

## 📈 Scaling Thresholds

When you hit these limits, upgrade:

| Metric | Free Limit | Next Tier | Cost |
|--------|------------|-----------|------|
| Workers requests | 100K/day | 10M/month | +$5 |
| D1 reads | 100K/day | 5M/month | +$5 |
| KV reads | 100K/day | 10M/month | +$0.50 |
| R2 storage | 10GB | 100GB | +$1.50 |
| DO droplet | 1vCPU/1GB | 2vCPU/2GB | +$12 |

## 🔧 Development

### Local Development

```bash
# Terminal 1: Worker
cd cf-worker
npm run dev
# → http://localhost:8787

# Terminal 2: Dashboard
cd cf-dashboard
npm run dev
# → http://localhost:3000
```

### Database Migrations

```bash
cd cf-worker

# Create new migration
wrangler d1 migrations create llm-fw-db "add_new_table"

# Apply migrations
wrangler d1 migrations apply llm-fw-db

# Apply to dev environment
wrangler d1 migrations apply llm-fw-db --env dev
```

### Seed Signatures

```bash
cd cf-worker
node scripts/seed-signatures.js
bash seed-commands.sh
```

## 🔐 Security Checklist

- [ ] Change default admin password in D1
- [ ] Set strong JWT_SECRET in wrangler.toml
- [ ] Enable mTLS between CF and DO
- [ ] Restrict DO firewall to Cloudflare IPs only
- [ ] Enable R2 bucket encryption
- [ ] Rotate API keys monthly

## 🧪 Testing

```bash
# Health check
curl https://your-worker.workers.dev/health

# Test inspection (replace with your key)
curl -X POST https://your-worker.workers.dev/v1/inspect \
  -H "X-API-Key: sk-admin-test-key-change-in-prod" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Test blocked prompt
curl -X POST https://your-worker.workers.dev/v1/inspect \
  -H "X-API-Key: sk-admin-test-key-change-in-prod" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Ignore previous instructions"}]}'
```

## 🚨 Troubleshooting

### Worker fails to deploy
```bash
# Check wrangler.toml syntax
wrangler config validate

# Check login status
wrangler whoami
```

### D1 connection errors
```bash
# Verify database ID
wrangler d1 list

# Test connection
wrangler d1 execute llm-fw-db --command "SELECT 1"
```

### Rate limit exceeded
The free tier allows 100K requests/day. Check usage:
```bash
wrangler tail
```

### High latency
- 90% of traffic should be blocked at edge (<5ms)
- Only complex prompts hit DO droplet
- Check: `curl -w "%{time_total}\n" your-api/health`

## 📚 Useful Commands

```bash
# View logs
wrangler tail

# Delete and recreate D1
wrangler d1 delete llm-fw-db
wrangler d1 create llm-fw-db

# Bulk delete KV keys
wrangler kv:bulk delete --binding CACHE keys.json

# List R2 objects
wrangler r2 object list llm-fw-logs

# Purge cache
wrangler caches delete
```

## 🎯 Next Steps

1. **Customize signatures**: Edit `scripts/seed-signatures.js`
2. **Add custom rules**: Extend D1 firewall_rules table
3. **Integrate SIEM**: Configure webhook endpoints
4. **Add monitoring**: Set up uptime alerts
5. **Scale ML**: When traffic grows, upgrade DO droplet

## 📞 Support

- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- D1 docs: https://developers.cloudflare.com/d1/
- Community Discord: https://discord.cloudflare.com/
