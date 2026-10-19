'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, Hotel, Search, PawPrint, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';

const shortcuts = [
  {
    title: 'Meus agendamentos',
    description: 'Acompanhe os serviços solicitados para seus pets.',
    href: '/tutor/agendamentos',
    icon: CalendarDays,
  },
  {
    title: 'Buscar servicos',
    description: 'Encontre profissionais e negocios perto de voce.',
    href: '/tutor/servicos',
    icon: Search,
  },
  {
    title: 'Hospedagem',
    description: 'Encontre hotéis pet e creches para o seu companheiro.',
    href: '/tutor/servicos?category=HOSPITALITY',
    icon: Hotel,
  },
  {
    title: 'Meus pets',
    description: 'Acompanhe os dados dos seus companheiros.',
    href: '/tutor/pets',
    icon: PawPrint,
  },
  {
    title: 'Meu perfil',
    description: 'Em breve, mantenha seus dados sempre atualizados.',
    href: '',
    available: false,
    icon: UserRound,
  },
];

export default function TutorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.accountType === 'BUSINESS') {
      router.replace('/dashboard');
    } else if (user.accountType !== 'TUTOR') {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.accountType !== 'TUTOR') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFAF3]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#121A48]" />
      </div>
    );
  }

  const firstName = user.name.split(' ')[0];

  return (
    <main className="min-h-screen bg-[#FFFAF3] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-xl font-bold text-[#121A48]">Petou</Link>
        <section className="mt-10 rounded-2xl bg-[#121A48] px-6 py-8 text-white sm:px-8">
          <p className="text-sm font-medium text-[#F5AE2B]">Area do tutor</p>
          <h1 className="mt-2 text-3xl font-bold">Ola, {firstName}!</h1>
          <p className="mt-2 max-w-xl text-white/80">Tudo o que voce precisa para cuidar melhor do seu pet, em um so lugar.</p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return shortcut.available === false ? (
              <div key={shortcut.title} className="h-full cursor-not-allowed opacity-65">
                <Card className="h-full border-[#2D3F7D]/15 bg-slate-50">
                  <CardContent className="p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-slate-500"><Icon className="h-5 w-5" /></div>
                    <h2 className="mt-5 font-semibold text-slate-600">{shortcut.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{shortcut.description}</p>
                    <span className="mt-3 block text-xs font-medium text-[#E89A1B]">Em breve</span>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Link key={shortcut.title} href={shortcut.href} className="group">
                <Card className="h-full border-[#2D3F7D]/15 bg-white transition group-hover:-translate-y-1 group-hover:border-[#F5AE2B] group-hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff3d7] text-[#E89A1B]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-5 font-semibold text-[#121A48]">{shortcut.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{shortcut.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
