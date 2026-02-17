import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import type { D1Database, KVNamespace, R2Bucket, Queue, AnalyticsEngineDataset } from '@cloudflare/workers-types';

// ============== TYPES ==============
export interface Env {
  // Required bindings
  DB: D1Database;
  CACHE: KVNamespace;
  RATE_LIMIT: KVNamespace;
  // Optional bindings (may not be configured yet)
  SIGNATURES?: KVNamespace;
  LOGS?: R2Bucket;
  MODELS?: R2Bucket;
  LOG_QUEUE?: Queue<LogEvent>;
  ANALYTICS_QUEUE?: Queue<AnalyticsEvent>;
  ANALYTICS?: AnalyticsEngineDataset;
  // Environment variables
  JWT_SECRET: string;
  ML_BACKEND_URL?: string;
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

// ============== ZOD SCHEMAS ==============
const MessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});

const InspectBodySchema = z.object({
  prompt: z.string().max(1_000_000).optional(),
  messages: z.array(MessageSchema).max(500).optional(),
  model: z.string().max(200).optional(),
}).refine(data => data.prompt || data.messages, {
  message: 'Either prompt or messages must be provided',
});

const BatchBodySchema = z.object({
  prompts: z.array(z.string().max(1_000_000)).min(1).max(100),
});

const EventsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// ============== LOGGING ==============
function log(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

// ============== APP ==============
type Variables = {
  user: User;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============== SECURITY HEADERS MIDDLEWARE ==============
app.use('/*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '0');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (c.env.ENVIRONMENT === 'production') {
    c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
});

// Global CORS middleware
app.use('/*', cors({
  origin: (origin) => {
    // Allow all Pages.dev deployments and local dev
    if (origin?.endsWith('.llm-fw-dashboard.pages.dev') ||
        origin === 'https://llm-fw-dashboard.pages.dev' ||
        origin?.startsWith('http://localhost')) {
      return origin;
    }
    return '';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
}));

// Global error handler
app.onError((err, c) => {
  const errorDetail = err.message || String(err);
  log('error', 'Unhandled error', {
    error: errorDetail,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });
  return c.json({ error: 'Internal server error' }, 500);
});

// Root route — API info
app.get('/', (c) => {
  return c.json({
    name: 'LLM-FW Edge',
    version: '1.0.0',
    description: 'LLM Security Firewall — protects AI endpoints from prompt injection, jailbreak, and data exfiltration attacks.',
    status: 'operational',
    endpoints: {
      health: 'GET /health',
      inspect: 'POST /v1/inspect',
      inspect_simple: 'POST /v1/inspect-simple',
      inspect_batch: 'POST /v1/inspect/batch',
      stats: 'GET /v1/stats',
      events: 'GET /v1/events',
    },
    docs: 'https://github.com/vikasswaminh/api-sec',
  });
});

// Simple test inspect endpoint (no auth, no processing)
app.post('/v1/inspect-simple', async (c) => {
  try {
    const body = await c.req.json();
    return c.json({
      received: true,
      prompt: body.prompt || null,
      messages: body.messages || null,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return c.json({ error: 'Failed to parse body', details: String(e) }, 400);
  }
});

// Health check — verifies DB connectivity
app.get('/health', async (c) => {
  let dbStatus = 'unknown';
  try {
    const result = await c.env.DB.prepare('SELECT 1 as ok').first();
    dbStatus = result?.ok === 1 ? 'connected' : 'error';
  } catch {
    dbStatus = 'unreachable';
  }

  const healthy = dbStatus === 'connected';
  return c.json({
    status: healthy ? 'healthy' : 'degraded',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
    checks: {
      database: dbStatus,
    },
  }, healthy ? 200 : 503);
});

// ============== AUTH MIDDLEWARE ==============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authMiddleware = async (c: any, next: any) => {
  const apiKey = c.req.header('X-API-Key');
  if (!apiKey) {
    log('warn', 'Missing API key', { path: c.req.path, ip: c.req.header('CF-Connecting-IP') });
    return c.json({ error: 'Missing API key' }, 401);
  }

  try {
    const user = await c.env.DB.prepare(
      'SELECT id, email, api_key, tier FROM users WHERE api_key = ?'
    ).bind(apiKey).first() as User | null;

    if (!user) {
      log('warn', 'Invalid API key attempt', { path: c.req.path, ip: c.req.header('CF-Connecting-IP') });
      return c.json({ error: 'Invalid API key' }, 401);
    }

    c.set('user', user);
    await next();
  } catch (err) {
    log('error', 'Auth middleware DB error', { error: String(err) });
    return c.json({ error: 'Authentication service unavailable' }, 503);
  }
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
    await kv.put(key, JSON.stringify({ count: 1, reset }), { expirationTtl: Math.max(window, 60) });
    return { allowed: true, remaining: limit - 1, reset };
  }

  if (data.count >= limit) {
    return { allowed: false, remaining: 0, reset: data.reset };
  }

  // KV expirationTtl must be at least 60 seconds
  const ttl = Math.max(data.reset - now, 60);
  await kv.put(key, JSON.stringify({ count: data.count + 1, reset: data.reset }), {
    expirationTtl: ttl,
  });

  return { allowed: true, remaining: limit - data.count - 1, reset: data.reset };
}

// ============== EDGE PATTERN MATCHING ==============
const SIMPLE_PATTERNS = [
  { pattern: /ignore previous instructions/i, type: 'prompt_injection', severity: 'high' },
  { pattern: /ignore all previous/i, type: 'prompt_injection', severity: 'high' },
  { pattern: /ignore the previous/i, type: 'prompt_injection', severity: 'high' },
  { pattern: /new instructions:/i, type: 'prompt_injection', severity: 'high' },
  { pattern: /system prompt:/i, type: 'prompt_injection', severity: 'high' },
  { pattern: /you are now/i, type: 'prompt_injection', severity: 'medium' },
  { pattern: /roleplay as/i, type: 'prompt_injection', severity: 'medium' },
  { pattern: /pretend to be/i, type: 'prompt_injection', severity: 'medium' },
  { pattern: /DAN mode/i, type: 'jailbreak', severity: 'critical' },
  { pattern: /do anything now/i, type: 'jailbreak', severity: 'high' },
  { pattern: /developer mode/i, type: 'jailbreak', severity: 'high' },
  { pattern: /STAN/i, type: 'jailbreak', severity: 'high' },
  { pattern: /jailbreak/i, type: 'jailbreak', severity: 'medium' },
  { pattern: /no restrictions/i, type: 'jailbreak', severity: 'high' },
  { pattern: /no limits/i, type: 'jailbreak', severity: 'medium' },
  { pattern: /bypass safety/i, type: 'jailbreak', severity: 'critical' },
  { pattern: /ignore safety/i, type: 'jailbreak', severity: 'critical' },
  { pattern: /ignore ethics/i, type: 'jailbreak', severity: 'high' },
  { pattern: /system prompt/i, type: 'data_exfiltration', severity: 'high' },
  { pattern: /training data/i, type: 'data_exfiltration', severity: 'high' },
  { pattern: /internal knowledge/i, type: 'data_exfiltration', severity: 'medium' },
  { pattern: /repeat after me/i, type: 'data_exfiltration', severity: 'medium' },
  { pattern: /output your/i, type: 'data_exfiltration', severity: 'medium' },
  { pattern: /show me your/i, type: 'data_exfiltration', severity: 'low' },
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
  const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';

  let body: z.infer<typeof InspectBodySchema>;
  try {
    const raw = await c.req.json();
    const parsed = InspectBodySchema.safeParse(raw);
    if (!parsed.success) {
      return c.json({ error: 'Invalid request body', details: parsed.error.issues }, 400);
    }
    body = parsed.data;
  } catch {
    return c.json({ error: 'Failed to parse JSON body' }, 400);
  }

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
    log('info', 'Rate limit exceeded', { user_id: user.id, tier: user.tier });
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }

  c.header('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  c.header('X-RateLimit-Reset', rateLimitResult.reset.toString());

  // Check blocked IPs
  const isBlocked = await c.env.CACHE.get(`block:ip:${clientIP}`);
  if (isBlocked) {
    try {
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
      if (c.env.LOG_QUEUE) {
        c.executionCtx.waitUntil(c.env.LOG_QUEUE.send(event));
      }
    } catch (logErr) {
      log('error', 'Failed to log IP block event', { error: String(logErr) });
    }
    log('info', 'Blocked IP', { ip: clientIP, user_id: user.id });
    return c.json({ blocked: true, reason: 'IP blocked', confidence: 1.0 }, 403);
  }

  // Concatenate all user messages for analysis
  // Support both OpenAI format (messages) and simple format (prompt)
  let userContent = '';
  if (body.prompt) {
    userContent = body.prompt;
  } else if (body.messages) {
    userContent = body.messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n');
  }

  // If no content to analyze, return safe
  if (!userContent || userContent.trim().length === 0) {
    return c.json({
      safe: true,
      confidence: 1.0,
      detections: [],
      scan_time_ms: Date.now() - start,
    });
  }

  // Edge pattern matching (90% of traffic handled here)
  const edgeResult = edgePatternMatch(userContent);

  if (edgeResult.blocked) {
    // Log event asynchronously — don't let logging failures block the response
    try {
      const event: LogEvent = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: edgeResult.type || 'unknown',
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
      if (c.env.LOG_QUEUE) {
        c.executionCtx.waitUntil(c.env.LOG_QUEUE.send(event));
      }
      if (c.env.ANALYTICS) {
        c.executionCtx.waitUntil(writeAnalytics(c.env.ANALYTICS, {
          timestamp: Date.now(),
          user_id: user.id,
          event_type: edgeResult.type || 'unknown',
          model: body.model || 'unknown',
          latency_ms: Date.now() - start,
          confidence: edgeResult.confidence,
          blocked: true,
        }));
      }
    } catch (logErr) {
      log('error', 'Failed to log blocked event', { error: String(logErr) });
    }

    log('info', 'Threat blocked', {
      type: edgeResult.type,
      user_id: user.id,
      confidence: edgeResult.confidence,
      latency_ms: Date.now() - start,
    });

    return c.json({
      safe: false,
      confidence: edgeResult.confidence,
      detections: [{
        type: edgeResult.type,
        severity: 'high',
        message: edgeResult.reason || 'Threat detected',
      }],
      scan_time_ms: Date.now() - start,
      engine: 'edge_pattern',
    }, 200);
  }

  // Content is safe - no threats detected by edge patterns
  try {
    const safeEvent: LogEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: 'safe',
      severity: 'low',
      source_ip: clientIP,
      user_id: user.id,
      endpoint_id: '',
      action: 'allowed',
      confidence: 0.99,
      latency_ms: Date.now() - start,
      payload_hash: await hashString(userContent),
      payload_preview: userContent.substring(0, 200),
      reason: 'No threats detected',
    };
    if (c.env.LOG_QUEUE) {
      c.executionCtx.waitUntil(c.env.LOG_QUEUE.send(safeEvent));
    }
  } catch (logErr) {
    log('error', 'Failed to log safe event', { error: String(logErr) });
  }

  log('info', 'Request allowed', { user_id: user.id, latency_ms: Date.now() - start });

  return c.json({
    safe: true,
    confidence: 0.99,
    detections: [],
    scan_time_ms: Date.now() - start,
    engine: 'edge_pattern',
  });
});

