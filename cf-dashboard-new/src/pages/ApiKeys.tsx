import { useState } from 'react';
import { Key, Plus, Copy, Trash2, Check, X } from 'lucide-react';
import { Header } from '../components/Header';

interface ApiKeyData {
  id: string;
  name: string;
  key: string;
  tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  last_used: string | null;
  request_count: number;
  active: boolean;
}

const mockKeys: ApiKeyData[] = [
  { id: '1', name: 'Production API Key', key: 'sk-live-xxxxxxxxxxxx', tier: 'enterprise', created_at: '2024-01-15T10:30:00Z', last_used: '2024-02-12T15:45:00Z', request_count: 15420, active: true },
  { id: '2', name: 'Development', key: 'sk-dev-xxxxxxxxxxxx', tier: 'pro', created_at: '2024-02-01T08:00:00Z', last_used: '2024-02-12T10:20:00Z', request_count: 3420, active: true },
];

const tierStyle = {
  enterprise: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  pro: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  free: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKeyData[]>(mockKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTier, setNewTier] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    setKeys([{
      id: Date.now().toString(), name: newName,
      key: `sk-${newTier}-${Math.random().toString(36).substring(2, 15)}`,
      tier: newTier, created_at: new Date().toISOString(),
      last_used: null, request_count: 0, active: true,
    }, ...keys]);
    setNewName('');
    setShowCreate(false);
  };

  return (
    <div className="min-h-screen">
      <Header title="API Keys" subtitle="Manage access tokens" />

      <main className="p-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{keys.length} key{keys.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-4 h-4" />
            New Key
          </button>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="glass-card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Create API Key</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Key name"
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/30 transition-all"
              />
              <select
                value={newTier} onChange={(e) => setNewTier(e.target.value as typeof newTier)}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/30"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <div className="flex gap-3">
                <button onClick={handleCreate} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-sm font-medium">Create</button>
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-white/[0.04] text-slate-400 rounded-xl text-sm hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Keys list */}
        <div className="space-y-3">
          {keys.map(k => (
            <div key={k.id} className="glass-card rounded-2xl p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white/[0.03]">
                  <Key className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-sm font-medium text-white">{k.name}</span>
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierStyle[k.tier]}`}>
                      {k.tier}
                    </span>
                    {!k.active && (
                      <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Revoked</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <code className="font-mono">{k.key}</code>
                    <span>{k.request_count.toLocaleString()} requests</span>
                    <span>Created {new Date(k.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(k.key, k.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  {copiedId === k.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                {k.active && (
                  <button
                    onClick={() => setKeys(keys.map(key => key.id === k.id ? { ...key, active: false } : key))}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
