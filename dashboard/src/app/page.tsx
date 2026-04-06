'use client';
import { useEffect, useState } from 'react';
import { Users, CheckCircle, TrendingUp, DollarSign, Clock, Zap } from 'lucide-react';
import KpiCard from '@/components/KpiCard';
import LeadTable from '@/components/LeadTable';
import { api } from '@/lib/api';

// Dados de demonstracao enquanto backend nao esta conectado
const demoOverview = {
  totalLeads: 247,
  leadsToday: 34,
  approved: 52,
  conversionRate: 21.1,
  totalCommission: 4680,
  byStatus: { NEW: 48, QUALIFYING: 31, QUALIFIED: 24, COLLECTING_DATA: 18, SUBMITTED: 15, ANALYZING: 12, APPROVED: 38, PAID: 14, REJECTED: 22, INACTIVE: 25 },
};

const demoLeads = [
  { id: '1', phone: '5511987654321', name: 'Marcos Silva', status: 'APPROVED', currentStage: 'RESULT_APPROVED', fgtsBalance: '12500', createdAt: new Date(Date.now() - 3600000).toISOString(), submissions: [{ partner: 'CREDLIBER', status: 'APPROVED', approvedAmount: '8200' }] },
  { id: '2', phone: '5521976543210', name: 'Ana Paula Rocha', status: 'COLLECTING_DATA', currentStage: 'DATA_COLLECTION_CPF', fgtsBalance: '8000', createdAt: new Date(Date.now() - 1800000).toISOString(), submissions: [] },
  { id: '3', phone: '5531965432109', name: 'Roberto Lima', status: 'ANALYZING', currentStage: 'WAITING_RESULT', fgtsBalance: '22000', createdAt: new Date(Date.now() - 7200000).toISOString(), submissions: [{ partner: 'ICRED', status: 'PROCESSING', approvedAmount: null }] },
  { id: '4', phone: '5541954321098', name: null, status: 'NEW', currentStage: 'WELCOME', fgtsBalance: null, createdAt: new Date(Date.now() - 300000).toISOString(), submissions: [] },
  { id: '5', phone: '5511943210987', name: 'Fernanda Costa', status: 'PAID', currentStage: 'RESULT_APPROVED', fgtsBalance: '6500', createdAt: new Date(Date.now() - 86400000).toISOString(), submissions: [{ partner: 'CREDLIBER', status: 'APPROVED', approvedAmount: '4500' }] },
];

export default function DashboardPage() {
  const [overview, setOverview] = useState(demoOverview);
  const [leads, setLeads] = useState(demoLeads);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [ov, ld] = await Promise.all([
          api.getOverview(),
          api.getLeads('limit=10'),
        ]);
        setOverview(ov);
        setLeads(ld.leads);
      } catch {
        // Usa dados demo se backend offline
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Painel</h1>
        <p className="text-sm text-white/40 mt-1">Visao geral do seu negocio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Total de Leads"
          value={overview.totalLeads}
          subtitle={`${overview.leadsToday} hoje`}
          icon={Users}
        />
        <KpiCard
          title="Aprovados"
          value={overview.approved}
          icon={CheckCircle}
          trend={{ value: `${overview.conversionRate}%`, positive: true }}
        />
        <KpiCard
          title="Comissao Total"
          value={`R$ ${overview.totalCommission.toLocaleString('pt-BR')}`}
          icon={DollarSign}
        />
        <KpiCard
          title="Taxa de Conversao"
          value={`${overview.conversionRate}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Funil rapido */}
      <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Funil de Conversao</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { label: 'Novos', count: overview.byStatus.NEW || 0, color: 'bg-blue-500' },
            { label: 'Qualificando', count: overview.byStatus.QUALIFYING || 0, color: 'bg-yellow-500' },
            { label: 'Coletando', count: overview.byStatus.COLLECTING_DATA || 0, color: 'bg-orange-500' },
            { label: 'Enviado', count: (overview.byStatus.SUBMITTED || 0) + (overview.byStatus.ANALYZING || 0), color: 'bg-purple-500' },
            { label: 'Aprovado', count: overview.byStatus.APPROVED || 0, color: 'bg-green-500' },
            { label: 'Pago', count: overview.byStatus.PAID || 0, color: 'bg-emerald-400' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="text-center min-w-[80px]">
                <div className={`w-full h-2 rounded-full ${step.color}/20 mb-2 relative overflow-hidden`}>
                  <div className={`h-full rounded-full ${step.color}`} style={{ width: `${Math.min(100, (step.count / Math.max(overview.totalLeads, 1)) * 100 * 3)}%` }} />
                </div>
                <p className="text-lg font-bold">{step.count}</p>
                <p className="text-[10px] text-white/35 uppercase">{step.label}</p>
              </div>
              {i < 5 && <span className="text-white/15 text-lg">&#8594;</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Leads recentes */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Leads Recentes</h2>
        <a href="/leads" className="text-xs text-brand-green hover:underline">Ver todos</a>
      </div>
      <LeadTable leads={leads} />
    </div>
  );
}
