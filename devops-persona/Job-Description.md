# Job Description: Senior Platform Engineer (Cloudflare)

**Company:** Super25 AI Security  
**Location:** Remote (Global)  
**Type:** Full-time  
**Salary:** $140K-180K USD + equity  
**Start Date:** Immediate

---

## 🚀 About Us

We're building **LLM-FW**, an AI security firewall that protects businesses from prompt injection, jailbreaks, and data exfiltration attacks. Our infrastructure handles millions of requests daily with a radical focus on cost-efficiency—running on just **$12/month** using Cloudflare's free tier.

We're looking for a DevOps engineer who thinks $12/month for enterprise infrastructure isn't cheap enough yet.

---

## 🎯 The Challenge

Your mission: Build and operate infrastructure that can handle **10 million requests/day** for less than the cost of a Netflix subscription.

**Current Stack:**
- Cloudflare Workers (edge compute)
- D1 (SQLite at edge)
- KV (global cache)
- R2 (object storage)
- Digital Ocean droplet (ML inference)
- Rust + TypeScript

**Current Cost:** $12/month  
**Target:** $0.001 per 1M requests  
**Uptime:** 99.99%

---

## 💼 What You'll Do

### Week 1-2: Onboarding
- Audit current infrastructure
- Document all runbooks
- Set up monitoring & alerting
- Find your first cost optimization

### Month 1-3: Foundation
- Achieve 99.99% uptime
- Build CI/CD pipeline (< 5 min deploys)
- Implement canary deployments
- Create disaster recovery plan

### Month 3-6: Scale
- Handle 10M requests/day on existing budget
- Optimize cache hit rates to >95%
- Build multi-region strategy
- Mentor junior engineers

### Ongoing
- Incident response (on-call rotation)
- Cost optimization (target: reduce by 20% quarterly)
- Security audits
- Performance tuning

---

## 🛠️ Requirements

### Must-Have (Non-negotiable)

**Cloudflare Expertise**
- [ ] 2+ years production experience with Cloudflare Workers
- [ ] Built applications using D1, KV, R2 in production
- [ ] Deep understanding of Cloudflare's edge architecture
- [ ] Experience with Wrangler CLI and deployment patterns

**Infrastructure**
- [ ] 5+ years DevOps/SRE experience
- [ ] Proficient in TypeScript/JavaScript
- [ ] Comfortable with Rust (can read, debug, deploy)
- [ ] Linux systems administration
- [ ] Docker and containerization

**Security**
- [ ] Understanding of JWT, OAuth, mTLS
- [ ] Experience with DDoS mitigation
- [ ] Security-first mindset

### Nice-to-Have

- [ ] Experience with AI/ML infrastructure
- [ ] Contributions to open source projects
- [ ] Conference speaking experience
- [ ] Kubernetes (we don't use it, but good to know why)
- [ ] Terraform/Pulumi experience

---

## 🧪 Interview Process

### Stage 1: Recruiter Screen (30 min)
- Culture fit
- Salary expectations
- Timeline

### Stage 2: Technical Take-Home (2-3 hours)
**Scenario:** Our D1 database is showing slow queries during peak traffic. The query logs show:

```sql
SELECT * FROM events 
WHERE user_id = ? 
AND timestamp > datetime('now', '-1 day')
ORDER BY timestamp DESC;
```

**Tasks:**
1. Diagnose the issue
2. Propose 3 solutions with trade-offs
3. Write the migration script
4. Estimate cost impact

### Stage 3: System Design (90 min)
Design a multi-region setup for our LLM-FW using only Cloudflare services. Must handle:
- 100M requests/day
- <50ms latency globally
- Zero-downtime deployments
- Cost < $100/month

### Stage 4: Culture Fit (45 min)
Meet the team, discuss work style, remote work experience.

### Stage 5: Founder Chat (30 min)
Meet the CEO, discuss vision, equity, growth opportunities.

---

## 💰 Compensation

**Base Salary:** $140K-180K USD (based on experience + location)  
**Equity:** 0.1-0.25% (4-year vest)  
**Benefits:**
- Health, dental, vision (US) or stipend (international)
- $2K/year learning budget
- $1K/year home office setup
- Unlimited PTO (minimum 4 weeks encouraged)
- Annual team retreat

---

## 🌟 Why Join Us?

**Impact**
- Your work protects AI systems used by millions
- Infrastructure you build runs at 1/100th the cost of competitors
- Direct line to founders, no bureaucracy

**Growth**
- Define the platform engineering culture
- Speak at conferences (we'll pay for it)
- Potential to build and lead a team

**Tech Stack**
- Cutting-edge edge computing
- No legacy systems to maintain
- Freedom to experiment

**Culture**
- Remote-first, async communication
- "Move fast and fix things"
- No meetings Wednesdays
- Quarterly hackathons

---

## 📞 How to Apply

Send the following to jobs@super25.ai:

1. **Resume** (PDF)
2. **GitHub/GitLab** profile
3. **One-paragraph** answer: "What's the most clever cost optimization you've implemented?"
4. **Optional:** Link to a blog post, talk, or project you're proud of

**Subject:** "Platform Engineer - [Your Name]"

We review every application personally. No recruiters, no ATS black holes.

---

## ❓ FAQ

**Q: Do I need to know Rust?**  
A: You should be comfortable reading and debugging Rust, but you won't be writing complex Rust code day-to-day.

**Q: Is this really $12/month?**  
A: Yes, really. Cloudflare's free tier is generous, and we're experts at using it.

**Q: What if we outgrow the free tier?**  
A: That's a good problem to have. We have a clear scaling path, and you'll lead it.

**Q: Remote work?**  
A: 100% remote. We have team members in 8 time zones. Core hours are 10am-2pm PST for sync meetings.

**Q: On-call?**  
A: Yes, but it's lightweight. PagerDuty rotation, 1 week on / 3 weeks off. Most pages are false alarms we fix permanently.

---

*Last updated: February 2026*  
*We encourage applications from candidates of all backgrounds.*
