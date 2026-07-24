"use client";
import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const links = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#casos', label: 'Resultados' },
  { href: '#sobre-nosotros', label: 'Clínica' },
  { href: '#equipo', label: 'Equipo' },
  { href: '#contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass py-2.5 shadow-soft' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative h-11 w-11 rounded-xl overflow-hidden ring-1 ring-border shadow-soft shrink-0">
            <Image src="/images/logo.png" alt="Clínica Villarroel" fill className="object-cover scale-110" sizes="44px" />
          </div>
          <span className="font-serif text-lg md:text-xl text-text font-medium tracking-tight leading-none">
            Clínica <span className="text-brand">Villarroel</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-brand hover:bg-brand-soft px-4 py-2 rounded-full transition-all"
          >
            Ingresar
          </Link>
          <a
            href="https://wa.me/59172212402?text=Hola%2C%20quiero%20reservar%20un%20turno%20en%20Cl%C3%ADnica%20Villarroel."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent rounded-full shadow-lift"
          >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">Reservar por WhatsApp</span>
            <span className="sm:hidden">Reservar</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
