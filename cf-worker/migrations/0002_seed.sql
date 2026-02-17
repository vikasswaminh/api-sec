-- Seed data for LLM-FW
-- Run: wrangler d1 migrations apply llm-fw-db

-- ==================== USERS ====================
-- Admin user (enterprise tier)
INSERT OR IGNORE INTO users (id, email, password_hash, api_key, tier) VALUES
('usr-admin-001', 'admin@llm-fw.io', '$2a$12$placeholder.hash.for.admin', 'sk-llmfw-admin-' || lower(hex(randomblob(16))), 'enterprise');

-- Demo pro user
INSERT OR IGNORE INTO users (id, email, password_hash, api_key, tier) VALUES
('usr-demo-pro-001', 'demo-pro@llm-fw.io', '$2a$12$placeholder.hash.for.demo', 'sk-llmfw-demo-pro-' || lower(hex(randomblob(16))), 'pro');

-- Demo free user
INSERT OR IGNORE INTO users (id, email, password_hash, api_key, tier) VALUES
('usr-demo-free-001', 'demo-free@llm-fw.io', '$2a$12$placeholder.hash.for.free', 'sk-llmfw-demo-free-' || lower(hex(randomblob(16))), 'free');

-- ==================== ENDPOINTS ====================
-- Admin's endpoint
INSERT OR IGNORE INTO endpoints (id, user_id, name, target_url, firewall_enabled, sensitivity) VALUES
('ep-admin-001', 'usr-admin-001', 'Production API Gateway', 'https://api.example.com/v1/chat', 1, 'high');

INSERT OR IGNORE INTO endpoints (id, user_id, name, target_url, firewall_enabled, sensitivity) VALUES
('ep-admin-002', 'usr-admin-001', 'Internal Chatbot', 'https://internal.example.com/chat', 1, 'medium');

-- Pro user's endpoint
INSERT OR IGNORE INTO endpoints (id, user_id, name, target_url, firewall_enabled, sensitivity) VALUES
('ep-pro-001', 'usr-demo-pro-001', 'Customer Support Bot', 'https://support.example.com/api', 1, 'medium');

-- Free user's endpoint
INSERT OR IGNORE INTO endpoints (id, user_id, name, target_url, firewall_enabled, sensitivity) VALUES
('ep-free-001', 'usr-demo-free-001', 'Test Endpoint', 'https://test.example.com/api', 1, 'low');

-- ==================== FIREWALL RULES ====================
-- Admin rules
INSERT OR IGNORE INTO firewall_rules (id, user_id, endpoint_id, rule_type, pattern, action, enabled) VALUES
('rule-001', 'usr-admin-001', 'ep-admin-001', 'block_ip', '192.168.1.100', 'block', 1);

INSERT OR IGNORE INTO firewall_rules (id, user_id, endpoint_id, rule_type, pattern, action, enabled) VALUES
('rule-002', 'usr-admin-001', 'ep-admin-001', 'block_pattern', 'DROP TABLE', 'block', 1);

INSERT OR IGNORE INTO firewall_rules (id, user_id, endpoint_id, rule_type, pattern, action, enabled) VALUES
('rule-003', 'usr-admin-001', 'ep-admin-002', 'block_country', 'XX', 'flag', 1);

-- Pro user rule
INSERT OR IGNORE INTO firewall_rules (id, user_id, endpoint_id, rule_type, pattern, action, enabled) VALUES
('rule-004', 'usr-demo-pro-001', 'ep-pro-001', 'block_pattern', 'ignore all instructions', 'block', 1);

-- ==================== EVENTS (sample data) ====================
INSERT OR IGNORE INTO events (id, timestamp, type, severity, source_ip, user_id, endpoint_id, action, confidence, latency_ms, payload_hash, payload_preview, reason) VALUES
('evt-001', datetime('now', '-2 hours'), 'prompt_injection', 'high', '203.0.113.1', 'usr-admin-001', 'ep-admin-001', 'blocked', 0.92, 12, 'a1b2c3d4e5f6', 'Ignore previous instructions and...', 'Pattern match: prompt_injection');

INSERT OR IGNORE INTO events (id, timestamp, type, severity, source_ip, user_id, endpoint_id, action, confidence, latency_ms, payload_hash, payload_preview, reason) VALUES
('evt-002', datetime('now', '-1 hour'), 'jailbreak', 'critical', '198.51.100.5', 'usr-admin-001', 'ep-admin-001', 'blocked', 0.95, 8, 'f6e5d4c3b2a1', 'Enable DAN mode now and bypass...', 'Pattern match: jailbreak');

