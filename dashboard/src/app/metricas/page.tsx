'use client';
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import KpiCard from '@/components/KpiCard';
import { api } from '@/lib/api';

export default function MetricasPage() {
  const [overview, setOverview] = useState<any>(null);
  const [daily, setDaily] = useState<Record<string, { leads: number; approved: number }>>({});

  useEffect(() => {
    async function load() {
      try {
        const [ov, d] = await Promise.all([
          api.getOverview(),
          api.getDailyMetrics(30),
        ]);
        setOverview(ov);
        setDaily(d);
      } catch {}
    }
    load();
  }, []);

  const dailyEntries = Object.entries(daily).sort(([a], [b]) => a.localeCompare(b));
  const maxLeads = Math.max(...dailyEntries.map(([, v]) => v.leads), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Metricas</h1>
        <p className="text-sm text-white/40 mt-1">Performance dos ultimos 30 dias</p>
      </div>

      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard title="Total Leads" value={overview.totalLeads} icon={Users} />
          <KpiCard title="Aprovados" value={overview.approved} icon={TrendingUp} />
          <KpiCard title="Conversao" value={`${overview.conversionRate}%`} icon={BarChart3} />
          <KpiCard title="Comissao" value={`R$ ${overview.totalCommission?.toLocaleString('pt-BR')}`} icon={DollarSign} />
        </div>
      )}

      {/* Grafico de barras simples (CSS) */}
      <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-6">Leads por dia</h2>
        <div className="flex items-end gap-1 h-48 overflow-x-auto">
          {dailyEntries.map(([date, data]) => {
            const height = (data.leads / maxLeads) * 100;
            const approvedHeight = (data.approved / maxLeads) * 100;
            return (
              <div key={date} className="flex-1 min-w-[20px] flex flex-col items-center gap-1" title={`${date}: ${data.leads} leads, ${data.approved} aprovados`}>
                <div className="w-full relative" style={{ height: '100%' }}>
                  <div
                    className="absolute bottom-0 w-full bg-brand-green/20 rounded-t-sm"
                    style={{ height: `${height}%` }}
                  />
                  <div
                    className="absolute bottom-0 w-full bg-brand-green rounded-t-sm"
                    style={{ height: `${approvedHeight}%` }}
                  />
                </div>
                <span className="text-[8px] text-white/20 rotate-45 origin-left whitespace-nowrap">
                  {date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-brand-green/20" />
            <span className="text-xs text-white/30">Total leads</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-brand-green" />
            <span className="text-xs text-white/30">Aprovados</span>
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      {overview && (
        <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Distribuicao por status</h2>
          <div className="space-y-3">
            {Object.entries(overview.byStatus || {}).map(([status, count]: [string, any]) => {
              const pct = overview.totalLeads > 0 ? (count / overview.totalLeads * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-4">
                  <span className="text-xs text-white/40 w-32 text-right">{status}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-green/60 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-12">{count}</span>
                  <span className="text-xs text-white/25 w-12">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
