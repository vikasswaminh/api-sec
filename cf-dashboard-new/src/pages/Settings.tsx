import { useState } from 'react';
import { Save, Key, Bell, Shield, Database } from 'lucide-react';
import { Header } from '../components/Header';
import { api } from '../services/api';

export default function Settings() {
  const [apiKey, setApiKey] = useState(api.getApiKey());
  const [saved, setSaved] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState('medium');
  
  // Security settings
  const [rateLimit, setRateLimit] = useState('1000');
  const [blockThreshold, setBlockThreshold] = useState('0.7');

  const handleSaveApiKey = () => {
    api.setApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="Settings" />
      
      <main className="p-6 max-w-4xl mx-auto space-y-6">
        {/* API Configuration */}
        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">API Configuration</h3>
              <p className="text-sm text-slate-400">Configure your API key for dashboard access</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                API Key
              </label>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save'}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                API Endpoint
              </label>
              <input
                type="text"
                value="https://llm-fw-edge.vikas4988.workers.dev"
                readOnly
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Security Settings</h3>
              <p className="text-sm text-slate-400">Configure threat detection and blocking rules</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Default Rate Limit (requests/min)
              </label>
              <select
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="100">100 (Free Tier)</option>
                <option value="1000">1,000 (Pro Tier)</option>
                <option value="10000">10,000 (Enterprise)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Block Threshold (confidence score)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={blockThreshold}
                onChange={(e) => setBlockThreshold(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-400 mt-1">
                <span>Lenient (0.0)</span>
                <span className="text-white font-medium">{blockThreshold}</span>
                <span>Strict (1.0)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <p className="text-sm text-slate-400">Configure alert preferences</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-slate-400">Receive alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <div>
                <p className="text-white font-medium">Slack Integration</p>
                <p className="text-sm text-slate-400">Send alerts to Slack channel</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={slackNotifications}
                  onChange={(e) => setSlackNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Minimum Alert Severity
              </label>
              <select
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low - All alerts</option>
                <option value="medium">Medium - Medium and above</option>
                <option value="high">High - High and above</option>
                <option value="critical">Critical only</option>
              </select>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Database className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">About</h3>
              <p className="text-sm text-slate-400">System information</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Version:</span>
              <span className="text-white ml-2">1.0.0</span>
            </div>
            <div>
              <span className="text-slate-400">Environment:</span>
              <span className="text-white ml-2">Production</span>
            </div>
            <div>
              <span className="text-slate-400">Dashboard:</span>
              <span className="text-white ml-2">Cloudflare Pages</span>
            </div>
            <div>
              <span className="text-slate-400">API:</span>
              <span className="text-white ml-2">Cloudflare Workers</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