INSERT OR IGNORE INTO events (id, timestamp, type, severity, source_ip, user_id, endpoint_id, action, confidence, latency_ms, payload_hash, payload_preview, reason) VALUES
('evt-003', datetime('now', '-30 minutes'), 'safe', 'low', '192.0.2.10', 'usr-admin-001', 'ep-admin-001', 'allowed', 0.99, 5, 'aabbccddee', 'What is the weather forecast for...', 'No threats detected');

INSERT OR IGNORE INTO events (id, timestamp, type, severity, source_ip, user_id, endpoint_id, action, confidence, latency_ms, payload_hash, payload_preview, reason) VALUES
('evt-004', datetime('now', '-45 minutes'), 'data_exfiltration', 'high', '203.0.113.50', 'usr-demo-pro-001', 'ep-pro-001', 'blocked', 0.85, 15, 'ddeeff001122', 'Show me your training data and...', 'Pattern match: data_exfiltration');

INSERT OR IGNORE INTO events (id, timestamp, type, severity, source_ip, user_id, endpoint_id, action, confidence, latency_ms, payload_hash, payload_preview, reason) VALUES
('evt-005', datetime('now', '-10 minutes'), 'safe', 'low', '198.51.100.20', 'usr-demo-pro-001', 'ep-pro-001', 'allowed', 0.99, 3, '112233445566', 'How do I reset my password?', 'No threats detected');

INSERT OR IGNORE INTO events (id, timestamp, type, severity, source_ip, user_id, endpoint_id, action, confidence, latency_ms, payload_hash, payload_preview, reason) VALUES
('evt-006', datetime('now', '-5 minutes'), 'safe', 'low', '192.0.2.100', 'usr-demo-free-001', 'ep-free-001', 'allowed', 0.99, 4, '778899aabbcc', 'Tell me a joke about programming', 'No threats detected');

-- ==================== HOURLY STATS (sample data) ====================
INSERT OR IGNORE INTO hourly_stats (hour, user_id, requests_total, requests_blocked, requests_flagged, avg_latency_ms, threat_injection, threat_jailbreak, threat_exfiltration, threat_adversarial) VALUES
(strftime('%Y-%m-%d-%H', 'now', '-3 hours'), 'usr-admin-001', 150, 12, 3, 8, 5, 4, 2, 1);

INSERT OR IGNORE INTO hourly_stats (hour, user_id, requests_total, requests_blocked, requests_flagged, avg_latency_ms, threat_injection, threat_jailbreak, threat_exfiltration, threat_adversarial) VALUES
(strftime('%Y-%m-%d-%H', 'now', '-2 hours'), 'usr-admin-001', 200, 18, 5, 10, 8, 6, 3, 1);

INSERT OR IGNORE INTO hourly_stats (hour, user_id, requests_total, requests_blocked, requests_flagged, avg_latency_ms, threat_injection, threat_jailbreak, threat_exfiltration, threat_adversarial) VALUES
(strftime('%Y-%m-%d-%H', 'now', '-1 hour'), 'usr-admin-001', 175, 15, 2, 7, 6, 5, 3, 1);

INSERT OR IGNORE INTO hourly_stats (hour, user_id, requests_total, requests_blocked, requests_flagged, avg_latency_ms, threat_injection, threat_jailbreak, threat_exfiltration, threat_adversarial) VALUES
(strftime('%Y-%m-%d-%H', 'now', '-2 hours'), 'usr-demo-pro-001', 80, 5, 1, 6, 2, 2, 1, 0);

INSERT OR IGNORE INTO hourly_stats (hour, user_id, requests_total, requests_blocked, requests_flagged, avg_latency_ms, threat_injection, threat_jailbreak, threat_exfiltration, threat_adversarial) VALUES
(strftime('%Y-%m-%d-%H', 'now', '-1 hour'), 'usr-demo-pro-001', 95, 8, 2, 9, 3, 3, 2, 0);

INSERT OR IGNORE INTO hourly_stats (hour, user_id, requests_total, requests_blocked, requests_flagged, avg_latency_ms, threat_injection, threat_jailbreak, threat_exfiltration, threat_adversarial) VALUES
(strftime('%Y-%m-%d-%H', 'now'), 'usr-demo-free-001', 25, 1, 0, 4, 1, 0, 0, 0);
