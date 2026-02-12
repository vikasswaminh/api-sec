import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { Event } from '../types';

export function useEvents(limit: number = 50, refreshInterval: number = 10000) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getEvents(limit);
      setEvents(data.events || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchEvents, refreshInterval]);

  return { events, loading, error, refetch: fetchEvents };
}
