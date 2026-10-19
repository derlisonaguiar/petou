'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Hotel, Mail, MapPin, Phone, Search, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatPhone } from '@/lib/utils';

const businessTypeLabels: Record<string, string> = {
  PETSHOP: 'Pet shop',
  VETERINARY: 'Veterinário',
  GROOMING: 'Banho e tosa',
  HOTEL: 'Hospedagem',
  DAYCARE: 'Creche',
  HOSPITALITY: 'Hospedagem e creche',
};

export default function TutorServicesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [businessType, setBusinessType] = useState('');

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) router.replace('/login');
    else if (user.accountType === 'BUSINESS') router.replace('/dashboard');
    else if (user.accountType !== 'TUTOR') router.replace('/');
  }, [user, isAuthLoading, router]);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['public-businesses', search, businessType],
    queryFn: async () => (await api.get('/public/businesses', { params: { search: search || undefined, businessType: businessType || undefined } })).data,
    enabled: user?.accountType === 'TUTOR',
  });

  const availableTypes = useMemo(() => Object.keys(businessTypeLabels), []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('category') === 'HOSPITALITY') setBusinessType('HOSPITALITY');
  }, []);

  if (isAuthLoading || !user || user.accountType !== 'TUTOR') {
    return <main className="flex min-h-screen items-center justify-center bg-[#fffaf3]"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#121a48]" /></main>;
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/tutor" className="text-xl font-bold text-[#121a48]">Petou</Link>
        <section className="mt-8 rounded-2xl bg-[#121a48] px-6 py-8 text-white sm:px-8">
          <p className="text-sm font-medium text-[#f5ae2b]">Para tutores</p>
          <h1 className="mt-2 text-3xl font-bold">Buscar serviços</h1>
          <p className="mt-2 text-white/80">Conheça negócios pet e os serviços que oferecem.</p>
        </section>

        <form onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); }} className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px_auto]">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Buscar por nome do negócio" className="h-11 bg-white pl-10" /></div>
          <select value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="h-11 rounded-md border border-input bg-white px-3 text-sm text-[#121a48]">
            <option value="">Todos os tipos</option>
            {availableTypes.map((type) => <option key={type} value={type}>{businessTypeLabels[type]}</option>)}
          </select>
          <Button type="submit" className="h-11 bg-[#f5ae2b] text-[#121a48] hover:bg-[#e89a1b]">Buscar</Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Categorias de serviços">
          <Button type="button" variant={businessType === 'HOSPITALITY' ? 'default' : 'outline'} onClick={() => setBusinessType('HOSPITALITY')} className={businessType === 'HOSPITALITY' ? 'bg-[#121a48] text-white hover:bg-[#2d3f7d]' : 'border-[#121a48]/20 bg-white text-[#121a48] hover:bg-[#fff1cf]'}>
            <Hotel className="mr-2 h-4 w-4" />Hospedagem e creche
          </Button>
        </div>

        <section className="mt-8">
          {isLoading ? <div className="py-16 text-center text-[#2d3f7d]">Carregando negócios...</div> : businesses.length === 0 ? <Card className="border-[#eee4d3] bg-white"><CardContent className="p-8 text-center text-[#2d3f7d]">Nenhum negócio encontrado com estes filtros.</CardContent></Card> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business: any) => (
              <Link key={business.slug} href={`/negocio/${business.slug}`} className="group">
                <Card className="h-full border-[#eee4d3] bg-white transition group-hover:-translate-y-1 group-hover:border-[#f5ae2b] group-hover:shadow-lg"><CardContent className="p-6">
                  <div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fff1cf] text-[#b96f0d]"><Store className="h-6 w-6" /></div><div><h2 className="font-bold text-[#121a48]">{business.name}</h2><p className="mt-1 text-sm text-[#2d3f7d]">{business._count.services} serviço{business._count.services === 1 ? '' : 's'} disponível{business._count.services === 1 ? '' : 'is'}</p></div></div>
                  <div className="mt-5 flex flex-wrap gap-2">{business.businessTypes.map((type: string) => <span key={type} className="rounded-full bg-[#eef1ff] px-2.5 py-1 text-xs font-medium text-[#2d3f7d]">{businessTypeLabels[type] || type}</span>)}</div>
                  <div className="mt-5 space-y-2 border-t border-[#eee4d3] pt-4 text-sm text-[#2d3f7d]">{typeof business.lowestServicePrice === 'number' && <p className="font-semibold text-[#121a48]">Serviços a partir de {formatCurrency(business.lowestServicePrice)}</p>}{(business.city || business.state) && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#e89a1b]" />{[business.city, business.state].filter(Boolean).join(' · ')}</p>}<p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#e89a1b]" />{formatPhone(business.phone)}</p>{business.email && <p className="flex items-center gap-2 truncate"><Mail className="h-4 w-4 shrink-0 text-[#e89a1b]" />{business.email}</p>}</div>
                </CardContent></Card>
              </Link>
            ))}
          </div>}
        </section>
      </div>
    </main>
  );
}
