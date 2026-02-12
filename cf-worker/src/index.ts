import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { D1Database, KVNamespace, R2Bucket, Queue, AnalyticsEngineDataset } from '@cloudflare/workers-types';

// ============== TYPES ==============
export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  SIGNATURES: KVNamespace;
  RATE_LIMIT: KVNamespace;
  LOGS: R2Bucket;
  MODELS: R2Bucket;
  LOG_QUEUE: Queue<LogEvent>;
  ANALYTICS_QUEUE: Queue<AnalyticsEvent>;
  ANALYTICS: AnalyticsEngineDataset;
  JWT_SECRET: string;
  ML_BACKEND_URL: string;
  ENVIRONMENT: string;
  MAX_PAYLOAD_SIZE: string;
  DEFAULT_RATE_LIMIT: string;
  RATE_LIMIT_WINDOW: string;
}

interface LogEvent {
  id: string;
  timestamp: number;
  type: string;
  severity: string;
  source_ip: string;
  user_id: string;
  endpoint_id: string;
  action: 'blocked' | 'flagged' | 'allowed';
  confidence: number;
  latency_ms: number;
  payload_hash: string;
  payload_preview: string;
  reason?: string;
}

interface AnalyticsEvent {
  timestamp: number;
  user_id: string;
  event_type: string;
  model: string;
  latency_ms: number;
  confidence: number;
  blocked: boolean;
}

interface User {
  id: string;
  email: string;
  api_key: string;
  tier: 'free' | 'pro' | 'enterprise';
}

// ============== APP ==============
type Variables = {
  user: User;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Global middleware
app.use('/*', cors({
  origin: ['https://dashboard.yourdomain.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
  });
});

// ============== AUTH MIDDLEWARE ==============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authMiddleware = async (c: any, next: any) => {
  const apiKey = c.req.header('X-API-Key');
  if (!apiKey) {
    return c.json({ error: 'Missing API key' }, 401);
  }

  const user = await c.env.DB.prepare(
    'SELECT id, email, api_key, tier FROM users WHERE api_key = ?'
  ).bind(apiKey).first() as User | null;

  if (!user) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  c.set('user', user);
  await next();
};

// ============== RATE LIMITING ==============
async function checkRateLimit(
  kv: KVNamespace,
  clientId: string,
  limit: number,
  window: number
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const key = `ratelimit:${clientId}`;
  const now = Math.floor(Date.now() / 1000);
  
  const data = await kv.get(key, 'json') as { count: number; reset: number } | null;
  
  if (!data || data.reset < now) {
    const reset = now + window;
    await kv.put(key, JSON.stringify({ count: 1, reset }), { expirationTtl: window });
    return { allowed: true, remaining: limit - 1, reset };
  }
  
  if (data.count >= limit) {
    return { allowed: false, remaining: 0, reset: data.reset };
  }
  
  await kv.put(key, JSON.stringify({ count: data.count + 1, reset: data.reset }), {
    expirationTtl: data.reset - now,
  });
  
  return { allowed: true, remaining: limit - data.count - 1, reset: data.reset };
}

// ============== EDGE PATTERN MATCHING ==============
const SIMPLE_PATTERNS = [
  { pattern: /ignore previous instructions/gi, type: 'prompt_injection', severity: 'high' },
  { pattern: /ignore all previous/gi, type: 'prompt_injection', severity: 'high' },
  { pattern: /ignore the previous/gi, type: 'prompt_injection', severity: 'high' },
  { pattern: /new instructions:/gi, type: 'prompt_injection', severity: 'high' },
  { pattern: /system prompt:/gi, type: 'prompt_injection', severity: 'high' },
  { pattern: /you are now/gi, type: 'prompt_injection', severity: 'medium' },
  { pattern: /roleplay as/gi, type: 'prompt_injection', severity: 'medium' },
  { pattern: /pretend to be/gi, type: 'prompt_injection', severity: 'medium' },
  { pattern: /DAN mode/gi, type: 'jailbreak', severity: 'critical' },
  { pattern: /do anything now/gi, type: 'jailbreak', severity: 'high' },
  { pattern: /developer mode/gi, type: 'jailbreak', severity: 'high' },
  { pattern: /STAN/gi, type: 'jailbreak', severity: 'high' },
  { pattern: /jailbreak/gi, type: 'jailbreak', severity: 'medium' },
  { pattern: /no restrictions/gi, type: 'jailbreak', severity: 'high' },
  { pattern: /no limits/gi, type: 'jailbreak', severity: 'medium' },
  { pattern: /bypass safety/gi, type: 'jailbreak', severity: 'critical' },
  { pattern: /ignore safety/gi, type: 'jailbreak', severity: 'critical' },
  { pattern: /ignore ethics/gi, type: 'jailbreak', severity: 'high' },
  { pattern: /system prompt/gi, type: 'data_exfiltration', severity: 'high' },
  { pattern: /training data/gi, type: 'data_exfiltration', severity: 'high' },
  { pattern: /internal knowledge/gi, type: 'data_exfiltration', severity: 'medium' },
  { pattern: /repeat after me/gi, type: 'data_exfiltration', severity: 'medium' },
  { pattern: /output your/gi, type: 'data_exfiltration', severity: 'medium' },
  { pattern: /show me your/gi, type: 'data_exfiltration', severity: 'low' },
];

