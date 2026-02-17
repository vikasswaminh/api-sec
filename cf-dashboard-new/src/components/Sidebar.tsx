import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Key,
  FileText,
  Settings,
  Activity,
  LogOut,
  Scan,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Events', icon: FileText, path: '/events' },
  { label: 'Inspector', icon: Scan, path: '/inspect' },
  { label: 'Analytics', icon: Activity, path: '/analytics' },
  { label: 'API Keys', icon: Key, path: '/apikeys' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

const tierColors = {
  free: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  pro: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  enterprise: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-[260px] fixed inset-y-0 left-0 flex flex-col bg-[#0c0c14] border-r border-white/[0.04]">
      {/* Logo */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-white tracking-tight">LLM Firewall</h1>
            <p className="text-[11px] text-slate-500 tracking-wide">Security Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/[0.06] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 pt-2 border-t border-white/[0.04] mt-auto">
        {user && (
          <div className="px-3 py-3 rounded-xl bg-white/[0.02] mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium text-white truncate">
                {user.email.split('@')[0]}
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierColors[user.tier]}`}>
                {user.tier}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