// ============== BATCH INSPECTION ==============
app.post('/v1/inspect/batch', authMiddleware, async (c) => {
  let body: z.infer<typeof BatchBodySchema>;
  try {
    const raw = await c.req.json();
    const parsed = BatchBodySchema.safeParse(raw);
    if (!parsed.success) {
      return c.json({ error: 'Invalid request body', details: parsed.error.issues }, 400);
    }
    body = parsed.data;
  } catch {
    return c.json({ error: 'Failed to parse JSON body' }, 400);
  }

  const start = Date.now();

  const results = await Promise.all(
    body.prompts.map(async (prompt) => {
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
    total: body.prompts.length,
    blocked: results.filter(r => r.blocked).length,
    scan_time_ms: Date.now() - start,
  });
});

// ============== ADMIN ENDPOINTS ==============
app.get('/v1/stats', authMiddleware, async (c) => {
  const user = c.get('user') as User;

  try {
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
  } catch (err) {
    log('error', 'Stats query failed', { user_id: user.id, error: String(err) });
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// Get recent events
app.get('/v1/events', authMiddleware, async (c) => {
  const user = c.get('user') as User;
  const parsed = EventsQuerySchema.safeParse({ limit: c.req.query('limit') || '10' });
  const limit = parsed.success ? parsed.data.limit : 10;

  try {
    const events = await c.env.DB.prepare(`
      SELECT
        id,
        timestamp,
        type,
        severity,
        action,
        confidence,
        payload_preview as preview
      FROM events
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).bind(user.id, limit).all();

    return c.json({
      user_id: user.id,
      events: events.results || [],
    });
  } catch (err) {
    log('error', 'Events query failed', { user_id: user.id, error: String(err) });
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
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

// ============== EXPORTS ==============
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  // Scheduled handler for events cleanup (90-day TTL)
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: Pick<ExecutionContext, 'waitUntil' | 'passThroughOnException'>): Promise<void> {
    try {
      const result = await env.DB.prepare(
        "DELETE FROM events WHERE timestamp < datetime('now', '-90 days')"
      ).run();
      log('info', 'Events cleanup completed', { deleted: result.meta.changes });
    } catch (err) {
      log('error', 'Events cleanup failed', { error: String(err) });
    }
  },
};
