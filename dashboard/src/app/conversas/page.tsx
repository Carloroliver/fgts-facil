'use client';
import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import ConversationViewer from '@/components/ConversationViewer';
import { api } from '@/lib/api';

export default function ConversasPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getLeads('limit=50&status=QUALIFYING');
        setLeads(data.leads);
      } catch {}
    }
    load();
  }, []);

  async function selectLead(lead: any) {
    setSelected(lead);
    try {
      const detail = await api.getLead(lead.id);
      setMessages(detail.conversations?.[0]?.messages || []);
    } catch {
      setMessages([]);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Conversas</h1>
        <p className="text-sm text-white/40 mt-1">Acompanhe as conversas em tempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de conversas */}
        <div className="lg:col-span-1 bg-brand-dark2 border border-white/5 rounded-2xl overflow-y-auto">
          <div className="p-4 border-b border-white/5">
            <p className="text-xs text-white/30 font-semibold uppercase">Conversas ativas</p>
          </div>
          {leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => selectLead(lead)}
              className={`w-full text-left p-4 border-b border-white/3 hover:bg-white/3 transition-colors ${
                selected?.id === lead.id ? 'bg-brand-green/5 border-l-2 border-l-brand-green' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{lead.name || 'Sem nome'}</p>
                <StatusBadge status={lead.status} />
              </div>
              <p className="text-xs text-white/30">{lead.phone}</p>
            </button>
          ))}
          {leads.length === 0 && (
            <div className="p-8 text-center">
              <MessageSquare size={32} className="text-white/10 mx-auto mb-2" />
              <p className="text-sm text-white/25">Nenhuma conversa ativa</p>
            </div>
          )}
        </div>

        {/* Viewer */}
        <div className="lg:col-span-2">
          {selected ? (
            <ConversationViewer messages={messages} />
          ) : (
            <div className="bg-brand-dark2 border border-white/5 rounded-2xl flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare size={48} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/25">Selecione uma conversa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
