'use client';

interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  createdAt: string;
}

export default function ConversationViewer({ messages }: { messages: Message[] }) {
  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6 max-h-[600px] overflow-y-auto">
      <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Conversa</h3>
      <div className="space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.direction === 'OUTBOUND'
                  ? 'bg-brand-green/15 border border-brand-green/20 text-white/80'
                  : 'bg-white/5 border border-white/8 text-white/70'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${
                msg.direction === 'OUTBOUND' ? 'text-brand-green/50' : 'text-white/25'
              }`}>
                {msg.direction === 'OUTBOUND' ? 'Ana' : 'Cliente'} - {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-white/25 py-8">Nenhuma mensagem ainda</p>
        )}
      </div>
    </div>
  );
}
