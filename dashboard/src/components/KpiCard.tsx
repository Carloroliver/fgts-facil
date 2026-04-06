import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  trend?: { value: string; positive: boolean };
}

export default function KpiCard({ title, value, subtitle, icon: Icon, color = 'brand-green', trend }: KpiCardProps) {
  return (
    <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6 hover:border-brand-green/20 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center`}>
          <Icon size={20} className={`text-${color}`} />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend.positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend.positive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-white/40 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-white/25 mt-1">{subtitle}</p>}
    </div>
  );
}
