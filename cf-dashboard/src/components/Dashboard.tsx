import { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data generators
const generateTimeSeriesData = () => {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i);
    data.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      requests: Math.floor(Math.random() * 5000) + 2000,
      blocked: Math.floor(Math.random() * 200) + 20,
    });
  }
  return data;
};

const threatTypes = [
  { name: 'Prompt Injection', value: 45, color: '#ef4444' },
  { name: 'Jailbreak', value: 28, color: '#f97316' },
  { name: 'Data Exfiltration', value: 15, color: '#eab308' },
  { name: 'Adversarial', value: 12, color: '#8b5cf6' },
];

const severityData = [
  { name: 'Critical', value: 12 },
  { name: 'High', value: 34 },
  { name: 'Medium', value: 78 },
  { name: 'Low', value: 156 },
];

const MetricCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <div className="flex items-center gap-1 mt-2">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-rose-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          )}
          <span className={`text-sm ${trend === 'up' ? 'text-rose-500' : 'text-emerald-500'}`}>
            {change}
          </span>
          <span className="text-slate-600 text-sm ml-1">vs last hour</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

function Dashboard() {
  const [timeSeriesData] = useState(generateTimeSeriesData());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Security Overview</h2>
          <p className="text-slate-400 mt-1">Real-time monitoring of your AI security posture</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Requests"
          value="24.5K"
          change="+12.5%"
          trend="up"
          icon={Activity}
          color="bg-blue-500/10 text-blue-400"
        />
        <MetricCard
          title="Threats Blocked"
          value="1,234"
          change="+23.1%"
          trend="up"
          icon={Shield}
          color="bg-rose-500/10 text-rose-400"
        />
        <MetricCard
          title="Avg Latency"
          value="4.2ms"
          change="-0.8ms"
          trend="down"
          icon={Clock}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <MetricCard
          title="False Positives"
          value="0.05%"
          change="-0.02%"
          trend="down"
          icon={CheckCircle}
          color="bg-emerald-500/10 text-emerald-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        {/* Traffic Chart */}
        <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Traffic & Threats</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                />
                <Area
                  type="monotone"
                  dataKey="blocked"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBlocked)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Types */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Threat Types</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {threatTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {threatTypes.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="text-slate-500">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Severity & Recent Events */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Severity Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#475569" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                  }}
                  cursor={{ fill: '#1e293b' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Events</h3>
          <div className="space-y-3">
            {[
              { id: 'evt_001', type: 'Prompt Injection', severity: 'critical', time: '2 min ago' },
              { id: 'evt_002', type: 'Jailbreak', severity: 'high', time: '5 min ago' },
              { id: 'evt_003', type: 'Data Exfiltration', severity: 'critical', time: '12 min ago' },
              { id: 'evt_004', type: 'Adversarial Input', severity: 'medium', time: '18 min ago' },
              { id: 'evt_005', type: 'Prompt Injection', severity: 'high', time: '25 min ago' },
            ].map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    event.severity === 'critical' ? 'bg-red-500' :
                    event.severity === 'high' ? 'bg-orange-500' :
                    event.severity === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{event.type}</p>
                    <p className="text-xs text-slate-500">{event.id}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{event.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
