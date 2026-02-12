import { Bell, User, RefreshCw } from 'lucide-react';
import { useHealth } from '../hooks/useHealth';

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
}

export function Header({ title, onRefresh }: HeaderProps) {
  const { health, loading } = useHealth();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Health Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full">
          <div className={`w-2 h-2 rounded-full ${
            health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
          } ${!loading && 'animate-pulse'}`} />
          <span className="text-sm text-slate-300">
            {loading ? 'Checking...' : health?.status === 'healthy' ? 'Healthy' : 'Error'}
          </span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium">Admin</span>
        </button>
      </div>
    </header>
  );
}
