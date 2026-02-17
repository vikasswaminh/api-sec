import { RefreshCw } from 'lucide-react';
import { useHealth } from '../hooks/useHealth';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export function Header({ title, subtitle, onRefresh }: HeaderProps) {
  const { health } = useHealth();

  return (
    <header className="sticky top-0 z-40 px-8 py-5 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <div className={`w-1.5 h-1.5 rounded-full ${
              health?.status === 'healthy' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-red-400 shadow-sm shadow-red-400/50'
            }`} />
            <span className="text-xs text-slate-400">
              {health?.status === 'healthy' ? 'All systems operational' : 'Degraded'}
            </span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
