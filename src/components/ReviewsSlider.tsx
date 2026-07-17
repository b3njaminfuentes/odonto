"use client";
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { Star, CheckCircle, ExternalLink } from 'lucide-react';

const reviews = [
  { "name": "Juan Peñaloza", "text": "El consultorio respondió prontamente para la cita, buena comunicación y muy satisfecho con la atención de la Dra. Villarroel.", "time": "hace 2 meses" },
  { "name": "Dione Murillo", "text": "Excelente experiencia, la doctora muy amable y profesional. Instalaciones modernas y limpias, me sentí muy cómoda.", "time": "hace 1 año" },
  { "name": "el bigotes76", "text": "Trabaja con calma y gran cuidado, procedimiento cómodo y sin dolor, recuperación rápida y sin complicaciones.", "time": "hace 1 año" },
  { "name": "María de los Ángeles Bustamante", "text": "Cuentan con todas las especialidades. Recomendado al 100%. Un trabajo impecable, atención de primera.", "time": "hace 1 año" },
  { "name": "Luis Fernando Fuentes Espinoza", "text": "Personalmente la mejor experiencia en la clínica dental. Excelente atención, puntualidad y buen trabajo.", "time": "hace 2 años" },
  { "name": "Belén Centellas", "text": "La mejor de todas. Súper detallista en todo su trabajo.", "time": "hace 4 años" },
  { "name": "Alfredo Ángel Balderrama", "text": "Excelente atención, profesional y puntualidad. Los precios también son muy buenos.", "time": "hace 1 año" },
  { "name": "Norma Zurita Rosales", "text": "Excelente servicio y profesionalismo, ambientes limpios y equipos modernos.", "time": "hace 1 año" },
  { "name": "Cahuasiri López Ambar", "text": "La doctora fue muy amable y paciente, buen servicio.", "time": "hace 9 meses" },
  { "name": "Cesar Ricardo Santa Cruz Pérez", "text": "Excelente profesional y un trabajo de calidad.", "time": "hace 8 meses" },
  { "name": "Boris Gonzales", "text": "Excelente atención y profesionalidad.", "time": "hace 1 año" },
  { "name": "Mauricio Nogales Villarroel", "text": "Excelente atención y calidad de servicio.", "time": "hace 1 año" },
  { "name": "Carola Peña", "text": "Excelente profesional, atención de primera.", "time": "hace 1 año" },
  { "name": "Dani Sánchez", "text": "Muy ameno y cómodo, increíble doctora.", "time": "hace 2 años" },
  { "name": "Angela Nunes", "text": "Excelente trabajo, muy recomendado.", "time": "hace 1 año" },
  { "name": "Cinthia Diana Peña Espinoza", "text": "Excelente atención.", "time": "hace 1 año" },
  { "name": "Jaqueline Estrada", "text": "Excelente.", "time": "hace 1 año" },
  { "name": "Sol Abril", "text": "Excelente atención.", "time": "hace 4 años" },
  { "name": "María Elena Villarroel", "text": "Excelente atención. Profesional de alto nivel y experiencia.", "time": "hace 1 año" }
];

const colors = ["bg-primary", "bg-accent", "bg-neutral"];

export default function ReviewsSlider() {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true },
    [
      AutoScroll({
        playOnInit: true,
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      })
    ]
  );

  return (
    <div className="overflow-hidden w-full py-8" ref={emblaRef}>
      <div className="flex touch-pan-y" style={{ backfaceVisibility: "hidden" }}>
        {reviews.map((review, i) => {
          const colorClass = colors[i % colors.length];
          const initial = review.name.charAt(0).toUpperCase();

          return (
            <div 
              key={i} 
              className="flex-[0_0_85%] sm:flex-[0_0_350px] min-w-0 pl-6 relative"
            >
              <div className="bg-white p-6 rounded-2xl border border-neutral/10 h-full flex flex-col hover:shadow-soft transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-serif font-bold ${colorClass}`}>
                    {initial}
                  </div>
                  <div>
                    <h4 className="font-medium text-primary text-sm line-clamp-1">{review.name}</h4>
                    <p className="text-[11px] text-textMain/50">{review.time}</p>
                  </div>
                </div>
                
                <div className="flex text-accent mb-3">
                  {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={12} fill="currentColor" />)}
                </div>
                
                <p className="text-textMain/80 text-sm leading-relaxed line-clamp-3 mb-6">
                  {review.text}
                </p>
                
                <div className="mt-auto flex items-center gap-1 text-[11px] text-textMain/50 pt-3 border-t border-neutral/10">
                  <CheckCircle size={10} className="text-accent" />
                  <span>Reseña verificada de Google</span>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Final fixed card linking to Google Maps */}
        <div className="flex-[0_0_85%] sm:flex-[0_0_350px] min-w-0 pl-6 relative">
          <a 
            href="https://maps.app.goo.gl/s56cVLy2Rd7aGTG87" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-primary/5 p-6 rounded-2xl border border-primary/10 h-full flex flex-col items-center justify-center hover:bg-primary/10 transition-colors text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 text-primary group-hover:scale-110 transition-transform">
              <ExternalLink size={24} />
            </div>
            <h3 className="font-serif text-primary text-lg mb-2">Ver todas las reseñas en Google</h3>
            <p className="text-textMain/60 text-sm">Lee más experiencias de nuestros pacientes</p>
          </a>
        </div>
      </div>
    </div>
  );
}
