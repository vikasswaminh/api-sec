export interface Stats {
  user_id: string;
  tier: string;
  last_24h: {
    total: number;
    blocked: number;
    avg_latency: number;
  };
}

export interface Event {
  id: string;
  timestamp: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
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

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  last_used: string | null;
  request_count: number;
  active: boolean;
}

export interface DashboardMetric {
  label: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

export interface TimeSeriesData {
  timestamp: string;
  requests: number;
  blocked: number;
  latency: number;
}

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
};
