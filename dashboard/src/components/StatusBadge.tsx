const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Novo', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  QUALIFYING: { label: 'Qualificando', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
  QUALIFIED: { label: 'Qualificado', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
  COLLECTING_DATA: { label: 'Coletando dados', color: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  DATA_COMPLETE: { label: 'Dados completos', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  SUBMITTED: { label: 'Enviado', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25' },
  ANALYZING: { label: 'Analisando', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  APPROVED: { label: 'Aprovado', color: 'bg-green-500/15 text-green-400 border-green-500/25' },
  REJECTED: { label: 'Recusado', color: 'bg-red-500/15 text-red-400 border-red-500/25' },
  CONTRACTED: { label: 'Contratado', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  PAID: { label: 'Pago', color: 'bg-green-600/15 text-green-300 border-green-600/25' },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-500/15 text-gray-400 border-gray-500/25' },
  INACTIVE: { label: 'Inativo', color: 'bg-gray-500/15 text-gray-500 border-gray-500/25' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-500/15 text-gray-400 border-gray-500/25' };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${config.color}`}>
      {config.label}
    </span>
  );
}
