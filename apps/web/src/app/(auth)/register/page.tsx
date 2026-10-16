'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const businessTypeOptions = [
  { value: 'PET_SHOP', label: 'Pet Shop' }, { value: 'VET_CLINIC', label: 'Clinica Veterinaria' },
  { value: 'GROOMING', label: 'Banho e Tosa' }, { value: 'HOTEL', label: 'Hotel Pet' },
  { value: 'DAYCARE', label: 'Daycare / Creche' }, { value: 'ADOPTION_CENTER', label: 'Centro de Adocao' },
];

type RegistrationType = 'choice' | 'business' | 'tutor' | 'professional';

export default function RegisterPage() {
  const [registrationType, setRegistrationType] = useState<RegistrationType>('choice');
  const [businessStep, setBusinessStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [business, setBusiness] = useState({ businessName: '', cnpj: '', businessPhone: '', businessEmail: '', businessTypes: [] as string[], userName: '', userEmail: '', userPhone: '', password: '', confirmPassword: '' });
  const [tutor, setTutor] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [professional, setProfessional] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', bio: '' });
  const router = useRouter();
  const { toast } = useToast();

  const returnToChoice = () => { setRegistrationType('choice'); setBusinessStep(1); };
  const toggleBusinessType = (type: string) => setBusiness((current) => ({
    ...current,
    businessTypes: current.businessTypes.includes(type) ? current.businessTypes.filter((item) => item !== type) : [...current.businessTypes, type],
  }));

  const handleBusinessSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (business.password !== business.confirmPassword) {
      toast({ title: 'As senhas nao conferem', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        businessName: business.businessName, cnpj: business.cnpj || undefined, businessPhone: business.businessPhone,
        businessEmail: business.businessEmail || undefined, businessTypes: business.businessTypes, userName: business.userName,
        userEmail: business.userEmail, userPhone: business.userPhone, password: business.password,
      });
      toast({ title: 'Conta criada com sucesso!' });
      router.push('/login?registered=true');
    } catch (error: any) {
      toast({ title: 'Erro ao criar conta', description: error.response?.data?.message || 'Tente novamente', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const handleTutorSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (tutor.password !== tutor.confirmPassword) {
      toast({ title: 'As senhas nao conferem', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/register/tutor', { name: tutor.name, email: tutor.email, phone: tutor.phone, password: tutor.password });
      toast({ title: 'Conta criada com sucesso!' });
      router.push('/login?registered=true');
    } catch (error: any) {
      toast({ title: 'Erro ao criar conta', description: error.response?.data?.message || 'Tente novamente', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const handleProfessionalSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (professional.password !== professional.confirmPassword) {
      toast({ title: 'As senhas nao conferem', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/register/professional', {
        name: professional.name,
        email: professional.email,
        phone: professional.phone,
        password: professional.password,
        bio: professional.bio || undefined,
      });
      toast({ title: 'Conta criada com sucesso!' });
      router.push('/login?registered=true');
    } catch (error: any) {
      toast({ title: 'Erro ao criar conta', description: error.response?.data?.message || 'Tente novamente', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const textInput = (label: string, value: string, setValue: (value: string) => void, options: { type?: string; placeholder?: string } = {}) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-[#121A48]">{label} *</label>
      <Input type={options.type} value={value} onChange={(event) => setValue(event.target.value)} placeholder={options.placeholder} required />
    </div>
  );

  const passwordFields = (data: { password: string; confirmPassword: string }, update: (data: { password: string; confirmPassword: string }) => void) => (
    <>
      {textInput('Senha', data.password, (password) => update({ ...data, password }), { type: 'password', placeholder: 'Minimo 6 caracteres' })}
      {textInput('Confirmar senha', data.confirmPassword, (confirmPassword) => update({ ...data, confirmPassword }), { type: 'password', placeholder: 'Repita a senha' })}
    </>
  );

  const description = registrationType === 'choice' ? 'Escolha como voce quer usar o Petou' : registrationType === 'tutor' ? 'Encontre servicos e cuide da rotina do seu pet' : registrationType === 'professional' ? 'Ofereca seus cuidados como profissional independente' : businessStep === 1 ? 'Dados do seu negocio' : 'Seus dados de acesso';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FFFAF3] via-[#fffdf8] to-[#eef1fb] p-4">
      <Card className="w-full max-w-lg border-[#121A48]/10 shadow-[0_16px_40px_-24px_rgba(18,26,72,0.45)]">
        <CardHeader className="text-center">
          <Link href="/" className="mb-2 block text-2xl font-bold text-[#121A48]">Petou</Link>
          <CardTitle className="text-[#121A48]">{registrationType === 'tutor' ? 'Criar conta de tutor' : registrationType === 'professional' ? 'Criar conta profissional' : 'Criar conta'}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {registrationType === 'choice' && (
            <div className="space-y-3">
              <button type="button" onClick={() => setRegistrationType('tutor')} className="w-full rounded-xl border border-[#2D3F7D]/20 bg-white p-5 text-left transition hover:border-[#F5AE2B] hover:bg-[#FFFAF3] focus:outline-none focus:ring-2 focus:ring-[#F5AE2B]">
                <span className="block text-base font-semibold text-[#121A48]">Sou tutor</span>
                <span className="mt-1 block text-sm text-slate-600">Quero encontrar servicos para o meu pet.</span>
              </button>
              <button type="button" onClick={() => setRegistrationType('business')} className="w-full rounded-xl border border-[#2D3F7D]/20 bg-white p-5 text-left transition hover:border-[#F5AE2B] hover:bg-[#FFFAF3] focus:outline-none focus:ring-2 focus:ring-[#F5AE2B]">
                <span className="block text-base font-semibold text-[#121A48]">Tenho um negocio pet</span>
                <span className="mt-1 block text-sm text-slate-600">Quero organizar meu negocio e ser encontrado por clientes.</span>
              </button>
              <button type="button" onClick={() => setRegistrationType('professional')} className="w-full rounded-xl border border-[#2D3F7D]/20 bg-white p-5 text-left transition hover:border-[#F5AE2B] hover:bg-[#FFFAF3] focus:outline-none focus:ring-2 focus:ring-[#F5AE2B]">
                <span className="block text-base font-semibold text-[#121A48]">Sou profissional pet</span>
                <span className="mt-1 block text-sm text-slate-600">Quero oferecer meus cuidados de forma independente.</span>
              </button>
            </div>
          )}

          {registrationType === 'tutor' && (
            <form onSubmit={handleTutorSubmit} className="space-y-4">
              {textInput('Nome', tutor.name, (name) => setTutor({ ...tutor, name }), { placeholder: 'Seu nome completo' })}
              {textInput('E-mail', tutor.email, (email) => setTutor({ ...tutor, email }), { type: 'email', placeholder: 'seu@email.com' })}
              {textInput('Telefone', tutor.phone, (phone) => setTutor({ ...tutor, phone }), { placeholder: '(11) 99999-9999' })}
              {passwordFields(tutor, (passwords) => setTutor({ ...tutor, ...passwords }))}
              <div className="flex gap-3"><Button type="button" variant="outline" className="flex-1" onClick={returnToChoice}>Voltar</Button><Button type="submit" className="flex-1" disabled={isLoading}>{isLoading ? 'Criando...' : 'Criar conta'}</Button></div>
            </form>
          )}

          {registrationType === 'professional' && (
            <form onSubmit={handleProfessionalSubmit} className="space-y-4">
              {textInput('Nome', professional.name, (name) => setProfessional({ ...professional, name }), { placeholder: 'Seu nome completo' })}
              {textInput('E-mail', professional.email, (email) => setProfessional({ ...professional, email }), { type: 'email', placeholder: 'seu@email.com' })}
              {textInput('Telefone', professional.phone, (phone) => setProfessional({ ...professional, phone }), { placeholder: '(11) 99999-9999' })}
              <div><label className="mb-1 block text-sm font-medium text-[#121A48]">Bio (opcional)</label><textarea value={professional.bio} onChange={(event) => setProfessional({ ...professional, bio: event.target.value })} placeholder="Conte brevemente sobre sua experiencia" className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
              {passwordFields(professional, (passwords) => setProfessional({ ...professional, ...passwords }))}
              <div className="flex gap-3"><Button type="button" variant="outline" className="flex-1" onClick={returnToChoice}>Voltar</Button><Button type="submit" className="flex-1" disabled={isLoading}>{isLoading ? 'Criando...' : 'Criar conta'}</Button></div>
            </form>
          )}

          {registrationType === 'business' && (
            <form onSubmit={handleBusinessSubmit} className="space-y-4">
              {businessStep === 1 ? <>
                {textInput('Nome do negocio', business.businessName, (businessName) => setBusiness({ ...business, businessName }), { placeholder: 'Ex: Pet Shop Feliz' })}
                <div><label className="mb-1 block text-sm font-medium text-[#121A48]">CNPJ (opcional)</label><Input value={business.cnpj} onChange={(event) => setBusiness({ ...business, cnpj: event.target.value })} placeholder="00.000.000/0000-00" /></div>
                {textInput('Telefone do negocio', business.businessPhone, (businessPhone) => setBusiness({ ...business, businessPhone }), { placeholder: '(11) 99999-9999' })}
                <div><label className="mb-1 block text-sm font-medium text-[#121A48]">E-mail do negocio (opcional)</label><Input type="email" value={business.businessEmail} onChange={(event) => setBusiness({ ...business, businessEmail: event.target.value })} placeholder="contato@seunegocio.com" /></div>
                <div><label className="mb-2 block text-sm font-medium text-[#121A48]">Tipo de negocio *</label><div className="grid grid-cols-2 gap-2">{businessTypeOptions.map((option) => <button key={option.value} type="button" onClick={() => toggleBusinessType(option.value)} className={`rounded-lg border p-3 text-sm transition-colors ${business.businessTypes.includes(option.value) ? 'border-[#121A48] bg-[#121A48] text-white' : 'border-[#2D3F7D]/20 bg-white text-[#121A48] hover:bg-[#FFFAF3]'}`}>{option.label}</button>)}</div></div>
                <div className="flex gap-3"><Button type="button" variant="outline" className="flex-1" onClick={returnToChoice}>Voltar</Button><Button type="button" className="flex-1" onClick={() => { if (!business.businessName || !business.businessPhone || business.businessTypes.length === 0) { toast({ title: 'Preencha todos os campos obrigatorios', variant: 'destructive' }); return; } setBusinessStep(2); }}>Continuar</Button></div>
              </> : <>
                {textInput('Seu nome', business.userName, (userName) => setBusiness({ ...business, userName }), { placeholder: 'Seu nome completo' })}
                {textInput('Seu e-mail', business.userEmail, (userEmail) => setBusiness({ ...business, userEmail }), { type: 'email', placeholder: 'seu@email.com' })}
                {textInput('Seu telefone', business.userPhone, (userPhone) => setBusiness({ ...business, userPhone }), { placeholder: '(11) 99999-9999' })}
                {passwordFields(business, (passwords) => setBusiness({ ...business, ...passwords }))}
                <div className="flex gap-3"><Button type="button" variant="outline" className="flex-1" onClick={() => setBusinessStep(1)}>Voltar</Button><Button type="submit" className="flex-1" disabled={isLoading}>{isLoading ? 'Criando...' : 'Criar conta'}</Button></div>
              </>}
            </form>
          )}

          <div className="mt-6 text-center text-sm"><span className="text-slate-600">Ja tem uma conta? </span><Link href="/login" className="font-medium text-[#2D3F7D] hover:underline">Entrar</Link></div>
        </CardContent>
      </Card>
    </div>
  );
}
