'use client'

import React, { useState } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'

interface GalleryViewerProps {
  patientId: string
}

export function GalleryViewer({ patientId }: GalleryViewerProps) {
  // En la Fase de backend, esto leerá los buckets de 'radiographs' o 'cases-images'
  const [images] = useState([
    { id: 1, type: 'radiograph', url: 'https://images.unsplash.com/photo-1584820927498-cafe4c071726?auto=format&fit=crop&q=80&w=400', date: '10 Oct 2026', title: 'Panorámica Inicial' },
    { id: 2, type: 'photo', url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=400', date: '10 Oct 2026', title: 'Intraoral Frontal' },
  ])

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-gray-900">Galería del Paciente</h2>
        <button className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl font-medium transition-colors text-sm">
          <Upload className="w-4 h-4" />
          Subir Archivo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Subida rápida */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-400 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all cursor-pointer min-h-[200px]">
          <Upload className="w-8 h-8 mb-2" />
          <p className="text-sm font-medium">Arrastra radiografías aquí</p>
          <p className="text-xs mt-1">o haz click para buscar</p>
        </div>

        {/* Imágenes */}
        {images.map((img) => (
          <div key={img.id} className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm card-hover">
            <div className="aspect-[4/3] bg-gray-900 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img.url} 
                alt={img.title}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-gray-900 text-sm truncate">{img.title}</h4>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {img.type === 'radiograph' ? 'RX' : 'Foto'}
                </span>
              </div>
              <p className="text-xs text-gray-500">{img.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
