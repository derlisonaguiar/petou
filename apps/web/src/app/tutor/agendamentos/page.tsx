'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock3, Dog, Star, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Solicitado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
};

export default function TutorAppointmentsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) router.replace('/login');
    else if (user.accountType === 'BUSINESS') router.replace('/dashboard');
    else if (user.accountType !== 'TUTOR') router.replace('/');
  }, [user, isAuthLoading, router]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['tutor-appointments'],
    queryFn: async () => (await api.get('/tutor/appointments')).data,
    enabled: user?.accountType === 'TUTOR',
  });
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => (await api.put(`/tutor/appointments/${id}/cancel`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tutor-appointments'] }),
  });
  const reviewMutation = useMutation({
    mutationFn: async ({ id, rating, comment }: { id: string; rating: number; comment?: string }) => (await api.post(`/tutor/appointments/${id}/review`, { rating, comment })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tutor-appointments'] }),
  });
  const reviewAppointment = (id: string) => {
    const rating = Number(window.prompt('Dê uma nota de 1 a 5 para este atendimento:'));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
    const comment = window.prompt('Comentário (opcional):') || undefined;
    reviewMutation.mutate({ id, rating, comment });
  };

  if (isAuthLoading || !user || user.accountType !== 'TUTOR') {
    return <main className="flex min-h-screen items-center justify-center bg-[#fffaf3]"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#121a48]" /></main>;
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/tutor" className="text-xl font-bold text-[#121a48]">Petou</Link>
        <section className="mt-8 rounded-2xl bg-[#121a48] px-6 py-8 text-white sm:px-8"><p className="text-sm font-medium text-[#f5ae2b]">Área do tutor</p><h1 className="mt-2 text-3xl font-bold">Meus agendamentos</h1><p className="mt-2 text-white/80">Acompanhe os serviços solicitados para seus pets.</p></section>
        <section className="mt-8 space-y-4">
          {isLoading ? <div className="py-16 text-center text-[#2d3f7d]">Carregando agendamentos...</div> : appointments.length === 0 ? <Card className="border-[#eee4d3] bg-white"><CardContent className="py-14 text-center"><CalendarDays className="mx-auto h-10 w-10 text-[#e89a1b]" /><h2 className="mt-4 font-bold text-[#121a48]">Nenhum agendamento ainda</h2><p className="mt-2 text-sm text-[#2d3f7d]">Ao solicitar um serviço, ele aparecerá aqui.</p></CardContent></Card> : appointments.map((appointment: any) => { const canCancel = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status); const canReview = appointment.status === 'COMPLETED' && new Date(appointment.scheduledDate) <= new Date() && !appointment.review; return <Card key={appointment.id} className="border-[#eee4d3] bg-white"><CardContent className="p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><div className="flex items-center gap-2 text-sm font-semibold text-[#e89a1b]"><Store className="h-4 w-4" />{appointment.business.name}</div><h2 className="mt-2 text-lg font-bold text-[#121a48]">{appointment.service.name}</h2><p className="mt-1 flex items-center gap-2 text-sm text-[#2d3f7d]"><Dog className="h-4 w-4" />{appointment.pet.name}</p></div><div className="flex flex-wrap items-center gap-3"><span className="h-fit rounded-full bg-[#eef1ff] px-3 py-1 text-sm font-medium text-[#2d3f7d]">{statusLabels[appointment.status] || appointment.status}</span>{canCancel && <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" disabled={cancelMutation.isPending} onClick={() => cancelMutation.mutate(appointment.id)}>Cancelar</Button>}{canReview && <Button size="sm" disabled={reviewMutation.isPending} onClick={() => reviewAppointment(appointment.id)} className="bg-[#f5ae2b] text-[#121a48] hover:bg-[#e89a1b]"><Star className="mr-2 h-4 w-4" />Avaliar</Button>}{appointment.review && <span className="text-sm font-medium text-emerald-700">Atendimento avaliado</span>}</div></div><div className="mt-5 flex flex-wrap gap-4 border-t border-[#eee4d3] pt-4 text-sm text-[#2d3f7d]"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#e89a1b]" />{formatDate(appointment.scheduledDate)}</span><span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#e89a1b]" />{appointment.scheduledTime}</span></div></CardContent></Card> })}
        </section>
      </div>
    </main>
  );
}
