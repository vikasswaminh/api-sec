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
  {
    id: '1',
    name: 'Production API Key',
    key: 'sk-live-xxxxxxxxxxxx',
    tier: 'enterprise',
    created_at: '2024-01-15T10:30:00Z',
    last_used: '2024-02-12T15:45:00Z',
    request_count: 15420,
    active: true,
  },
  {
    id: '2',
    name: 'Development',
    key: 'sk-dev-xxxxxxxxxxxx',
    tier: 'pro',
    created_at: '2024-02-01T08:00:00Z',
    last_used: '2024-02-12T10:20:00Z',
    request_count: 3420,
    active: true,
  },
];

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKeyData[]>(mockKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyTier, setNewKeyTier] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    
    const newKey: ApiKeyData = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk-${newKeyTier}-${Math.random().toString(36).substring(2, 15)}`,
      tier: newKeyTier,
      created_at: new Date().toISOString(),
      last_used: null,
      request_count: 0,
      active: true,
    };
    
    setKeys([newKey, ...keys]);
    setNewKeyName('');
    setShowCreate(false);
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, active: false } : k));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="API Keys" />
      
      <main className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400">Manage your API keys and access tokens</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Key
          </button>
        </div>

        {/* Create Key Modal */}
        {showCreate && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create New API Key</h3>
              <button 
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tier</label>
                <select
                  value={newKeyTier}
                  onChange={(e) => setNewKeyTier(e.target.value as 'free' | 'pro' | 'enterprise')}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="free">Free (100 req/min)</option>
                  <option value="pro">Pro (1000 req/min)</option>
                  <option value="enterprise">Enterprise (10000 req/min)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
                >
                  Create Key
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keys List */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Key</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Tier</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Usage</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Created</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Key className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="font-medium text-white">{key.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-slate-400 font-mono">{key.key}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        key.tier === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                        key.tier === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {key.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {key.request_count.toLocaleString()} requests
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {formatDate(key.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-sm ${
                        key.active ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          key.active ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        {key.active ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopy(key.key, key.id)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Copy key"
                        >
                          {copiedId === key.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        {key.active && (
                          <button
                            onClick={() => handleRevoke(key.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Revoke key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <h4 className="text-blue-400 font-medium mb-2">API Key Security</h4>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Never share your API keys in public repositories or client-side code</li>
            <li>• Rotate keys regularly for enhanced security</li>
            <li>• Use separate keys for different environments (dev, staging, prod)</li>
            <li>• Monitor usage and revoke keys that show suspicious activity</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
