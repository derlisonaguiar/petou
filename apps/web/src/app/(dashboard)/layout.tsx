'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Home,
  Calendar,
  Users,
  Dog,
  Stethoscope,
  Syringe,
  Hotel,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  Store,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/api';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
  { href: '/dashboard/tutores', label: 'Tutores', icon: Users },
  { href: '/dashboard/pets', label: 'Pets', icon: Dog },
  { href: '/dashboard/prontuarios', label: 'Prontuarios', icon: Stethoscope },
  { href: '/dashboard/vacinas', label: 'Vacinas', icon: Syringe },
  { href: '/dashboard/hospedagem', label: 'Hospedagem', icon: Hotel },
  { href: '/dashboard/adocao', label: 'Adocao', icon: Heart },
  { href: '/dashboard/produtos', label: 'Produtos', icon: Package },
  { href: '/dashboard/vendas', label: 'Vendas', icon: ShoppingCart },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { href: '/dashboard/configuracoes', label: 'Configuracoes', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string | undefined>();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.accountType !== 'BUSINESS') {
        router.replace('/');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.accountType === 'BUSINESS') {
      api.get('/businesses/current').then((response) => setRegistrationStatus(response.data.registrationStatus)).catch(() => undefined);
    }
  }, [user?.accountType]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.accountType !== 'BUSINESS') return null;

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#121a48] border-r border-[#1f306b] transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/images/petou-logo.jpeg"
              alt="Petou"
              width={77}
              height={48}
              className="h-12 w-auto"
            />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                pathname === item.href
                  ? 'bg-[#f5ae2b] text-[#121a48] font-semibold shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          {user.isPlatformAdmin === true && <Link href="/admin/cadastros" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white"><UserCheck className="h-5 w-5" />Aprovações</Link>}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#121a48]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-white/60 truncate">{user.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full border-white/30 bg-white/10 text-white hover:bg-[#f5ae2b] hover:text-[#121a48]" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 border-b border-[#eee4d3] flex items-center px-4 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-[#fff4d7]"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-gray-600">
            {user.businessName || 'Meu Negocio'}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{registrationStatus === 'PENDING' && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><strong>Seu perfil está em análise.</strong> Você mantém acesso à área interna enquanto aguardamos a aprovação.</div>}{registrationStatus === 'REJECTED' && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"><strong>Seu perfil não foi aprovado.</strong> Ele permanece oculto da busca pública.</div>}{children}</main>
      </div>
    </div>
  );
}
