import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { MuelitaChat } from "@/components/chat/MuelitaChat";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({ 
  subsets: ["latin"],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Clínica Odontológica Villarroel | Odontología y Estética en Cochabamba",
  description: "Clínica odontológica líder en Cochabamba con más de 20 años de experiencia. Especialistas en implantes dentales, ortodoncia, carillas y estética dental.",
  keywords: ["dentista cochabamba", "implantes dentales cochabamba", "ortodoncia", "carillas dentales", "clínica dental", "odontología estética", "blanqueamiento dental"],
  openGraph: {
    title: "Clínica Odontológica Villarroel",
    description: "Recuperá la sonrisa que merecés con precisión y calidez. Agenda tu cita hoy.",
    url: "https://clinica-villarroel.vercel.app",
    siteName: "Clínica Villarroel",
    locale: "es_BO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-bg">
        <SmoothScroll>
          {children}
          <MuelitaChat />
        </SmoothScroll>
      </body>
    </html>
  );
}
