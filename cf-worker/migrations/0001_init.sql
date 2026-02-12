-- Initial schema for LLM-FW
-- Run: wrangler d1 migrations apply llm-fw-db

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    api_key TEXT UNIQUE,
    tier TEXT DEFAULT 'free' CHECK(tier IN ('free', 'pro', 'enterprise')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API Endpoints table
CREATE TABLE IF NOT EXISTS endpoints (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    target_url TEXT NOT NULL,
    firewall_enabled INTEGER DEFAULT 1,
    sensitivity TEXT DEFAULT 'medium' CHECK(sensitivity IN ('low', 'medium', 'high')),
    scan_outbound INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Firewall rules (user-defined)
CREATE TABLE IF NOT EXISTS firewall_rules (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    endpoint_id TEXT,
    rule_type TEXT NOT NULL CHECK(rule_type IN ('block_ip', 'allow_ip', 'block_pattern', 'allow_pattern', 'block_country')),
    pattern TEXT NOT NULL,
    action TEXT DEFAULT 'block' CHECK(action IN ('block', 'flag', 'log')),
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE
);

-- Events/Logs table (recent only, 90 day TTL)
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('critical', 'high', 'medium', 'low')),
    source_ip TEXT,
    user_id TEXT NOT NULL,
    endpoint_id TEXT,
    action TEXT NOT NULL CHECK(action IN ('blocked', 'flagged', 'allowed')),
    confidence REAL NOT NULL,
    latency_ms INTEGER NOT NULL,
    payload_hash TEXT NOT NULL,
    payload_preview TEXT,
    reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Aggregated hourly stats (for dashboard)
CREATE TABLE IF NOT EXISTS hourly_stats (
    hour TEXT PRIMARY KEY, -- YYYY-MM-DD-HH format
    user_id TEXT NOT NULL,
    requests_total INTEGER DEFAULT 0,
    requests_blocked INTEGER DEFAULT 0,
    requests_flagged INTEGER DEFAULT 0,
    avg_latency_ms INTEGER DEFAULT 0,
    threat_injection INTEGER DEFAULT 0,
    threat_jailbreak INTEGER DEFAULT 0,
    threat_exfiltration INTEGER DEFAULT 0,
    threat_adversarial INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
CREATE INDEX IF NOT EXISTS idx_endpoints_user_id ON endpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_timestamp ON events(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_firewall_rules_user ON firewall_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_hourly_stats_user ON hourly_stats(user_id, hour);

-- Create a default admin user (password: changeme - update in production!)
-- Password hash is for 'admin123' - CHANGE THIS!
INSERT OR IGNORE INTO users (id, email, password_hash, api_key, tier) VALUES 
('admin-001', 'admin@super25.ai', '$2a$10$YourHashedPasswordHere', 'sk-admin-test-key-change-in-prod', 'enterprise');
