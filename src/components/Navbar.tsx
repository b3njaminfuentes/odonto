"use client";
import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <a href="#" className="flex items-center gap-2 group">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden shadow-md border border-white/40 shrink-0">
            <img src="/images/logo.png" alt="Logo" className="h-full w-full object-cover scale-110" />
          </div>
          <span className="font-serif text-lg sm:text-xl md:text-2xl text-primary font-medium tracking-tight">Clínica Odontológica Villarroel</span>
        </a>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-textMain/80">
          <Link href="#servicios" className="hover:text-primary transition-colors">Servicios</Link>
          <Link href="#clinica" className="hover:text-primary transition-colors">Clínica</Link>
          <Link href="#equipo" className="hover:text-primary transition-colors">Equipo</Link>
          <Link href="#contacto" className="hover:text-primary transition-colors">Contacto</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="hidden sm:flex text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 px-5 py-2.5 rounded-full transition-all items-center gap-1"
          >
            Ingresar
          </Link>
          <a 
            href="https://wa.me/59172212402?text=Hola%2C%20quiero%20reservar%20un%20turno%20en%20Cl%C3%ADnica%20Villarroel." 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover-scale shadow-lg shadow-primary/20 transition-all"
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
