'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, User, Phone, CreditCard, Calendar, Wallet } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import ConversationViewer from '@/components/ConversationViewer';
import { api } from '@/lib/api';

export default function LeadDetailPage() {
  const params = useParams();
  const [lead, setLead] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getLead(params.id as string);
        setLead(data);
      } catch {
        // fallback
      }
    }
    load();
  }, [params.id]);

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/30">Carregando...</p>
      </div>
    );
  }

  const messages = lead.conversations?.[0]?.messages || [];

  return (
    <div>
      <Link href="/leads" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6">
        <ArrowLeft size={16} /> Voltar para leads
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info do Lead */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{lead.name || 'Sem nome'}</h2>
              <StatusBadge status={lead.status} />
            </div>

            <div className="space-y-4">
              <InfoRow icon={Phone} label="Telefone" value={lead.phone} />
              <InfoRow icon={User} label="CPF" value={lead.cpf ? `***.***.${lead.cpf.slice(6, 9)}-${lead.cpf.slice(9)}` : '-'} />
              <InfoRow icon={Calendar} label="Nascimento" value={lead.birthDate ? new Date(lead.birthDate).toLocaleDateString('pt-BR') : '-'} />
              <InfoRow icon={Wallet} label="Saldo FGTS" value={lead.fgtsBalance ? `R$ ${parseFloat(lead.fgtsBalance).toLocaleString('pt-BR')}` : '-'} />
              <InfoRow icon={CreditCard} label="PIX" value={lead.pixKey || '-'} />
            </div>
          </div>

          {/* Submissoes */}
          {lead.submissions && lead.submissions.length > 0 && (
            <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Submissoes</h3>
              <div className="space-y-3">
                {lead.submissions.map((sub: any) => (
                  <div key={sub.id} className="bg-white/3 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{sub.partner}</span>
                      <StatusBadge status={sub.status} />
                    </div>
                    {sub.approvedAmount && (
                      <p className="text-brand-green font-bold">
                        R$ {parseFloat(sub.approvedAmount).toLocaleString('pt-BR')}
                      </p>
                    )}
                    {sub.commission && (
                      <p className="text-xs text-white/35 mt-1">
                        Comissao: R$ {parseFloat(sub.commission).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {lead.events && lead.events.length > 0 && (
            <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Timeline</h3>
              <div className="space-y-3">
                {lead.events.slice(0, 10).map((event: any) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-green mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white/60">{event.type}</p>
                      <p className="text-[10px] text-white/25">
                        {new Date(event.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conversa */}
        <div className="lg:col-span-2">
          <ConversationViewer messages={messages} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-white/25 flex-shrink-0" />
      <div>
        <p className="text-[10px] text-white/30 uppercase">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
