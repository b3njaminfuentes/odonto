"use client";
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 to-secondary z-10" />
        {/* Placeholder image, should be a real clinic photo */}
        <div className="w-full h-full bg-[url('/images/paciente.png')] bg-cover bg-center opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
        <div className="max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif text-primary leading-tight mb-6"
          >
            Recuperá la sonrisa que merecés.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-textMain/80 mb-10 max-w-2xl leading-relaxed"
          >
            Implantología y odontología estética de alta precisión, en un ambiente pensado para tu tranquilidad.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a 
              href="https://wa.me/59172212402" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-primary text-white px-8 py-4 rounded-full text-center font-medium hover-scale shadow-xl shadow-primary/20"
            >
              Reservar consulta
            </a>
            <a 
              href="#casos" 
              className="border border-primary/20 text-primary px-8 py-4 rounded-full text-center font-medium hover:bg-primary/5 hover-scale transition-colors"
            >
              Ver resultados de pacientes
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
