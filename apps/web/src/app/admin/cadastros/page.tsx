'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Registration = { id: string; name: string; email?: string; phone: string; createdAt: string; businessTypes?: string[]; bio?: string };

export default function AdminRegistrationsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthLoading && (!user || user.isPlatformAdmin !== true)) router.replace(user?.accountType === 'BUSINESS' ? '/dashboard' : '/login');
  }, [user, isAuthLoading, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['pending-registrations'],
    queryFn: async () => (await api.get('/admin/registrations/pending')).data,
    enabled: user?.isPlatformAdmin === true,
  });
  const reviewMutation = useMutation({
    mutationFn: async ({ type, id, status }: { type: 'businesses' | 'professionals'; id: string; status: 'APPROVED' | 'REJECTED' }) => api.patch(`/admin/registrations/${type}/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-registrations'] }),
  });

  if (isAuthLoading || !user || user.isPlatformAdmin !== true) return <main className="flex min-h-screen items-center justify-center bg-[#fffaf3]"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#121a48]" /></main>;

  const renderRegistration = (registration: Registration, type: 'businesses' | 'professionals') => <Card key={registration.id} className="border-[#eee4d3] bg-white"><CardContent className="p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold text-[#121a48]">{registration.name}</h2><p className="mt-1 text-sm text-[#2d3f7d]">{registration.email || registration.phone}</p>{registration.businessTypes && <p className="mt-2 text-xs font-medium text-[#b96f0d]">{registration.businessTypes.join(' · ')}</p>}{registration.bio && <p className="mt-2 text-sm text-slate-600">{registration.bio}</p>}<p className="mt-3 text-xs text-slate-500">Recebido em {new Date(registration.createdAt).toLocaleDateString('pt-BR')}</p></div><Clock3 className="h-5 w-5 shrink-0 text-[#e89a1b]" /></div><div className="mt-5 flex gap-3"><Button size="sm" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ type, id: registration.id, status: 'APPROVED' })} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-2 h-4 w-4" />Aprovar</Button><Button size="sm" variant="outline" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ type, id: registration.id, status: 'REJECTED' })} className="border-red-200 text-red-700 hover:bg-red-50"><XCircle className="mr-2 h-4 w-4" />Rejeitar</Button></div></CardContent></Card>;

  return <main className="min-h-screen bg-[#fffaf3] px-4 py-10 sm:px-6"><div className="mx-auto max-w-5xl"><section className="rounded-2xl bg-[#121a48] px-6 py-8 text-white"><p className="text-sm font-medium text-[#f5ae2b]">Administração</p><h1 className="mt-2 text-3xl font-bold">Aprovação de cadastros</h1><p className="mt-2 text-white/80">Aprove ou rejeite negócios e profissionais antes da publicação.</p></section>{isLoading ? <p className="py-12 text-center text-[#2d3f7d]">Carregando cadastros...</p> : <div className="mt-8 space-y-10"><section><h2 className="text-xl font-bold text-[#121a48]">Negócios pendentes</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{data?.businesses?.length ? data.businesses.map((item: Registration) => renderRegistration(item, 'businesses')) : <p className="text-sm text-slate-500">Nenhum negócio pendente.</p>}</div></section><section><h2 className="text-xl font-bold text-[#121a48]">Profissionais pendentes</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{data?.professionals?.length ? data.professionals.map((item: Registration) => renderRegistration(item, 'professionals')) : <p className="text-sm text-slate-500">Nenhum profissional pendente.</p>}</div></section></div>}</div></main>;
}
