import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Dog,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Store,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Search,
    title: "Busque um serviço",
    text: "Encontre opções para o que seu pet precisa.",
  },
  {
    icon: MapPin,
    title: "Veja perto de você",
    text: "Conheça profissionais e negócios da sua região.",
  },
  {
    icon: MessageCircle,
    title: "Entre em contato",
    text: "Converse direto com quem vai cuidar do seu pet.",
  },
];

const categories = [
  [Stethoscope, "Veterinários", "Cuidados para a saúde do seu pet."],
  [Sparkles, "Banho e tosa", "Higiene e bem-estar para o dia a dia."],
  [Dog, "Pet sitters", "Companhia e cuidado quando você precisar."],
  [CalendarDays, "Hospedagem", "Opções para deixar seu pet bem cuidado."],
  [ShoppingBag, "Pet shops", "Produtos e serviços perto de você."],
  [Heart, "Adoção", "Conexões que podem mudar uma história."],
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fffaf3] text-[#121a48]">
      <header className="sticky top-0 z-50 border-b border-[#eee4d3] bg-[#fffaf3]/95 backdrop-blur">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" aria-label="Petou">
            <Image
              src="/images/petou-logo.jpeg"
              alt="Petou"
              width={112}
              height={70}
              className="h-14 w-auto"
              priority
            />
          </Link>
          <nav className="hidden gap-7 text-sm font-medium text-[#2d3f7d] md:flex">
            <a href="#como-funciona" className="hover:text-[#e89a1b]">
              Como funciona
            </a>
            <a href="#servicos" className="hover:text-[#e89a1b]">
              Serviços
            </a>
            <a href="#prestadores" className="hover:text-[#e89a1b]">
              Para prestadores
            </a>
          </nav>
          <div className="flex gap-2">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/pet-sitters">
              <Button className="bg-[#121a48] text-white hover:bg-[#2d3f7d]">
                Encontrar serviços
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_#ffe0a1_0,_transparent_32%),radial-gradient(circle_at_bottom_left,_#dce4ff_0,_transparent_35%)]" />
          <div className="container mx-auto grid items-center gap-12 px-4 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#fff1cf] px-4 py-2 text-sm font-semibold text-[#8c520a]">
                <MapPin className="h-4 w-4" />
                Cuidado pet mais perto de você
              </p>
              <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
                Encontre quem cuida do seu pet — e faça seu negócio pet crescer.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#2d3f7d]">
                O Petou conecta tutores a serviços da região e ajuda pequenos
                negócios pet a se organizarem para atender melhor e serem
                encontrados.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/pet-sitters">
                  <Button
                    size="lg"
                    className="w-full bg-[#f5ae2b] px-7 text-[#121a48] hover:bg-[#e89a1b] sm:w-auto"
                  >
                    Buscar serviços <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-[#121a48]/20 bg-white text-[#121a48] hover:bg-[#eef1ff] sm:w-auto"
                  >
                    Sou prestador
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-5 text-sm text-[#2d3f7d]">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#e89a1b]" />
                  Escolhas mais informadas
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#e89a1b]" />
                  Contato direto
                </span>
              </div>
            </div>
            <Card className="overflow-hidden border-0 bg-[#121a48] shadow-[0_24px_60px_-30px_rgba(18,26,72,0.7)]">
              <CardContent className="p-7 text-white md:p-8">
                <div className="mb-7 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#dce4ff]">
                    Descubra serviços locais
                  </span>
                  <div className="rounded-xl bg-[#f5ae2b] p-2 text-[#121a48]">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 text-[#121a48]">
                  <div className="flex gap-3 rounded-xl bg-[#fffaf3] p-3 text-sm text-[#2d3f7d]">
                    <Search className="h-5 w-5 text-[#e89a1b]" />O que você
                    procura para seu pet?
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <p className="rounded-xl border border-[#eee4d3] p-3 text-sm font-semibold">
                      Veterinários
                    </p>
                    <p className="rounded-xl border border-[#eee4d3] p-3 text-sm font-semibold">
                      Pet sitters
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-sm text-[#dce4ff]">
                  Conexões para cada fase do seu pet.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          id="como-funciona"
          className="border-y border-[#eee4d3] bg-white py-16 md:py-20"
        >
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#e89a1b]">
                Como funciona
              </p>
              <h2 className="text-3xl font-bold md:text-4xl">
                Cuidar fica mais simples quando encontrar é fácil.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <Card
                  key={step.title}
                  className="border-[#eee4d3] bg-[#fffdf8]"
                >
                  <CardContent className="p-7">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="rounded-2xl bg-[#eef1ff] p-3 text-[#2d3f7d]">
                        <step.icon className="h-6 w-6" />
                      </div>
                      <span className="text-2xl font-bold text-[#f5ae2b]">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="mt-3 text-[#2d3f7d]">{step.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="servicos" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#e89a1b]">
                  Serviços
                </p>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Tudo para o bem-estar do seu pet.
                </h2>
              </div>
              <Link href="/pet-sitters">
                <Button
                  variant="outline"
                  className="border-[#121a48]/20 bg-white hover:bg-[#fff1cf]"
                >
                  Ver opções disponíveis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map(([Icon, title, text]) => (
                <Link href="/pet-sitters" key={title} className="group">
                  <Card className="h-full border-[#eee4d3] bg-white transition-all hover:-translate-y-1 hover:border-[#f5ae2b] hover:shadow-lg">
                    <CardContent className="flex gap-4 p-6">
                      <div className="h-fit rounded-xl bg-[#fff1cf] p-3 text-[#b96f0d] group-hover:bg-[#f5ae2b] group-hover:text-[#121a48]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold">{title}</h3>
                        <p className="mt-1 text-sm text-[#2d3f7d]">{text}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#121a48] py-16 text-white md:py-20">
          <div className="container mx-auto grid items-center gap-10 px-4 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#f8bc47]">
                Para tutores
              </p>
              <h2 className="text-3xl font-bold md:text-4xl">
                Mais clareza para encontrar um cuidado que combina com seu pet.
              </h2>
              <p className="mt-5 text-[#dce4ff]">
                Explore serviços por categoria e localização, conheça melhor os
                prestadores e converse com quem pode ajudar.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-5">
                <Search className="mb-4 h-6 w-6 text-[#f5ae2b]" />
                <h3 className="font-bold">Busca objetiva</h3>
                <p className="mt-2 text-sm text-[#dce4ff]">
                  Encontre opções para a necessidade do momento.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5">
                <ShieldCheck className="mb-4 h-6 w-6 text-[#f5ae2b]" />
                <h3 className="font-bold">Escolha consciente</h3>
                <p className="mt-2 text-sm text-[#dce4ff]">
                  Informações para decidir com mais segurança.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="prestadores" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid overflow-hidden rounded-3xl border border-[#eee4d3] bg-white lg:grid-cols-[.9fr_1.1fr]">
              <div className="bg-[#fff1cf] p-8 md:p-12">
                <Store className="mb-6 h-10 w-10 text-[#b96f0d]" />
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#b96f0d]">
                  Para prestadores
                </p>
                <h2 className="text-3xl font-bold">
                  Organize seu negócio e fique mais fácil de encontrar.
                </h2>
              </div>
              <div className="p-8 md:p-12">
                <p className="text-[#2d3f7d]">
                  O Petou reúne o essencial para a rotina do seu negócio pet e,
                  ao mesmo tempo, ajuda novos tutores a conhecerem o seu
                  serviço.
                </p>
                <div className="mt-7 grid gap-3 text-sm text-[#121a48] sm:grid-cols-2">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#e89a1b]" />
                    Clientes e pets
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#e89a1b]" />
                    Agenda e serviços
                  </span>
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-[#e89a1b]" />
                    Produtos e estoque
                  </span>
                  <span className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-[#e89a1b]" />
                    Vendas e PDV
                  </span>
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#e89a1b]" />
                    Financeiro
                  </span>
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-[#e89a1b]" />
                    Atendimento e presença digital
                  </span>
                </div>
                <p className="mt-6 text-sm font-medium text-[#2d3f7d]">
                  Menos tempo procurando informações. Mais tempo cuidando de
                  pets e clientes.
                </p>
                <Link href="/register" className="mt-8 inline-block">
                  <Button className="bg-[#121a48] text-white hover:bg-[#2d3f7d]">
                    Cadastrar meu serviço{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl bg-gradient-to-r from-[#121a48] to-[#2d3f7d] px-6 py-12 text-center text-white md:py-16">
              <h2 className="text-3xl font-bold md:text-4xl">
                Seu pet merece cuidado por perto.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[#dce4ff]">
                Comece a descobrir serviços e profissionais que podem fazer
                parte da rotina do seu pet.
              </p>
              <Link href="/pet-sitters" className="mt-8 inline-block">
                <Button
                  size="lg"
                  className="bg-[#f5ae2b] px-8 text-[#121a48] hover:bg-[#e89a1b]"
                >
                  Encontrar serviços <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#1c2a61] bg-[#121a48] py-8 text-[#dce4ff]">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 text-sm sm:flex-row">
          <span>Petou — conectando quem ama com quem cuida.</span>
          <Link href="/login" className="hover:text-[#f5ae2b]">
            Entrar
          </Link>
        </div>
      </footer>
    </div>
  );
}
