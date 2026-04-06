'use client';
import Link from 'next/link';
import StatusBadge from './StatusBadge';

interface Lead {
  id: string;
  phone: string;
  name: string | null;
  status: string;
  currentStage: string;
  fgtsBalance: string | null;
  createdAt: string;
  submissions?: Array<{ partner: string; status: string; approvedAmount: string | null }>;
}

export default function LeadTable({ leads }: { leads: Lead[] }) {
  function formatPhone(phone: string) {
    if (phone.length === 13) {
      return `(${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
    }
    return phone;
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <div className="bg-brand-dark2 border border-white/5 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-xs font-semibold text-white/40 px-6 py-4 uppercase tracking-wider">Lead</th>
            <th className="text-left text-xs font-semibold text-white/40 px-6 py-4 uppercase tracking-wider">Status</th>
            <th className="text-left text-xs font-semibold text-white/40 px-6 py-4 uppercase tracking-wider">Saldo FGTS</th>
            <th className="text-left text-xs font-semibold text-white/40 px-6 py-4 uppercase tracking-wider">Parceiro</th>
            <th className="text-left text-xs font-semibold text-white/40 px-6 py-4 uppercase tracking-wider">Quando</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
              <td className="px-6 py-4">
                <Link href={`/leads/${lead.id}`} className="hover:text-brand-green transition-colors">
                  <p className="font-medium text-sm">{lead.name || 'Sem nome'}</p>
                  <p className="text-xs text-white/35">{formatPhone(lead.phone)}</p>
                </Link>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-6 py-4 text-sm">
                {lead.fgtsBalance
                  ? <span className="font-semibold">R$ {parseFloat(lead.fgtsBalance).toLocaleString('pt-BR')}</span>
                  : <span className="text-white/25">-</span>
                }
              </td>
              <td className="px-6 py-4 text-sm">
                {lead.submissions && lead.submissions.length > 0
                  ? <span className="text-xs text-white/50">{lead.submissions[0].partner}</span>
                  : <span className="text-white/25">-</span>
                }
              </td>
              <td className="px-6 py-4 text-sm text-white/40">
                {timeAgo(lead.createdAt)}
              </td>
            </tr>
          ))}
          {leads.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-white/30">
                Nenhum lead encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
