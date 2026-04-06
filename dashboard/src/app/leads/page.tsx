'use client';
import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import LeadTable from '@/components/LeadTable';
import { api } from '@/lib/api';

const statusFilters = [
  { value: '', label: 'Todos' },
  { value: 'NEW', label: 'Novos' },
  { value: 'QUALIFYING', label: 'Qualificando' },
  { value: 'COLLECTING_DATA', label: 'Coletando' },
  { value: 'SUBMITTED', label: 'Enviado' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'PAID', label: 'Pagos' },
  { value: 'REJECTED', label: 'Recusados' },
  { value: 'INACTIVE', label: 'Inativos' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', '20');
        if (search) params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);

        const data = await api.getLeads(params.toString());
        setLeads(data.leads);
        setPagination(data.pagination);
      } catch {
        // Demo data
      }
    }
    load();
  }, [page, search, statusFilter]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Leads</h1>
        <p className="text-sm text-white/40 mt-1">{pagination.total} leads no total</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou CPF..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-brand-dark2 border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-green/40"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                statusFilter === f.value
                  ? 'bg-brand-green/15 text-brand-green border border-brand-green/25'
                  : 'bg-white/3 text-white/40 border border-white/5 hover:text-white/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <LeadTable leads={leads} />

      {/* Paginacao */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs px-4 py-2 bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10"
          >
            Anterior
          </button>
          <span className="text-xs text-white/40">Pagina {page} de {pagination.pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="text-xs px-4 py-2 bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10"
          >
            Proxima
          </button>
        </div>
      )}
    </div>
  );
}
