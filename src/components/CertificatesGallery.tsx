'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Award } from 'lucide-react'
import { certificatesData, Certificate } from '@/data/certificates'

export default function CertificatesGallery() {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  
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
  )

  return (
    <div className="w-full">
      {/* Carrusel */}
      <div className="overflow-hidden w-full py-8" ref={emblaRef}>
        <div className="flex touch-pan-y" style={{ backfaceVisibility: "hidden" }}>
          {certificatesData.map((cert) => (
            <div 
              key={cert.id} 
              className="flex-[0_0_80%] sm:flex-[0_0_300px] min-w-0 pl-4 sm:pl-6 relative cursor-pointer"
              onClick={() => setSelectedCert(cert)}
            >
              <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary border border-neutral/10 hover:shadow-md transition-shadow">
                
                {/* Fallback si no hay imagen */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-white">
                  <Award className="text-accent/30 mb-2" size={32} />
                  <p className="text-xs text-textMain/50 truncate w-full">{cert.filename}</p>
                </div>
                
                {/* Imagen Real */}
                <Image
                  src={`/certificates/${cert.filename}`}
                  alt={cert.title}
                  fill
                  className={`object-cover z-10 transition-transform duration-500 group-hover:scale-110 ${cert.rotationClass || ''}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0';
                  }}
                />
                
                {/* Overlay inferior con título */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 z-20 flex flex-col justify-end p-4">
                  <div className="inline-flex self-start items-center gap-1.5 bg-accent/90 text-white px-2 py-0.5 rounded-md text-[10px] font-semibold mb-1.5">
                    {cert.category}
                  </div>
                  <h4 className="text-white font-medium text-sm line-clamp-2 leading-tight">{cert.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedCert(null)}
          >
            <button 
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
              onClick={(e) => { e.stopPropagation(); setSelectedCert(null); }}
            >
              <X size={24} />
            </button>

            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative w-full h-[60vh] md:h-[75vh] flex items-center justify-center">
                <img
                  src={`/certificates/${selectedCert.filename}`}
                  alt={selectedCert.title}
                  className={`max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm ${selectedCert.rotationClass || ''}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/1e293b/94a3b8?text=Falta+Imagen\\n' + selectedCert.filename;
                  }}
                />
              </div>

              <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 mt-6 border border-white/10 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 bg-accent/20 text-accent-light px-2.5 py-1 rounded-md text-xs font-semibold mb-2">
                  {selectedCert.category}
                </div>
                <h3 className="text-xl sm:text-2xl font-serif text-white mb-1">{selectedCert.title}</h3>
                <p className="text-white/70 font-medium">{selectedCert.institution} &bull; {selectedCert.year}</p>
                {selectedCert.description && (
                  <p className="text-white/60 text-sm mt-3">{selectedCert.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
