'use client'

import { useState } from 'react'
import { rotateCertificate } from './actions'
import { certificatesData, Certificate } from '@/data/certificates'
import { RotateCw, CheckCircle2 } from 'lucide-react'

export default function CertMapperPage() {
  const [certs, setCerts] = useState<Certificate[]>(certificatesData)
  const [loadingFile, setLoadingFile] = useState<string | null>(null)

  const handleRotate = async (filename: string, currentRotationClass: string = '') => {
    setLoadingFile(filename)
    
    // Calcula la siguiente rotacion
    let nextRotation = ''
    if (currentRotationClass === '') nextRotation = 'rotate-90'
    else if (currentRotationClass === 'rotate-90') nextRotation = 'rotate-180'
    else if (currentRotationClass === 'rotate-180') nextRotation = '-rotate-90'
    else if (currentRotationClass === '-rotate-90') nextRotation = ''

    // Actualiza UI optimista
    setCerts(prev => prev.map(c => c.filename === filename ? { ...c, rotationClass: nextRotation } : c))

    // Llama al servidor para guardar en archivo
    const res = await rotateCertificate(filename, nextRotation)
    if (!res.success) {
      alert("Error al rotar: " + res.error)
      // Revertir si falla
      setCerts(prev => prev.map(c => c.filename === filename ? { ...c, rotationClass: currentRotationClass } : c))
    }
    
    setLoadingFile(null)
  }

  return (
    <div className="min-h-screen bg-secondary p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-serif text-primary mb-2">Rotación de Certificados</h1>
            <p className="text-textMain/70">
              Si alguna imagen aparece de lado en el carrusel de la página principal, busca la imagen aquí y haz clic en "Rotar" hasta que quede derecha. Los cambios se guardan automáticamente y se reflejan al instante.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {certs.map(cert => (
              <div key={cert.id} className="bg-secondary/50 rounded-2xl overflow-hidden border border-neutral/10 flex flex-col">
                <div className="aspect-square relative bg-neutral/5 flex items-center justify-center p-2 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`/certificates/${cert.filename}`} 
                    alt={cert.filename} 
                    className={`max-w-full max-h-full object-contain transition-transform duration-300 ${cert.rotationClass || ''}`}
                  />
                </div>
                <div className="p-4 bg-white flex flex-col items-center justify-between flex-1 border-t border-neutral/10">
                  <p className="text-[10px] text-textMain/40 mb-3 truncate w-full text-center" title={cert.filename}>
                    {cert.filename}
                  </p>
                  
                  <button 
                    onClick={() => handleRotate(cert.filename, cert.rotationClass)}
                    disabled={loadingFile === cert.filename}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {loadingFile === cert.filename ? (
                      <span className="animate-spin"><RotateCw size={16} /></span>
                    ) : (
                      <>
                        <RotateCw size={16} /> Rotar 90°
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
