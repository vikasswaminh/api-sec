import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Header } from '../components/Header';

const requestData = [
  { time: '00:00', requests: 120, blocked: 5 },
  { time: '04:00', requests: 80, blocked: 2 },
  { time: '08:00', requests: 350, blocked: 15 },
  { time: '12:00', requests: 420, blocked: 18 },
  { time: '16:00', requests: 380, blocked: 12 },
  { time: '20:00', requests: 290, blocked: 8 },
];

const threatData = [
  { name: 'Injection', value: 45, color: '#ef4444' },
  { name: 'Jailbreak', value: 30, color: '#f59e0b' },
  { name: 'Exfiltration', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 10, color: '#475569' },
];

const latencyData = [
  { time: '00:00', p50: 45, p95: 120, p99: 200 },
  { time: '04:00', p50: 40, p95: 110, p99: 180 },
  { time: '08:00', p50: 55, p95: 140, p99: 250 },
  { time: '12:00', p50: 60, p95: 150, p99: 280 },
  { time: '16:00', p50: 52, p95: 135, p99: 240 },
  { time: '20:00', p50: 48, p95: 125, p99: 210 },
];

const tooltipStyle = {
  contentStyle: { background: '#13131f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#64748b' },
};

const ranges = ['1h', '24h', '7d', '30d'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <div className="min-h-screen">
      <Header title="Analytics" subtitle="Traffic and threat insights" />

      <main className="p-8 space-y-6">
        {/* Time range */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl w-fit">
          {ranges.map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === r
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Volume */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-medium text-white mb-5">Request Volume</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="blocked" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Threat Distribution */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-medium text-white mb-5">Threat Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={threatData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                    {threatData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-3 justify-center">
              {threatData.map(t => (
                <div key={t.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-[11px] text-slate-500">{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Latency Trends */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <h3 className="text-sm font-medium text-white mb-5">Latency Trends</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="p50" stroke="#8b5cf6" strokeWidth={2} dot={false} name="P50" />
                  <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} dot={false} name="P95" />
                  <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} dot={false} name="P99" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
