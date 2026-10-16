import Link from 'next/link';
import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CadastroPetSitterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFAF3] px-4 py-12">
      <Card className="w-full max-w-xl border-[#2D3F7D]/15 bg-white text-center shadow-card">
        <CardContent className="p-8 sm:p-10">
          <Construction className="mx-auto h-10 w-10 text-[#E89A1B]" />
          <h1 className="mt-5 text-2xl font-bold text-[#121A48]">Cadastro profissional atualizado</h1>
          <p className="mt-3 text-slate-600">A configuração de perfil, serviços e localização está em construção. Use o cadastro principal para criar sua conta profissional.</p>
          <Link href="/register" className="mt-7 inline-block"><Button>Criar conta profissional</Button></Link>
        </CardContent>
      </Card>
    </main>
  );
}
