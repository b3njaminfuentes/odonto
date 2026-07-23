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
                
                {/* Imagen Real */}
                <Image
                  src={`/certificates/${cert.filename}`}
                  alt="Certificado"
                  fill
                  className={`object-cover z-10 transition-transform duration-500 group-hover:scale-110 ${cert.rotationClass || ''}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0';
                  }}
                />
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
              <div className="relative w-full h-[80vh] flex items-center justify-center">
                <img
                  src={`/certificates/${selectedCert.filename}`}
                  alt="Certificado"
                  className={`max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm ${selectedCert.rotationClass || ''}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/1e293b/94a3b8?text=Falta+Imagen\\n' + selectedCert.filename;
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
