import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  Key, 
  FileText, 
  Settings, 
  Activity,
  Zap
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'events', label: 'Events & Logs', icon: FileText, path: '/events' },
  { id: 'apikeys', label: 'API Keys', icon: Key, path: '/apikeys' },
  { id: 'inspect', label: 'Prompt Inspector', icon: Shield, path: '/inspect' },
  { id: 'analytics', label: 'Analytics', icon: Activity, path: '/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">LLM-FW</h1>
            <p className="text-xs text-slate-400">API Security</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300">System Online</span>
          </div>
          <p className="text-xs text-slate-500">v1.0.0 • Production</p>
        </div>
      </div>
    </aside>
  );
}
