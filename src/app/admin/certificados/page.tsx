'use client'

import { useEffect, useState } from 'react'
import { getUnmappedImages, renameImage } from './actions'
import { certificatesData } from '@/data/certificates'
import { Check, Image as ImageIcon, RefreshCw } from 'lucide-react'

export default function CertMapperPage() {
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const mappedFilenames = certificatesData.map(c => c.filename)

  const loadFiles = async () => {
    setLoading(true)
    const allFiles = await getUnmappedImages()
    // Solo mostrar los que NO han sido asignados correctamente aún
    const pending = allFiles.filter(f => !mappedFilenames.includes(f))
    setFiles(pending)
    setLoading(false)
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const handleAssign = async (oldName: string, certId: string) => {
    const targetCert = certificatesData.find(c => c.id === certId)
    if (!targetCert) return

    const res = await renameImage(oldName, targetCert.filename)
    if (res.success) {
      setFiles(prev => prev.filter(f => f !== oldName))
    } else {
      alert("Error al renombrar: " + res.error)
    }
  }

  if (loading) return <div className="p-10">Cargando imágenes...</div>

  return (
    <div className="min-h-screen bg-secondary p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-serif text-primary mb-2">Asistente de Certificados</h1>
              <p className="text-textMain/70">
                Arrastra todas tus fotos a <code>public/certificates</code>. Luego, asígnales el título correcto aquí abajo. 
                Yo me encargo de renombrar el archivo y aplicarle la rotación automática en la web.
              </p>
            </div>
            <button onClick={loadFiles} className="bg-primary/10 text-primary p-3 rounded-full hover:bg-primary/20">
              <RefreshCw size={24} />
            </button>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-neutral/20 rounded-2xl">
              <ImageIcon className="mx-auto text-neutral/30 mb-4" size={48} />
              <h3 className="text-xl font-medium text-textMain mb-2">No hay fotos pendientes</h3>
              <p className="text-textMain/60">Pon más fotos en la carpeta public/certificates para mapearlas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map(file => (
                <div key={file} className="bg-secondary/50 rounded-2xl overflow-hidden border border-neutral/10">
                  <div className="aspect-square relative bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`/certificates/${file}`} 
                      alt={file} 
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-xs text-textMain/50 mb-3 truncate" title={file}>Archivo actual: {file}</p>
                    <select 
                      className="w-full p-2 border border-neutral/20 rounded-lg text-sm bg-white mb-3"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssign(file, e.target.value)
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Selecciona el certificado real...</option>
                      {certificatesData.map(cert => (
                        <option 
                          key={cert.id} 
                          value={cert.id}
                          disabled={!files.includes(cert.filename) && mappedFilenames.includes(cert.filename)} // Si ya se usó, no lo mostramos (opcional)
                        >
                          {cert.title} ({cert.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
