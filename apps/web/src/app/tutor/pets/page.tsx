'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PawPrint, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type Pet = { id: string; name: string; species: string; breed?: string | null; gender: string; birthDate?: string | null };
const species = [{ value: 'DOG', label: 'Cachorro' }, { value: 'CAT', label: 'Gato' }, { value: 'BIRD', label: 'Ave' }, { value: 'OTHER', label: 'Outro' }];

export default function TutorPetsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', species: 'DOG', breed: '', gender: 'UNKNOWN', birthDate: '' });

  useEffect(() => {
    if (!isLoading && (!user || user.accountType !== 'TUTOR')) router.replace(user?.accountType === 'BUSINESS' ? '/dashboard' : '/');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.accountType !== 'TUTOR') return;
    api.get('/tutor/pets').then((response) => setPets(response.data)).catch(() => toast({ title: 'Nao foi possivel carregar seus pets', variant: 'destructive' })).finally(() => setLoadingPets(false));
  }, [user, toast]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSubmitting(true);
    try {
      const response = await api.post('/tutor/pets', { ...form, breed: form.breed || undefined, birthDate: form.birthDate || undefined });
      setPets((current) => [...current, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm({ name: '', species: 'DOG', breed: '', gender: 'UNKNOWN', birthDate: '' });
      toast({ title: 'Pet cadastrado com sucesso!' });
    } catch (error: any) { toast({ title: 'Erro ao cadastrar pet', description: error.response?.data?.message || 'Tente novamente', variant: 'destructive' }); }
    finally { setSubmitting(false); }
  };

  if (isLoading || !user || user.accountType !== 'TUTOR') return <div className="flex min-h-screen items-center justify-center bg-[#FFFAF3]"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#121A48]" /></div>;

  return <main className="min-h-screen bg-[#FFFAF3] px-4 py-10 sm:px-6"><div className="mx-auto max-w-4xl">
    <Link href="/tutor" className="text-xl font-bold text-[#121A48]">Petou</Link>
    <div className="mt-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#E89A1B]">Area do tutor</p><h1 className="text-3xl font-bold text-[#121A48]">Meus pets</h1></div><Link href="/tutor" className="text-sm font-medium text-[#2D3F7D]">Voltar ao inicio</Link></div>
    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]"><div>{loadingPets ? <p className="text-slate-600">Carregando pets...</p> : pets.length === 0 ? <Card><CardContent className="p-8 text-center text-slate-600"><PawPrint className="mx-auto mb-3 h-8 w-8 text-[#E89A1B]" />Voce ainda nao cadastrou nenhum pet.</CardContent></Card> : <div className="grid gap-4 sm:grid-cols-2">{pets.map((pet) => <Card key={pet.id}><CardContent className="p-5"><PawPrint className="h-6 w-6 text-[#E89A1B]" /><h2 className="mt-3 font-semibold text-[#121A48]">{pet.name}</h2><p className="text-sm text-slate-600">{species.find((item) => item.value === pet.species)?.label || pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p></CardContent></Card>)}</div>}</div>
      <Card><CardContent className="p-5"><h2 className="flex items-center gap-2 font-semibold text-[#121A48]"><Plus className="h-4 w-4" />Adicionar pet</h2><form onSubmit={submit} className="mt-4 space-y-3"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome" required /><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}>{species.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="Raca (opcional)" /><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="UNKNOWN">Sexo nao informado</option><option value="MALE">Macho</option><option value="FEMALE">Femea</option></select><Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /><Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Salvando...' : 'Cadastrar pet'}</Button></form></CardContent></Card>
    </section></div></main>;
}
