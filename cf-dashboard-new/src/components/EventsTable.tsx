import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { Event } from '../types';

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
  compact?: boolean;
}

const actionConfig = {
  blocked: { icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/15' },
  flagged: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/15' },
  allowed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/15' },
};

const severityConfig = {
  low: 'text-slate-400 bg-slate-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  high: 'text-orange-400 bg-orange-500/10',
  critical: 'text-red-400 bg-red-500/10',
};

export function EventsTable({ events, loading, compact }: EventsTableProps) {
  const [page, setPage] = useState(1);
  const perPage = compact ? 5 : 10;
  const totalPages = Math.ceil(events.length / perPage);
  const paginated = events.slice((page - 1) * perPage, page * perPage);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-10">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading events...</span>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">No events recorded yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Time</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Action</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Severity</th>
              {!compact && <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Source IP</th>}
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Confidence</th>
              {!compact && <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Latency</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.map((evt) => {
              const action = actionConfig[evt.action];
              const ActionIcon = action.icon;
              return (
                <tr key={evt.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-[13px] text-slate-400">{formatTime(evt.timestamp)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${action.bg} ${action.color}`}>
                      <ActionIcon className="w-3 h-3" />
                      {evt.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-slate-300 capitalize">{evt.type.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium uppercase ${severityConfig[evt.severity]}`}>
                      {evt.severity}
                    </span>
                  </td>
                  {!compact && <td className="px-5 py-3 text-[13px] text-slate-500 font-mono">{evt.source_ip}</td>}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500/60" style={{ width: `${evt.confidence * 100}%` }} />
                      </div>
                      <span className="text-[12px] text-slate-400">{(evt.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  {!compact && <td className="px-5 py-3 text-[13px] text-slate-500">{evt.latency_ms}ms</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04]">
          <span className="text-xs text-slate-500">
            {((page - 1) * perPage) + 1}-{Math.min(page * perPage, events.length)} of {events.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.05] disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 px-2">Page {page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.05] disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
