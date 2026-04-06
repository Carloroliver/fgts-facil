'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart3,
  Megaphone,
  Settings,
  Smartphone,
} from 'lucide-react';

const links = [
  { href: '/', label: 'Painel', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/conversas', label: 'Conversas', icon: MessageSquare },
  { href: '/metricas', label: 'Metricas', icon: BarChart3 },
  { href: '/anuncios', label: 'Anuncios', icon: Megaphone },
  { href: '/configuracoes', label: 'Config', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-brand-dark2 border-r border-white/5 min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-xl font-bold">
          <span className="text-brand-green">FGTS</span>
          <span className="text-white">Facil</span>
        </h1>
        <p className="text-xs text-white/30 mt-1">Painel Administrativo</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-brand-green/15 text-brand-green border border-brand-green/25'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-2">
          <Smartphone size={16} className="text-brand-green" />
          <div>
            <p className="text-xs text-white/40">WhatsApp</p>
            <p className="text-xs font-medium text-brand-green" id="wpp-status">Conectando...</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
