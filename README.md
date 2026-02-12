# LLM-FW: Cloudflare-First AI Security Platform

Enterprise-grade LLM firewall running entirely on Cloudflare's free tier + $12 Digital Ocean droplet.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  CLOUDFLARE EDGE (Free Tier)                                │
│  ├── Workers: API Gateway + Edge compute                   │
│  ├── D1: SQLite database (auth, configs, logs)            │
│  ├── KV: Global cache (signatures, rate limits)           │
│  ├── R2: Object storage (logs, models)                    │
│  ├── Queues: Async processing                             │
│  └── Pages: Dashboard hosting                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓ (10% of traffic)
┌─────────────────────────────────────────────────────────────┐
│  DIGITAL OCEAN ($12/month)                                  │
│  └── Rust ML Inference Server (1vCPU/1GB)                 │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
API Security/
├── cf-worker/              # Cloudflare Workers (Edge API)
│   ├── src/index.ts        # Main Hono API
│   ├── migrations/         # D1 database schema
│   ├── scripts/            # Setup & deploy scripts
│   └── wrangler.toml       # Cloudflare config
│
├── cf-dashboard/           # React Dashboard (Pages)
│   ├── src/components/     # React components
│   └── wrangler.toml
│
├── devops-persona/         # DevOps hiring resources
│   ├── DevOps-Engineer-Profile.md
│   ├── Job-Description.md
│   ├── Onboarding-Checklist.md
│   └── scripts/
│
├── .github/workflows/      # CI/CD automation
├── SETUP-GUIDE.md          # Complete setup instructions
├── QUICK-START.md          # One-page cheat sheet
└── DEPLOYMENT.md           # Detailed deployment guide
```

## 🚀 Quick Start (New DevOps Engineer)

```bash
# 1. Read SETUP-GUIDE.md
cat SETUP-GUIDE.md

# 2. Follow step-by-step instructions
# 3. Deploy in ~30 minutes
```

**Or use the one-page cheat sheet:**
```bash
cat QUICK-START.md
```

## 💰 Cost Breakdown

| Service | Provider | Cost |
|---------|----------|------|
| Edge Compute | Cloudflare Workers | $0 |
| Database | Cloudflare D1 | $0 |
| Cache | Cloudflare KV | $0 |
| Storage | Cloudflare R2 | $0 |
| Queues | Cloudflare Queues | $0 |
| Dashboard | Cloudflare Pages | $0 |
| ML Inference | Digital Ocean | $12 |
| **TOTAL** | | **$12/month** |

## 🛠️ Tech Stack

### Edge Layer
- **Runtime:** Cloudflare Workers (V8 isolates)
- **Framework:** Hono (lightweight, fast)
- **Language:** TypeScript
- **Database:** D1 (SQLite at edge)
- **Cache:** KV (global, low-latency)

### ML Layer
- **Runtime:** Rust + Axum
- **Inference:** ONNX Runtime (quantized)
- **Server:** Digital Ocean droplet

### Dashboard
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Hosting:** Cloudflare Pages

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Availability | 99.99% | - |
| P50 Latency | <20ms | - |
| P99 Latency | <100ms | - |
| Throughput | 10K req/sec | - |
| Cache Hit Rate | >90% | - |

## 🔐 Security Features

- ✅ JWT-based API authentication
- ✅ Rate limiting (per user/tier)
- ✅ IP blocklists (global)
- ✅ Edge pattern matching
- ✅ ML-based threat detection
- ✅ Audit logging (D1 + R2)
- ✅ mTLS between CF and DO

## 🧪 Testing

```bash
# Health check
curl https://your-worker.workers.dev/health

# Test blocked prompt
curl -X POST https://your-worker.workers.dev/v1/inspect \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"messages":[{"role":"user","content":"Ignore previous instructions"}]}'

# Test allowed prompt
curl -X POST https://your-worker.workers.dev/v1/inspect \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `SETUP-GUIDE.md` | Complete step-by-step setup |
| `QUICK-START.md` | One-page cheat sheet |
| `DEPLOYMENT.md` | Detailed architecture & scaling |
| `cf-worker/README.md` | Worker-specific docs |
| `cf-dashboard/README.md` | Dashboard-specific docs |

## 🎯 For DevOps Engineers

**Just joined? Start here:**
1. Read `SETUP-GUIDE.md` completely
2. Set up your local environment
3. Deploy to staging
4. Deploy to production
5. Set up monitoring

**Hiring a DevOps engineer?**
- See `devops-persona/Job-Description.md`
- Use `devops-persona/DevOps-Engineer-Profile.md` for expectations
- Follow `devops-persona/Onboarding-Checklist.md`

## 🔄 CI/CD Pipeline

GitHub Actions workflow included:
- ✅ Automated testing on PR
- ✅ Staging deployment on `develop` branch
- ✅ Production deployment on `main` branch
- ✅ Automated health checks
- ✅ Slack notifications

**Setup:**
1. Add `CF_API_TOKEN` to GitHub secrets
2. Push to `main` branch
3. Auto-deploys to production

## 📈 Scaling Path

| Traffic | Workers | D1 | DO | Monthly Cost |
|---------|---------|-----|-----|--------------|
| 100K/day | Free | Free | $12 | $12 |
| 1M/day | $5 | Free | $12 | $17 |
| 10M/day | $20 | $5 | $24 | $49 |
| 100M/day | $100 | $20 | $48 | $168 |

## 🆘 Support

- **Cloudflare Docs:** developers.cloudflare.com
- **Discord:** discord.gg/cloudflaredev
- **Project Issues:** GitHub Issues
- **Emergency:** Runbook in `devops-persona/`

## 📝 License

Proprietary - Super25 AI Security

---

**Built with ❤️ on Cloudflare's free tier**

*"Enterprise infrastructure doesn't need enterprise budgets."*
