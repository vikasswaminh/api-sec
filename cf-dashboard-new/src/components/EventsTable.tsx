import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { Event } from '../types';

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
}

const actionIcons = {
  blocked: Shield,
  flagged: AlertTriangle,
  allowed: CheckCircle,
};

const actionColors = {
  blocked: 'text-red-400 bg-red-500/20 border-red-500/30',
  flagged: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  allowed: 'text-green-400 bg-green-500/20 border-green-500/30',
};

const severityColors = {
  low: 'text-slate-400 bg-slate-500/20',
  medium: 'text-yellow-400 bg-yellow-500/20',
  high: 'text-orange-400 bg-orange-500/20',
  critical: 'text-red-400 bg-red-500/20',
};

export function EventsTable({ events, loading }: EventsTableProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const paginatedEvents = events.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <span className="ml-3 text-slate-400">Loading events...</span>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
        <div className="text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No events yet</h3>
          <p className="text-slate-400">Events will appear here when API requests are processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Time</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Action</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Type</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Severity</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Source IP</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Confidence</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paginatedEvents.map((event) => {
              const ActionIcon = actionIcons[event.action];
              return (
                <tr key={event.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {formatDate(event.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${actionColors[event.action]}`}>
                      <ActionIcon className="w-3.5 h-3.5" />
                      {event.action.charAt(0).toUpperCase() + event.action.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{event.type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${severityColors[event.severity]}`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 font-mono">{event.source_ip}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{(event.confidence * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{formatLatency(event.latency_ms)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
          <p className="text-sm text-slate-400">
            Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, events.length)} of {events.length} events
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
