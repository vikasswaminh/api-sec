import { useState } from 'react';
import { Filter, Download, Search, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { EventsTable } from '../components/EventsTable';
import { Header } from '../components/Header';

export default function Events() {
  const { events, loading, error, refetch } = useEvents(100, 10000);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'flagged' | 'allowed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(event => {
    if (filter !== 'all' && event.action !== filter) return false;
    if (searchTerm && !event.type.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.source_ip.includes(searchTerm)) return false;
    return true;
  });

  const stats = {
    total: events.length,
    blocked: events.filter(e => e.action === 'blocked').length,
    flagged: events.filter(e => e.action === 'flagged').length,
    allowed: events.filter(e => e.action === 'allowed').length,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Events & Logs" onRefresh={refetch} />
      
      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setFilter('all')}
            className={`p-4 rounded-xl border text-left transition-all ${
              filter === 'all' 
                ? 'bg-blue-600/20 border-blue-500/50' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Events</span>
              <Filter className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </button>

          <button 
            onClick={() => setFilter('blocked')}
            className={`p-4 rounded-xl border text-left transition-all ${
              filter === 'blocked' 
                ? 'bg-red-600/20 border-red-500/50' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Blocked</span>
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.blocked}</p>
          </button>

          <button 
            onClick={() => setFilter('flagged')}
            className={`p-4 rounded-xl border text-left transition-all ${
              filter === 'flagged' 
                ? 'bg-yellow-600/20 border-yellow-500/50' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Flagged</span>
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.flagged}</p>
          </button>

          <button 
            onClick={() => setFilter('allowed')}
            className={`p-4 rounded-xl border text-left transition-all ${
              filter === 'allowed' 
                ? 'bg-green-600/20 border-green-500/50' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Allowed</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.allowed}</p>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by type or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            Error loading events: {error}
          </div>
        )}

        {/* Events Table */}
        <EventsTable events={filteredEvents} loading={loading} />
      </main>
    </div>
  );
}
