import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  loading?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
  green: 'from-green-500/20 to-green-600/5 border-green-500/30',
  red: 'from-red-500/20 to-red-600/5 border-red-500/30',
  yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
};

const iconColors = {
  blue: 'bg-blue-500/20 text-blue-400',
  green: 'bg-green-500/20 text-green-400',
  red: 'bg-red-500/20 text-red-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  purple: 'bg-purple-500/20 text-purple-400',
};

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel = 'vs last period',
  icon,
  loading = false,
  color = 'blue',
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="w-4 h-4" />;
    return change > 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-slate-400';
    return change > 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${colorClasses[color]} p-6`}>
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${iconColors[color]}`}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              <span className="text-slate-400">Loading...</span>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-white">{value}</p>
              {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
            </>
          )}
        </div>

        {change !== undefined && (
          <p className="text-xs text-slate-500 mt-3">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}
