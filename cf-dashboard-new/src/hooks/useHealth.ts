import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
}

export function useHealth(refreshInterval: number = 30000) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.health();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [checkHealth, refreshInterval]);

  return { health, loading, error, checkHealth };
}