function edgePatternMatch(text: string): { blocked: boolean; reason?: string; type?: string; confidence: number } {
  for (const { pattern, type, severity } of SIMPLE_PATTERNS) {
    if (pattern.test(text)) {
      const confidence = severity === 'critical' ? 0.95 : severity === 'high' ? 0.85 : 0.70;
      return {
        blocked: severity === 'critical' || severity === 'high',
        reason: `Pattern match: ${type}`,
        type,
        confidence,
      };
    }
  }
  return { blocked: false, confidence: 0 };
}

// ============== MAIN INSPECTION ENDPOINT ==============
app.post('/v1/inspect', authMiddleware, async (c) => {
  const start = Date.now();
  const user = c.get('user') as User;
  const body = await c.req.json();
  const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
  
  // Get user-specific rate limit
  const rateLimits: Record<string, number> = {
    free: 100,
    pro: 1000,
    enterprise: 10000,
  };
  const limit = rateLimits[user.tier] || parseInt(c.env.DEFAULT_RATE_LIMIT);
  
  // Check rate limit
  const rateLimitResult = await checkRateLimit(c.env.RATE_LIMIT, user.id, limit, 60);
  if (!rateLimitResult.allowed) {
    c.header('X-RateLimit-Remaining', '0');
    c.header('X-RateLimit-Reset', rateLimitResult.reset.toString());
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }
  
  c.header('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  c.header('X-RateLimit-Reset', rateLimitResult.reset.toString());
  
  // Check blocked IPs
  const isBlocked = await c.env.CACHE.get(`block:ip:${clientIP}`);
  if (isBlocked) {
    const event: LogEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: 'blocked_ip',
      severity: 'high',
      source_ip: clientIP,
      user_id: user.id,
      endpoint_id: '',
      action: 'blocked',
      confidence: 1.0,
      latency_ms: Date.now() - start,
      payload_hash: await hashString(JSON.stringify(body)),
      payload_preview: 'IP in blocklist',
      reason: 'IP globally blocked',
    };
    c.executionCtx.waitUntil(c.env.LOG_QUEUE.send(event));
    return c.json({ blocked: true, reason: 'IP blocked', confidence: 1.0 }, 403);
  }
  
  // Concatenate all user messages for analysis
  const messages = body.messages || [];
  const userContent = messages
    .filter((m: any) => m.role === 'user')
    .map((m: any) => m.content)
    .join('\n');
  
  // Edge pattern matching (90% of traffic handled here)
  const edgeResult = edgePatternMatch(userContent);
  if (edgeResult.blocked) {
    const event: LogEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: edgeResult.type!,
      severity: 'high',
      source_ip: clientIP,
      user_id: user.id,
      endpoint_id: '',
      action: 'blocked',
      confidence: edgeResult.confidence,
      latency_ms: Date.now() - start,
      payload_hash: await hashString(userContent),
      payload_preview: userContent.substring(0, 200),
      reason: edgeResult.reason,
    };
    c.executionCtx.waitUntil(c.env.LOG_QUEUE.send(event));
    c.executionCtx.waitUntil(writeAnalytics(c.env.ANALYTICS, {
      timestamp: Date.now(),
      user_id: user.id,
      event_type: edgeResult.type!,
      model: body.model || 'unknown',
      latency_ms: Date.now() - start,
      confidence: edgeResult.confidence,
      blocked: true,
    }));
    
    return c.json({
      blocked: true,
      reason: edgeResult.reason,
      confidence: edgeResult.confidence,
      scan_time_ms: Date.now() - start,
      engine: 'edge_pattern',
    }, 200);
  }
  
  // Complex ML inference (only 10% of traffic reaches here)
  try {
    const mlResponse = await fetch(`${c.env.ML_BACKEND_URL}/inspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userContent,
        user_id: user.id,
        sensitivity: 'medium',
      }),
    });
    
    if (!mlResponse.ok) {
      const event: LogEvent = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: 'ml_backend_error',
        severity: 'medium',
        source_ip: clientIP,
        user_id: user.id,
        endpoint_id: '',
        action: 'flagged',
        confidence: 0.5,
        latency_ms: Date.now() - start,
        payload_hash: await hashString(userContent),
        payload_preview: userContent.substring(0, 200),
        reason: 'ML backend unavailable',
      };
      c.executionCtx.waitUntil(c.env.LOG_QUEUE.send(event));
      
      return c.json({
        blocked: false,
        flagged: true,
        reason: 'Inspection service temporarily unavailable',
        confidence: 0.5,
        scan_time_ms: Date.now() - start,
      }, 200);
    }
    
    const mlResult = await mlResponse.json() as {
      blocked: boolean;
      confidence: number;
      type?: string;
      reason?: string;
    };
    
    const event: LogEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: mlResult.type || 'unknown',
      severity: mlResult.blocked ? 'high' : 'low',
      source_ip: clientIP,
      user_id: user.id,
      endpoint_id: '',
      action: mlResult.blocked ? 'blocked' : 'allowed',
      confidence: mlResult.confidence,
      latency_ms: Date.now() - start,
      payload_hash: await hashString(userContent),
      payload_preview: userContent.substring(0, 200),
      reason: mlResult.reason,
    };
    c.executionCtx.waitUntil(c.env.LOG_QUEUE.send(event));
    c.executionCtx.waitUntil(writeAnalytics(c.env.ANALYTICS, {
      timestamp: Date.now(),
      user_id: user.id,
      event_type: mlResult.type || 'unknown',
      model: body.model || 'unknown',
      latency_ms: Date.now() - start,
      confidence: mlResult.confidence,
      blocked: mlResult.blocked,
    }));
    
    return c.json({
      blocked: mlResult.blocked,
      reason: mlResult.reason,
      confidence: mlResult.confidence,
      scan_time_ms: Date.now() - start,
      engine: 'ml_ensemble',
    }, mlResult.blocked ? 403 : 200);
    
  } catch (error) {
    return c.json({
      blocked: false,
      flagged: true,
      reason: 'Inspection service temporarily unavailable',
      confidence: 0,
      scan_time_ms: Date.now() - start,
    }, 200);
  }
});

// ============== BATCH INSPECTION ==============
app.post('/v1/inspect/batch', authMiddleware, async (c) => {
  const body = await c.req.json();
  const prompts = body.prompts || [];
  const start = Date.now();
  
  const results = await Promise.all(
    prompts.map(async (prompt: string) => {
      const edgeResult = edgePatternMatch(prompt);
      if (edgeResult.blocked) {
        return {
          blocked: true,
          confidence: edgeResult.confidence,
          reason: edgeResult.reason,
          engine: 'edge_pattern',
        };
      }
      return {
        blocked: false,
        confidence: 0,
        engine: 'edge_pattern',
      };
    })
  );
  
  return c.json({
    results,
    total: prompts.length,
    blocked: results.filter(r => r.blocked).length,
    scan_time_ms: Date.now() - start,
  });
});

// ============== ADMIN ENDPOINTS ==============
app.get('/v1/stats', authMiddleware, async (c) => {
  const user = c.get('user') as User;
  
  const stats = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN action = 'blocked' THEN 1 ELSE 0 END) as blocked,
      AVG(latency_ms) as avg_latency
    FROM events 
    WHERE user_id = ? 
    AND timestamp > datetime('now', '-1 day')
  `).bind(user.id).first();
  
  return c.json({
    user_id: user.id,
    tier: user.tier,
    last_24h: stats,
  });
});

// ============== UTILITY FUNCTIONS ==============
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function writeAnalytics(analytics: AnalyticsEngineDataset, event: AnalyticsEvent): Promise<void> {
  analytics.writeDataPoint({
    indexes: [event.user_id],
    doubles: [event.latency_ms, event.confidence],
    blobs: [event.event_type, event.model, event.blocked ? 'blocked' : 'allowed'],
  });
}

// ============== DURABLE OBJECTS (DISABLED - REQUIRES PAID PLAN) ==============
// export class RateLimiter { ... }
// export class SessionStore { ... }

// ============== QUEUE HANDLERS ==============
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
  
  // Queue handler - enable when queues are configured
  // async queue(batch: MessageBatch<LogEvent>, env: Env): Promise<void> {
  //   for (const message of batch.messages) {
  //     const event = message.body;
  //     // Process event
  //     message.ack();
  //   }
  // },
};
