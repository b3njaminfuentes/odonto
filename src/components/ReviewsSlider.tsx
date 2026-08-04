"use client";
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { Star, CheckCircle, ExternalLink } from 'lucide-react';

export interface TestimonialItem {
  id?: string;
  name?: string;
  authorName?: string;
  text?: string;
  comment?: string;
  time?: string;
  rating?: number;
}

const defaultReviews = [
  { "name": "Juan Peñaloza", "text": "El consultorio respondió prontamente para la cita, buena comunicación y muy satisfecho con la atención de la Dra. Villarroel.", "time": "hace 2 meses" },
  { "name": "Dione Murillo", "text": "Excelente experiencia, la doctora muy amable y profesional. Instalaciones modernas y limpias, me sentí muy cómoda.", "time": "hace 1 año" },
  { "name": "el bigotes76", "text": "Trabaja con calma y gran cuidado, procedimiento cómodo y sin dolor, recuperación rápida y sin complicaciones.", "time": "hace 1 año" },
  { "name": "María de los Ángeles Bustamante", "text": "Cuentan con todas las especialidades. Recomendado al 100%. Un trabajo impecable, atención de primera.", "time": "hace 1 año" },
  { "name": "Luis Fernando Fuentes Espinoza", "text": "Personalmente la mejor experiencia en la clínica dental. Excelente atención, puntualidad y buen trabajo.", "time": "hace 2 años" },
  { "name": "Belén Centellas", "text": "La mejor de todas. Súper detallista en todo su trabajo.", "time": "hace 4 años" },
  { "name": "Alfredo Ángel Balderrama", "text": "Excelente atención, profesional y puntualidad. Los precios también son muy buenos.", "time": "hace 1 año" },
  { "name": "Norma Zurita Rosales", "text": "Excelente servicio y profesionalismo, ambientes limpios y equipos modernos.", "time": "hace 1 año" },
];

const colors = ["bg-brand", "bg-accent", "bg-brand-hover"];

interface ReviewsSliderProps {
  testimonials?: TestimonialItem[];
  mapsUrl?: string;
}

export default function ReviewsSlider({
  testimonials = [],
  mapsUrl = "https://maps.app.goo.gl/s56cVLy2Rd7aGTG87"
}: ReviewsSliderProps) {
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

  const list = testimonials.length > 0
    ? testimonials.map(t => ({
        name: t.authorName || t.name || 'Paciente',
        text: t.comment || t.text || '',
        time: t.time || 'Reciente',
        rating: t.rating || 5,
      }))
    : defaultReviews;

  return (
    <div className="overflow-hidden w-full py-8" ref={emblaRef}>
      <div className="flex touch-pan-y" style={{ backfaceVisibility: "hidden" }}>
        {list.map((review, i) => {
          const colorClass = colors[i % colors.length];
          const initial = review.name.charAt(0).toUpperCase();

          return (
            <div 
              key={i} 
              className="flex-[0_0_85%] sm:flex-[0_0_350px] min-w-0 pl-6 relative"
            >
              <div className="card p-6 h-full flex flex-col hover:shadow-lift transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-brand-fg font-serif font-bold ${colorClass}`}>
                    {initial}
                  </div>
                  <div>
                    <h4 className="font-medium text-text text-sm line-clamp-1">{review.name}</h4>
                    <p className="text-[11px] text-faint">{review.time}</p>
                  </div>
                </div>

                <div className="flex text-accent mb-3">
                  {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={12} fill="currentColor" />)}
                </div>

                <p className="text-muted text-sm leading-relaxed line-clamp-3 mb-6">
                  {review.text}
                </p>

                <div className="mt-auto flex items-center gap-1 text-[11px] text-faint pt-3 border-t border-border">
                  <CheckCircle size={10} className="text-accent" />
                  <span>Reseña verificada</span>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Final fixed card linking to Google Maps */}
        {mapsUrl && (
          <div className="flex-[0_0_85%] sm:flex-[0_0_350px] min-w-0 pl-6 relative">
            <a 
              href={mapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-brand-soft/50 p-6 rounded-2xl border border-brand/10 h-full flex flex-col items-center justify-center hover:bg-brand-soft transition-colors text-center group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center shadow-soft mb-4 text-brand group-hover:scale-110 transition-transform">
                <ExternalLink size={24} />
              </div>
              <h3 className="font-serif text-text text-lg mb-2">Ver reseñas verificadas</h3>
              <p className="text-muted text-sm">Lee más experiencias de nuestros pacientes</p>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
