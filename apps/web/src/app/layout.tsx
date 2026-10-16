import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Petou - Sistema Completo para Negocios Pet",
  description:
    "Petou: plataforma completa para gestao de clinicas veterinarias, pet shops, hoteis e daycares.",
  icons: {
    icon: "/images/petou-logo.jpeg",
  },
  openGraph: {
    title: "Petou - Sistema Completo para Negocios Pet",
    description: "A plataforma completa para gestao de negocios pet.",
    images: ["/images/petou-logo.jpeg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
