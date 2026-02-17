import { useState } from 'react';
import { Save, Key, Shield, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Settings() {
  const { user, apiKey } = useAuth();
  const [newKey, setNewKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [blockThreshold, setBlockThreshold] = useState('0.7');

  const handleSave = () => {
    api.setApiKey(newKey);
    localStorage.setItem('api_key', newKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <Header title="Settings" subtitle="Configuration and preferences" />

      <main className="p-8 max-w-3xl mx-auto space-y-6">
        {/* API Key */}
        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-violet-500/10">
              <Key className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">API Configuration</h3>
              <p className="text-xs text-slate-500">Manage your API key</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">API Key</label>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="sk-llmfw-..."
                  className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/30 font-mono transition-all"
                />
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">API Endpoint</label>
              <input
                type="text"
                value={import.meta.env.VITE_API_BASE_URL || 'https://llm-fw-edge.vikas4988.workers.dev'}
                readOnly
                className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl text-sm text-slate-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-red-500/10">
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Security</h3>
              <p className="text-xs text-slate-500">Detection sensitivity</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Block Threshold</label>
            <input
              type="range" min="0" max="1" step="0.1"
              value={blockThreshold}
              onChange={(e) => setBlockThreshold(e.target.value)}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>Lenient</span>
              <span className="text-white font-medium">{blockThreshold}</span>
              <span>Strict</span>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Info className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">About</h3>
              <p className="text-xs text-slate-500">System information</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Version', '1.0.0'],
              ['Environment', 'Production'],
              ['Tier', (user?.tier || 'free').toUpperCase()],
              ['Platform', 'Cloudflare Workers'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-xs text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
