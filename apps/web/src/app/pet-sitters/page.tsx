import Link from 'next/link';
import { Construction, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PetSittersPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFAF3] px-4 py-12">
      <Card className="w-full max-w-xl border-[#2D3F7D]/15 bg-white text-center shadow-card">
        <CardContent className="p-8 sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1cf] text-[#b96f0d]">
            <Construction className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-[#121A48]">Profissionais independentes</h1>
          <p className="mt-3 text-slate-600">Esta área está em construção. O cadastro profissional já está disponível, mas perfis públicos, serviços e localização serão liberados em uma próxima etapa.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register"><Button className="w-full sm:w-auto"><PawPrint className="mr-2 h-4 w-4" />Cadastrar como profissional</Button></Link>
            <Link href="/"><Button variant="outline" className="w-full sm:w-auto">Voltar ao início</Button></Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
