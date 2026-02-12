import { Outlet, NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, Settings, Bell, User } from 'lucide-react';

function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">LLM-FW</h1>
                <p className="text-xs text-slate-400">Security Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all">
                <Bell className="w-4 h-4 text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] border-r border-slate-800 p-4">
          <nav className="space-y-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/10 text-violet-400 border border-violet-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/10 text-violet-400 border border-violet-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <FileText className="w-4 h-4" />
              Events
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/10 text-violet-400 border border-violet-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              Settings
            </NavLink>
          </nav>

          <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-slate-800">
            <h4 className="text-sm font-semibold text-white mb-2">Plan</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Free Tier</span>
              <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">Active</span>
            </div>
            <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-[23%] bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
            </div>
            <p className="text-xs text-slate-500 mt-2">23K / 100K requests today</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
