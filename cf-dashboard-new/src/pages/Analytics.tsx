import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, TrendingUp, Shield, Activity } from 'lucide-react';
import { Header } from '../components/Header';

// Mock data for charts
const requestData = [
  { time: '00:00', requests: 120, blocked: 5 },
  { time: '04:00', requests: 80, blocked: 2 },
  { time: '08:00', requests: 350, blocked: 15 },
  { time: '12:00', requests: 420, blocked: 18 },
  { time: '16:00', requests: 380, blocked: 12 },
  { time: '20:00', requests: 290, blocked: 8 },
];

const threatData = [
  { name: 'Prompt Injection', value: 45, color: '#ef4444' },
  { name: 'Jailbreak', value: 30, color: '#f59e0b' },
  { name: 'Data Exfiltration', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 10, color: '#6b7280' },
];

const latencyData = [
  { time: '00:00', p50: 45, p95: 120, p99: 200 },
  { time: '04:00', p50: 40, p95: 110, p99: 180 },
  { time: '08:00', p50: 55, p95: 140, p99: 250 },
  { time: '12:00', p50: 60, p95: 150, p99: 280 },
  { time: '16:00', p50: 52, p95: 135, p99: 240 },
  { time: '20:00', p50: 48, p95: 125, p99: 210 },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Analytics" />
      
      <main className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1h">Last 1 hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
            <TrendingUp className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">Total Requests</span>
            </div>
            <p className="text-2xl font-bold text-white">1,640</p>
            <p className="text-sm text-green-400 mt-1">+12.5%</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-sm text-slate-400">Threats Blocked</span>
            </div>
            <p className="text-2xl font-bold text-white">60</p>
            <p className="text-sm text-red-400 mt-1">+5.2%</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Avg Latency</span>
            </div>
            <p className="text-2xl font-bold text-white">52ms</p>
            <p className="text-sm text-green-400 mt-1">-8.1%</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-400">Block Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">3.7%</p>
            <p className="text-sm text-slate-400 mt-1">Stable</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Volume */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Request Volume</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="blocked" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Threat Distribution */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Threat Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={threatData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {threatData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {threatData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Latency Trends */}
          <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Latency Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2} name="P50" />
                  <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} name="P95" />
                  <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} name="P99" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
