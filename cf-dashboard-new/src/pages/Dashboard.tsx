import {
  Shield,
  Activity,
  Clock,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStats } from '../hooks/useStats';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { EventsTable } from '../components/EventsTable';
import { Header } from '../components/Header';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats(30000);
  const { events, loading: eventsLoading, refetch: refetchEvents } = useEvents(10, 30000);

  const total = stats?.last_24h?.total || 0;
  const blocked = stats?.last_24h?.blocked || 0;
  const latency = stats?.last_24h?.avg_latency || 0;
  const blockRate = total > 0 ? ((blocked / total) * 100).toFixed(1) : '0';

  const handleRefresh = () => { refetchStats(); refetchEvents(); };

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle={`Welcome back, ${user?.email.split('@')[0] || 'Admin'}`} onRefresh={handleRefresh} />

      <main className="p-8 space-y-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Total Requests"
            value={total.toLocaleString()}
            subtitle="Last 24 hours"
            icon={<Activity className="w-5 h-5" />}
            loading={statsLoading}
            color="violet"
          />
          <MetricCard
            title="Threats Blocked"
            value={blocked.toLocaleString()}
            subtitle={`${blockRate}% block rate`}
            icon={<Shield className="w-5 h-5" />}
            loading={statsLoading}
            color="red"
          />
          <MetricCard
            title="Avg Latency"
            value={latency > 0 ? `${latency.toFixed(0)}ms` : '--'}
            subtitle="Edge processing"
            icon={<Clock className="w-5 h-5" />}
            loading={statsLoading}
            color="emerald"
          />
          <MetricCard
            title="Tier"
            value={(stats?.tier || user?.tier || 'free').toUpperCase()}
            subtitle="Current plan"
            icon={<Zap className="w-5 h-5" />}
            loading={statsLoading}
            color="amber"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/inspect" className="glass-card rounded-2xl p-5 group hover:border-violet-500/20 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Prompt Inspector</h3>
                <p className="text-xs text-slate-500">Test prompts for threats in real-time</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          <Link to="/events" className="glass-card rounded-2xl p-5 group hover:border-cyan-500/20 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white mb-1">View Events</h3>
                <p className="text-xs text-slate-500">Browse all security events</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          <Link to="/analytics" className="glass-card rounded-2xl p-5 group hover:border-emerald-500/20 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Analytics</h3>
                <p className="text-xs text-slate-500">View traffic and threat charts</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Recent Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Recent Events</h3>
            <Link to="/events" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
              View all
            </Link>
          </div>
          <EventsTable events={events.slice(0, 5)} loading={eventsLoading} compact />
        </div>
      </main>
    </div>
  );
}
