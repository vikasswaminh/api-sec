import { useState } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { EventsTable } from '../components/EventsTable';
import { Header } from '../components/Header';

export default function Events() {
  const { events, loading, error, refetch } = useEvents(100, 10000);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'flagged' | 'allowed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = events.filter(e => {
    if (filter !== 'all' && e.action !== filter) return false;
    if (searchTerm && !e.type.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !e.source_ip.includes(searchTerm)) return false;
    return true;
  });

  const counts = {
    total: events.length,
    blocked: events.filter(e => e.action === 'blocked').length,
    flagged: events.filter(e => e.action === 'flagged').length,
    allowed: events.filter(e => e.action === 'allowed').length,
  };

  const filters = [
    { key: 'all' as const, label: 'All', count: counts.total, icon: Filter, color: 'violet' },
    { key: 'blocked' as const, label: 'Blocked', count: counts.blocked, icon: Shield, color: 'red' },
    { key: 'flagged' as const, label: 'Flagged', count: counts.flagged, icon: AlertTriangle, color: 'amber' },
    { key: 'allowed' as const, label: 'Allowed', count: counts.allowed, icon: CheckCircle, color: 'emerald' },
  ];

  return (
    <div className="min-h-screen">
      <Header title="Events" subtitle="Security event log" onRefresh={refetch} />

      <main className="p-8 space-y-6">
        {/* Filter cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filters.map(f => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  active
                    ? 'bg-white/[0.04] border-white/[0.08]'
                    : 'glass-card hover:border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">{f.label}</span>
                  <Icon className={`w-3.5 h-3.5 ${active ? `text-${f.color}-400` : 'text-slate-600'}`} />
                </div>
                <p className="text-xl font-bold text-white">{f.count}</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by type or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/30 transition-all"
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <EventsTable events={filtered} loading={loading} />
      </main>
    </div>
  );
}
