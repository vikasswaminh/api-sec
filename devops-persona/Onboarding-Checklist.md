# DevOps Onboarding Checklist

**New Hire:** _________________  
**Start Date:** _________________  
**Manager:** _________________  
**Buddy:** _________________

---

## 🎯 Week 1: Foundation

### Day 1: Welcome & Setup
- [ ] Welcome email sent with schedule
- [ ] Laptop shipped (MacBook Pro M3 or equivalent)
- [ ] Access to 1Password team vault
- [ ] Slack invite sent
- [ ] GitHub organization invite
- [ ] Notion workspace access
- [ ] Cloudflare dashboard access (read-only)

### Day 1: Accounts & Tools
- [ ] Create Cloudflare account (personal)
- [ ] Install Wrangler CLI: `npm install -g wrangler`
- [ ] Install Node.js 18+
- [ ] Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- [ ] Install Warp terminal
- [ ] Configure VS Code with team extensions
- [ ] Generate SSH key: `ssh-keygen -t ed25519 -C "name@super25.ai"`

### Day 2-3: Code & Architecture
- [ ] Clone repositories:
  ```bash
  git clone git@github.com:super25/cf-worker.git
  git clone git@github.com:super25/cf-dashboard.git
  git clone git@github.com:super25/rust-ml.git
  ```
- [ ] Read architecture docs in Notion
- [ ] Review DEPLOYMENT.md
- [ ] Study wrangler.toml configurations
- [ ] Run local development environment
- [ ] Complete first successful `wrangler dev`

### Day 4-5: First Deployments
- [ ] Deploy to staging environment
- [ ] Make a small change (add comment, etc.)
- [ ] Deploy to production with buddy supervision
- [ ] Run health check script successfully
- [ ] Set up monitoring alerts for personal notifications

**Week 1 Deliverable:** Successfully deployed a change to production

---

## 📚 Week 2: Deep Dive

### Cloudflare Mastery
- [ ] Complete Cloudflare Workers tutorials
- [ ] Read D1 documentation thoroughly
- [ ] Experiment with KV patterns
- [ ] Set up local D1 with `wrangler d1 execute --local`
- [ ] Understand R2 vs S3 differences
- [ ] Learn Queue consumers and producers

### Codebase Exploration
- [ ] Trace a request through the entire system:
  ```
  Client → Cloudflare Worker → (maybe) DO → Response
  ```
- [ ] Identify all failure points
- [ ] Document 3 potential improvements
- [ ] Review all runbooks

### Security
- [ ] Review security checklist in Notion
- [ ] Understand JWT validation flow
- [ ] Review rate limiting implementation
- [ ] Check mTLS configuration
- [ ] Audit access controls

### Cost Analysis
- [ ] Review current Cloudflare bill
- [ ] Understand pricing for each service
- [ ] Identify top 3 cost drivers
- [ ] Propose 1 cost optimization

**Week 2 Deliverable:** Documented 3 infrastructure improvements with cost estimates

---

## 🚀 Week 3-4: Ownership

### On-call Preparation
- [ ] Shadow current on-call engineer
- [ ] Participate in incident response (if any)
- [ ] Practice rollback procedures
- [ ] Test alerting channels
- [ ] Review past incidents in Notion
- [ ] Write personal incident response cheat sheet

### Automation
- [ ] Set up personal development workflow
- [ ] Create custom shell aliases
- [ ] Configure git hooks
- [ ] Set up local monitoring dashboard
- [ ] Automate common tasks

### Documentation
- [ ] Update any outdated runbooks found
- [ ] Document tribal knowledge
- [ ] Create architecture diagram
- [ ] Write onboarding feedback

### First Project
Choose one:
- [ ] Implement monitoring for new metric
- [ ] Optimize slow D1 query
- [ ] Add new deployment script
- [ ] Improve error handling
- [ ] Build cost monitoring dashboard

**Week 4 Deliverable:** Completed first independent project

---

## 🎯 30-60-90 Day Goals

### 30 Days
- [ ] Complete all onboarding items
- [ ] Successfully handle on-call shift
- [ ] Deploy 10+ changes to production
- [ ] Find and implement 1 cost optimization
- [ ] Write 3 new runbooks

### 60 Days
- [ ] Lead a deployment without supervision
- [ ] Handle incident end-to-end
- [ ] Mentor new team member (if applicable)
- [ ] Build automation tool used by team
- [ ] Present at team demo day

### 90 Days
- [ ] Own entire infrastructure roadmap
- [ ] Scale system 10x without cost increase
- [ ] Hire and onboard junior DevOps
- [ ] Speak at external meetup/conference
- [ ] Define team best practices

---

## 📞 Key Contacts

| Role | Name | Slack | Email | Notes |
|------|------|-------|-------|-------|
| Manager | | | | 1:1s weekly |
| Buddy | | | | Questions anytime |
| CTO | | | | Architecture decisions |
| Security Lead | | | | Security reviews |
| On-call Rotation | | #on-call | | PagerDuty |

---

## 🔗 Essential Links

### Documentation
- [ ] Notion: [Infrastructure Wiki](...)
- [ ] Notion: [Runbooks](...)
- [ ] Notion: [Incident Response](...)
- [ ] Notion: [Architecture Diagrams](...)

### Tools
- [ ] Cloudflare Dashboard
- [ ] Digital Ocean Dashboard
- [ ] GitHub Repository
- [ ] PagerDuty
- [ ] Better Uptime
- [ ] Slack #infrastructure

### External Resources
- [ ] Cloudflare Documentation
- [ ] Wrangler CLI Reference
- [ ] Hono Framework Docs
- [ ] Rust Book

---

## ✅ Sign-offs

**New Hire:**
- [ ] I have access to all necessary accounts and tools
- [ ] I understand the on-call rotation schedule
- [ ] I have completed the security training
- [ ] I know how to escalate issues

**Manager:**
- [ ] All access granted
- [ ] First 1:1 scheduled
- [ ] 30-60-90 day goals discussed
- [ ] Buddy assigned and introduced

**Buddy:**
- [ ] Introduced new hire to team
- [ ] Walked through first deployment
- [ ] Available for questions
- [ ] Scheduled check-ins

---

## 📝 Feedback

**What went well:**
_______________________________________________
_______________________________________________

**What could be improved:**
_______________________________________________
_______________________________________________

**Resources needed:**
_______________________________________________
_______________________________________________

---

**Onboarding Complete Date:** _________________  
**New Hire Signature:** _________________  
**Manager Signature:** _________________
