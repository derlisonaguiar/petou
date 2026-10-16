'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Clock3, Mail, MapPin, Phone, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPhone } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

export default function PublicBusinessPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { user } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({ petId: '', serviceId: '', scheduledDate: '', scheduledTime: '', notes: '' });
  const { data: business, isLoading, isError, error } = useQuery({
    queryKey: ['public-business', slug],
    queryFn: async () => (await api.get(`/public/businesses/${slug}`)).data,
    enabled: Boolean(slug),
    retry: false,
  });
  const { data: pets = [] } = useQuery({
    queryKey: ['tutor-pets'],
    queryFn: async () => (await api.get('/tutor/pets')).data,
    enabled: user?.accountType === 'TUTOR',
  });
  const bookingMutation = useMutation({
    mutationFn: async () => (await api.post(`/public/businesses/${slug}/appointments`, booking)).data,
    onSuccess: () => { setShowBooking(false); setBooking({ petId: '', serviceId: '', scheduledDate: '', scheduledTime: '', notes: '' }); },
  });

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#fffaf3]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dce4ff] border-t-[#121a48]" /></main>;
  }

  if (isError) {
    const notFound = (error as any)?.response?.status === 404;
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf3] px-4 text-center">
        <div>
          <Store className="mx-auto h-12 w-12 text-[#e89a1b]" />
          <h1 className="mt-5 text-2xl font-bold text-[#121a48]">{notFound ? 'Negócio não encontrado' : 'Não foi possível carregar este perfil'}</h1>
          <p className="mt-2 text-[#2d3f7d]">{notFound ? 'Confira o endereço e tente novamente.' : 'Tente novamente em alguns instantes.'}</p>
          <Link href="/" className="mt-6 inline-block"><Button className="bg-[#121a48] text-white hover:bg-[#2d3f7d]">Voltar para o Petou</Button></Link>
        </div>
      </main>
    );
  }

  const location = [business.address, business.city, business.state].filter(Boolean).join(' · ');

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#121a48]">
      <header className="border-b border-[#eee4d3] bg-[#fffaf3]">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold"><Image src="/images/petou-logo.jpeg" alt="Petou" width={96} height={60} className="h-12 w-auto" /></Link>
          <Link href="/login"><Button variant="ghost">Entrar</Button></Link>
        </div>
      </header>

      <section className="border-b border-[#1c2a61] bg-[#121a48] py-12 text-white">
        <div className="container mx-auto flex flex-col gap-6 px-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-[#121a48]">
            {business.logoUrl ? <Image src={business.logoUrl} alt={`Logo de ${business.name}`} width={96} height={96} className="h-full w-full object-cover" /> : <Store className="h-10 w-10" />}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f8bc47]">Perfil público</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">{business.name}</h1>
            <div className="mt-4 flex flex-wrap gap-2">{business.businessTypes.map((type: string) => <span key={type} className="rounded-full bg-white/10 px-3 py-1 text-sm text-[#dce4ff]">{type}</span>)}</div>
            {user?.accountType === 'TUTOR' && <Button onClick={() => setShowBooking(true)} className="mt-5 bg-[#f5ae2b] text-[#121a48] hover:bg-[#e89a1b]">Agendar serviço</Button>}
          </div>
        </div>
      </section>

      <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="text-2xl font-bold">Serviços disponíveis</h2>
          <p className="mt-2 text-[#2d3f7d]">Conheça os serviços oferecidos por este negócio.</p>
          {business.services.length === 0 ? <Card className="mt-6 border-[#eee4d3] bg-white"><CardContent className="p-6 text-[#2d3f7d]">Nenhum serviço público disponível no momento.</CardContent></Card> : <div className="mt-6 grid gap-4 sm:grid-cols-2">{business.services.map((service: any) => <Card key={service.name} className="border-[#eee4d3] bg-white"><CardContent className="p-6"><p className="text-sm font-semibold text-[#e89a1b]">{service.category}</p><h3 className="mt-1 text-lg font-bold">{service.name}</h3>{service.description && <p className="mt-2 text-sm leading-6 text-[#2d3f7d]">{service.description}</p>}<div className="mt-5 flex items-center justify-between border-t border-[#eee4d3] pt-4 text-sm"><span className="flex items-center gap-1 text-[#2d3f7d]"><Clock3 className="h-4 w-4" />{service.duration} min</span><span className="font-bold text-[#121a48]">{formatCurrency(Number(service.price))}</span></div></CardContent></Card>)}</div>}
        </section>

        <aside>
          <Card className="border-[#eee4d3] bg-white"><CardContent className="p-6"><h2 className="text-lg font-bold">Informações de contato</h2><div className="mt-5 space-y-4 text-sm text-[#2d3f7d]"><a href={`tel:${business.phone}`} className="flex items-center gap-3 hover:text-[#121a48]"><Phone className="h-5 w-5 text-[#e89a1b]" />{formatPhone(business.phone)}</a>{business.email && <a href={`mailto:${business.email}`} className="flex items-center gap-3 break-all hover:text-[#121a48]"><Mail className="h-5 w-5 shrink-0 text-[#e89a1b]" />{business.email}</a>}{location && <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#e89a1b]" />{location}</p>}</div></CardContent></Card></aside>
      </div>
      {showBooking && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121a48]/60 p-4"><Card className="w-full max-w-lg border-[#eee4d3] bg-white"><CardContent className="p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">Solicitar agendamento</h2><p className="mt-1 text-sm text-[#2d3f7d]">{business.name}</p></div><Button type="button" variant="ghost" onClick={() => setShowBooking(false)}>Fechar</Button></div><form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); bookingMutation.mutate(); }}><label className="block text-sm font-medium">Seu pet<select required value={booking.petId} onChange={(event) => setBooking({ ...booking, petId: event.target.value })} className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3"><option value="">Selecione um pet</option>{pets.map((pet: any) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}</select></label><label className="block text-sm font-medium">Serviço<select required value={booking.serviceId} onChange={(event) => setBooking({ ...booking, serviceId: event.target.value })} className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3"><option value="">Selecione um serviço</option>{business.services.map((service: any) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Data<input required type="date" value={booking.scheduledDate} onChange={(event) => setBooking({ ...booking, scheduledDate: event.target.value })} className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3" /></label><label className="block text-sm font-medium">Horário<input required type="time" value={booking.scheduledTime} onChange={(event) => setBooking({ ...booking, scheduledTime: event.target.value })} className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3" /></label></div><label className="block text-sm font-medium">Observação (opcional)<textarea value={booking.notes} onChange={(event) => setBooking({ ...booking, notes: event.target.value })} className="mt-1 min-h-20 w-full rounded-md border border-input bg-white p-3" /></label>{bookingMutation.isError && <p className="text-sm text-red-600">{(bookingMutation.error as any)?.response?.data?.message || 'Não foi possível solicitar o agendamento.'}</p>}<Button type="submit" disabled={bookingMutation.isPending} className="w-full bg-[#121a48] text-white hover:bg-[#2d3f7d]">{bookingMutation.isPending ? 'Enviando...' : 'Solicitar agendamento'}</Button></form></CardContent></Card></div>}
    </main>
  );
}
