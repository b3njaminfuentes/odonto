"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MessageCircle, Star, ShieldCheck } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      {/* Fondo: manchas orgánicas salvia/coral */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute top-40 -right-16 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Columna texto */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="eyebrow mb-5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Odontología y estética · Cochabamba
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="text-4xl md:text-6xl font-serif text-text leading-[1.05] tracking-tight mb-6"
          >
            Recuperá la sonrisa <br className="hidden md:block" />
            que <span className="text-brand italic">merecés</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="text-lg text-muted mb-9 max-w-lg leading-relaxed"
          >
            Implantología y odontología estética de alta precisión, en un ambiente
            cálido pensado para tu tranquilidad.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <a
              href="https://wa.me/59172212402?text=Hola%2C%20quiero%20reservar%20una%20consulta."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent px-7 py-3.5 rounded-full text-base"
            >
              <MessageCircle size={19} />
              Reservar consulta
            </a>
            <a href="#casos" className="btn-outline px-7 py-3.5 rounded-full text-base">
              Ver resultados
            </a>
          </motion.div>

          {/* Prueba social */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex items-center gap-6 text-sm"
          >
            <div className="flex items-center gap-1.5 text-muted">
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="fill-current" />
                ))}
              </div>
              <span className="font-medium text-text">+20 años</span> de experiencia
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-muted">
              <ShieldCheck size={16} className="text-brand" />
              Bioseguridad certificada
            </div>
          </motion.div>
        </div>

        {/* Columna imagen */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease }}
          className="relative"
        >
          <div className="relative aspect-[4/5] max-w-md mx-auto rounded-[2rem] overflow-hidden shadow-lift ring-1 ring-border">
            <Image
              src="/images/paciente.png"
              alt="Paciente sonriendo en Clínica Villarroel"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand/25 via-transparent to-transparent" />
          </div>

          {/* Tarjeta flotante */}
          <div className="absolute -bottom-5 -left-2 sm:left-4 card px-5 py-4 flex items-center gap-3 animate-float">
            <div className="h-11 w-11 rounded-full bg-brand-soft grid place-items-center text-brand font-serif text-lg">
              +2k
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-text">Sonrisas transformadas</p>
              <p className="text-xs text-muted">pacientes que confían en nosotros</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
