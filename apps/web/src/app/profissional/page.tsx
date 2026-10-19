'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarClock, MapPin, PawPrint, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';

const shortcuts = [
  { title: 'Meu perfil', description: 'Em breve, mantenha suas informacoes atualizadas.', icon: UserRound },
  { title: 'Meus servicos', description: 'Em breve, organize os servicos que voce oferece.', icon: PawPrint },
  { title: 'Disponibilidade', description: 'Em breve, informe seus horarios de atendimento.', icon: CalendarClock },
  { title: 'Localizacao', description: 'Em breve, defina sua area de atendimento.', icon: MapPin },
];

export default function ProfessionalPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace('/login');
    else if (user.accountType === 'BUSINESS') router.replace('/dashboard');
    else if (user.accountType === 'TUTOR') router.replace('/tutor');
    else if (user.accountType !== 'PROFESSIONAL') router.replace('/');
  }, [user, isLoading, router]);

  if (isLoading || !user || user.accountType !== 'PROFESSIONAL') {
    return <div className="flex min-h-screen items-center justify-center bg-[#FFFAF3]"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#121A48]" /></div>;
  }

  const firstName = user.name.split(' ')[0];

  return (
    <main className="min-h-screen bg-[#FFFAF3] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-xl font-bold text-[#121A48]">Petou</Link>
        <section className="mt-10 rounded-2xl bg-[#121A48] px-6 py-8 text-white sm:px-8">
          <p className="text-sm font-medium text-[#F5AE2B]">Area profissional</p>
          <h1 className="mt-2 text-3xl font-bold">Ola, {firstName}!</h1>
          <p className="mt-2 max-w-xl text-white/80">Prepare seu perfil profissional para atender ainda melhor os pets.</p>
        </section>
        {user.registrationStatus === 'PENDING' && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><strong>Seu perfil está em análise.</strong> Você será avisado quando a aprovação for concluída.</div>}
        {user.registrationStatus === 'REJECTED' && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"><strong>Seu perfil não foi aprovado.</strong> Ele permanece oculto publicamente.</div>}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return <div key={shortcut.title} className="h-full cursor-not-allowed opacity-75">
              <Card className="h-full border-[#2D3F7D]/15 bg-slate-50"><CardContent className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-slate-500"><Icon className="h-5 w-5" /></div>
                <h2 className="mt-5 font-semibold text-slate-600">{shortcut.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{shortcut.description}</p>
                <span className="mt-3 block text-xs font-medium text-[#E89A1B]">Em construção</span>
              </CardContent></Card>
            </div>;
          })}
        </section>
      </div>
    </main>
  );
}
