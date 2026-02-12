import { useState } from 'react';
import { Shield, Key, Webhook, Bell, Lock } from 'lucide-react';

function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 mt-1">Manage your firewall configuration</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="border-b border-slate-800">
          <div className="flex">
            {[
              { id: 'general', label: 'General', icon: Shield },
              { id: 'api', label: 'API Keys', icon: Key },
              { id: 'webhooks', label: 'Webhooks', icon: Webhook },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Lock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Firewall Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Firewall Enabled</p>
                      <p className="text-xs text-slate-400">Enable real-time threat detection</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Sensitivity Level</p>
                      <p className="text-xs text-slate-400">Adjust detection sensitivity</p>
                    </div>
                    <select className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2">
                      <option value="low">Low</option>
                      <option value="medium" selected>Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Outbound Scanning</p>
                      <p className="text-xs text-slate-400">Scan model responses for data leakage</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">API Keys</h3>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-white">Production API Key</p>
                    <button className="text-xs text-violet-400 hover:text-violet-300">Regenerate</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-slate-950 px-3 py-2 rounded text-sm font-mono text-slate-400">
                      sk-••••••••••••••••••••••••••••••
                    </code>
                    <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Webhook Endpoints</h3>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-4">Configure webhooks to receive real-time threat notifications.</p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="https://your-domain.com/webhook"
                      className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-4 py-2"
                    />
                    <div className="flex gap-2">
                      <select className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-3 py-2">
                        <option>All events</option>
                        <option>Critical only</option>
                        <option>Blocked only</option>
                      </select>
                      <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
                        Add Webhook
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Critical threat detected', default: true },
                    { label: 'Daily summary report', default: true },
                    { label: 'Weekly analytics', default: false },
                    { label: 'System maintenance alerts', default: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-300">{item.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-yellow-500/20">
                    <p className="text-sm font-medium text-yellow-400 mb-1">IP Allowlist</p>
                    <p className="text-xs text-slate-400 mb-3">Restrict API access to specific IP addresses</p>
                    <textarea
                      placeholder="Enter IP addresses (one per line)..."
                      className="w-full h-24 bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 resize-none"
                    />
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-medium text-white mb-1">Session Timeout</p>
                    <p className="text-xs text-slate-400 mb-3">Automatically log out after period of inactivity</p>
                    <select className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-3 py-2">
                      <option>15 minutes</option>
                      <option selected>30 minutes</option>
                      <option>1 hour</option>
                      <option>Never</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
