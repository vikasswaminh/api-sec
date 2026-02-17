import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
  color?: 'violet' | 'cyan' | 'red' | 'amber' | 'emerald';
}

const colorMap = {
  violet: { bg: 'from-violet-500/10 to-violet-600/5', border: 'border-violet-500/10', icon: 'text-violet-400', glow: 'shadow-violet-500/5' },
  cyan: { bg: 'from-cyan-500/10 to-cyan-600/5', border: 'border-cyan-500/10', icon: 'text-cyan-400', glow: 'shadow-cyan-500/5' },
  red: { bg: 'from-red-500/10 to-red-600/5', border: 'border-red-500/10', icon: 'text-red-400', glow: 'shadow-red-500/5' },
  amber: { bg: 'from-amber-500/10 to-amber-600/5', border: 'border-amber-500/10', icon: 'text-amber-400', glow: 'shadow-amber-500/5' },
  emerald: { bg: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-500/10', icon: 'text-emerald-400', glow: 'shadow-emerald-500/5' },
};

export function MetricCard({ title, value, subtitle, change, icon, loading = false, color = 'violet' }: MetricCardProps) {
  const c = colorMap[color];

  return (
    <div className={`relative rounded-2xl border bg-gradient-to-br ${c.bg} ${c.border} p-5 shadow-lg ${c.glow} overflow-hidden group transition-all duration-300 hover:scale-[1.01]`}>
      <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/[0.04] transition-all" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl bg-white/[0.04] ${c.icon}`}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-slate-500'}`}>
              {change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : change < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
              <span>{change > 0 ? '+' : ''}{change}%</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{title}</p>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-500 mt-1" />
        ) : (
          <>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </>
        )}
      </div>
    </div>
  );
}
