'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Award } from 'lucide-react'
import { certificatesData, Certificate, CertificateCategory } from '@/data/certificates'

export default function CertificatesGallery() {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  const [activeCategory, setActiveCategory] = useState<CertificateCategory | 'Todos'>('Todos')

  const categories: (CertificateCategory | 'Todos')[] = [
    'Todos',
    ...Array.from(new Set(certificatesData.map(c => c.category)))
  ]

  const filteredCerts = activeCategory === 'Todos' 
    ? certificatesData 
    : certificatesData.filter(c => c.category === activeCategory)

  return (
    <div className="w-full">
      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-textMain/70 hover:bg-secondary border border-neutral/10'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AnimatePresence>
          {filteredCerts.map((cert) => (
            <motion.div
              key={cert.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-secondary border border-neutral/10 cursor-pointer hover:shadow-lg"
              onClick={() => setSelectedCert(cert)}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-white">
                <Award className="text-accent/30 mb-2" size={32} />
                <p className="text-xs text-textMain/50 truncate w-full">{cert.filename}</p>
              </div>
              
              <Image
                src={`/certificates/${cert.filename}`}
                alt={cert.title}
                fill
                className={`object-cover z-10 transition-transform duration-500 group-hover:scale-110 ${cert.rotationClass || ''}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col justify-end p-4">
                <h4 className="text-white font-medium text-sm line-clamp-2 leading-tight mb-1">{cert.title}</h4>
                <p className="text-white/70 text-xs truncate">{cert.institution}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
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

              <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 mt-6 border border-white/10">
                <div className="inline-flex items-center gap-1.5 bg-accent/20 text-accent px-2.5 py-1 rounded-md text-xs font-semibold mb-2">
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
