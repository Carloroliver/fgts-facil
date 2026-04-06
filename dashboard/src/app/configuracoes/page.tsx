'use client';
import { useState } from 'react';
import { Save, Smartphone, Bot, Bell, Shield } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('5511999999999');
  const [botName, setBotName] = useState('Ana');
  const [reengageAfter, setReengageAfter] = useState('2');
  const [maxCpl, setMaxCpl] = useState('15');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    // TODO: api.updateConfig(...)
    setTimeout(() => setSaving(false), 1000);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Configuracoes</h1>
        <p className="text-sm text-white/40 mt-1">Ajuste o comportamento do sistema</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* WhatsApp */}
        <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone size={18} className="text-brand-green" />
            <h2 className="font-semibold">WhatsApp</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 block mb-2">Numero do WhatsApp (com DDI)</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-brand-dark border border-white/8 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-brand-green/40"
                placeholder="5511999999999"
              />
            </div>
            <button className="text-xs bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10">
              Reconectar WhatsApp
            </button>
          </div>
        </div>

        {/* Chatbot */}
        <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot size={18} className="text-brand-green" />
            <h2 className="font-semibold">Chatbot</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 block mb-2">Nome da consultora virtual</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full bg-brand-dark border border-white/8 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-brand-green/40"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-2">Reengajar apos (horas sem resposta)</label>
              <input
                type="number"
                value={reengageAfter}
                onChange={(e) => setReengageAfter(e.target.value)}
                className="w-full bg-brand-dark border border-white/8 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-brand-green/40"
              />
            </div>
          </div>
        </div>

        {/* Anuncios */}
        <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={18} className="text-brand-green" />
            <h2 className="font-semibold">Anuncios</h2>
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-2">CPL maximo (pausa automatica acima deste valor)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">R$</span>
              <input
                type="number"
                value={maxCpl}
                onChange={(e) => setMaxCpl(e.target.value)}
                className="w-full bg-brand-dark border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-green/40"
              />
            </div>
          </div>
        </div>

        {/* Seguranca */}
        <div className="bg-brand-dark2 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={18} className="text-brand-green" />
            <h2 className="font-semibold">Seguranca</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 block mb-2">Chave API Claude (Anthropic)</label>
              <input
                type="password"
                defaultValue="sk-ant-•••••••••"
                className="w-full bg-brand-dark border border-white/8 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-brand-green/40"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-2">Meta Pixel ID</label>
              <input
                type="text"
                defaultValue=""
                placeholder="XXXXXXXXXXXXXXXXX"
                className="w-full bg-brand-dark border border-white/8 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-brand-green/40"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-brand-green text-brand-dark font-semibold text-sm px-6 py-3 rounded-xl hover:bg-brand-green/90 transition-colors flex items-center gap-2"
        >
          <Save size={16} />
          {saving ? 'Salvando...' : 'Salvar configuracoes'}
        </button>
      </div>
    </div>
  );
}
