'use client';
import { useState } from 'react';
import { Megaphone, Play, Pause, TrendingUp, DollarSign, MousePointerClick, Eye } from 'lucide-react';

const demoCampaigns = [
  {
    id: '1',
    name: 'Urgencia - Cold Traffic',
    status: 'ACTIVE',
    budget: 80,
    spent: 47.30,
    impressions: 12450,
    clicks: 387,
    leads: 8,
    cpl: 5.91,
  },
  {
    id: '2',
    name: 'Problema/Solucao - Engajamento',
    status: 'ACTIVE',
    budget: 80,
    spent: 52.10,
    impressions: 9870,
    clicks: 312,
    leads: 5,
    cpl: 10.42,
  },
  {
    id: '3',
    name: 'Remarketing - Visitantes LP',
    status: 'PAUSED',
    budget: 40,
    spent: 18.50,
    impressions: 3200,
    clicks: 145,
    leads: 3,
    cpl: 6.17,
  },
];

export default function AnunciosPage() {
  const [campaigns] = useState(demoCampaigns);

  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
  const avgCpl = totalLeads > 0 ? totalSpent / totalLeads : 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Anuncios</h1>
          <p className="text-sm text-white/40 mt-1">Gestao de campanhas Meta Ads</p>
        </div>
        <button className="bg-brand-green text-brand-dark font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-green/90 transition-colors">
          + Nova Campanha
        </button>
      </div>

      {/* KPIs de Ads */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-5">
          <DollarSign size={18} className="text-white/25 mb-2" />
          <p className="text-xl font-bold">R$ {totalSpent.toFixed(2)}</p>
          <p className="text-xs text-white/35">Gasto total</p>
        </div>
        <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-5">
          <MousePointerClick size={18} className="text-white/25 mb-2" />
          <p className="text-xl font-bold">{campaigns.reduce((s, c) => s + c.clicks, 0)}</p>
          <p className="text-xs text-white/35">Cliques totais</p>
        </div>
        <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-5">
          <TrendingUp size={18} className="text-white/25 mb-2" />
          <p className="text-xl font-bold">{totalLeads}</p>
          <p className="text-xs text-white/35">Leads gerados</p>
        </div>
        <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-5">
          <DollarSign size={18} className="text-brand-green mb-2" />
          <p className="text-xl font-bold text-brand-green">R$ {avgCpl.toFixed(2)}</p>
          <p className="text-xs text-white/35">CPL medio</p>
        </div>
      </div>

      {/* Campanhas */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-brand-dark2 border border-white/5 rounded-2xl p-6 hover:border-brand-green/15 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Megaphone size={18} className="text-white/30" />
                <div>
                  <h3 className="font-semibold text-sm">{campaign.name}</h3>
                  <p className="text-xs text-white/30">Budget: R$ {campaign.budget.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  campaign.status === 'ACTIVE'
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {campaign.status === 'ACTIVE' ? 'Ativo' : 'Pausado'}
                </span>
                <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">
                  {campaign.status === 'ACTIVE' ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-white/30">Gasto</p>
                <p className="font-semibold text-sm">R$ {campaign.spent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-white/30">Impressoes</p>
                <p className="font-semibold text-sm">{campaign.impressions.toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-xs text-white/30">Cliques</p>
                <p className="font-semibold text-sm">{campaign.clicks}</p>
              </div>
              <div>
                <p className="text-xs text-white/30">Leads</p>
                <p className="font-semibold text-sm">{campaign.leads}</p>
              </div>
              <div>
                <p className="text-xs text-white/30">CPL</p>
                <p className={`font-semibold text-sm ${campaign.cpl <= 8 ? 'text-green-400' : campaign.cpl <= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                  R$ {campaign.cpl.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
