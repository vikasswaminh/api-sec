import { 
  Shield, 
  Activity, 
  Clock, 
  AlertTriangle,
  Zap,
  Server
} from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { useEvents } from '../hooks/useEvents';
import { MetricCard } from '../components/MetricCard';
import { EventsTable } from '../components/EventsTable';
import { Header } from '../components/Header';

export default function Dashboard() {
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useStats(30000);
  const { events, loading: eventsLoading, refetch: refetchEvents } = useEvents(10, 30000);

  const handleRefresh = () => {
    refetchStats();
    refetchEvents();
  };

  const totalRequests = stats?.last_24h?.total || 0;
  const blockedRequests = stats?.last_24h?.blocked || 0;
  const avgLatency = stats?.last_24h?.avg_latency || 0;
  const blockedRate = totalRequests > 0 ? ((blockedRequests / totalRequests) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Dashboard" onRefresh={handleRefresh} />
      
      <main className="p-6 space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, Admin</h1>
            <p className="text-slate-400 mt-1">
              Tier: <span className="text-blue-400 font-medium uppercase">{stats?.tier || 'Enterprise'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-400">Live updates</span>
          </div>
        </div>

        {statsError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            Error loading stats: {statsError}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Requests (24h)"
            value={totalRequests.toLocaleString()}
            subtitle="Across all endpoints"
            change={12.5}
            icon={<Server className="w-6 h-6" />}
            loading={statsLoading}
            color="blue"
          />
          <MetricCard
            title="Threats Blocked"
            value={blockedRequests.toLocaleString()}
            subtitle={`${blockedRate}% of total traffic`}
            change={-5.2}
            icon={<Shield className="w-6 h-6" />}
            loading={statsLoading}
            color="red"
          />
          <MetricCard
            title="Avg Latency"
            value={avgLatency > 0 ? `${avgLatency.toFixed(0)}ms` : 'N/A'}
            subtitle="Response time"
            change={-8.1}
            icon={<Clock className="w-6 h-6" />}
            loading={statsLoading}
            color="green"
          />
          <MetricCard
            title="Active Alerts"
            value="0"
            subtitle="No critical issues"
            icon={<AlertTriangle className="w-6 h-6" />}
            loading={statsLoading}
            color="yellow"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Traffic Overview</h3>
              <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300">
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-slate-800/50 rounded-lg">
              <div className="text-center">
                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Traffic visualization coming soon</p>
                <p className="text-sm text-slate-500 mt-1">
                  Processed {totalRequests.toLocaleString()} requests in the last 24h
                </p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">API Status</span>
                </div>
                <span className="text-green-400 text-sm font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Protection</span>
                </div>
                <span className="text-green-400 text-sm font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300">Model Cache</span>
                </div>
                <span className="text-blue-400 text-sm font-medium">35 models</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-yellow-400" />
                  <span className="text-slate-300">Uptime</span>
                </div>
                <span className="text-yellow-400 text-sm font-medium">99.9%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Events</h3>
            <button 
              onClick={refetchEvents}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              View All →
            </button>
          </div>
          <EventsTable events={events.slice(0, 5)} loading={eventsLoading} />
        </div>
      </main>
    </div>
  );
}
