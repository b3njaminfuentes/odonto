'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Upload, Image as ImageIcon, X, Loader2, File } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getPatientMedia, saveMediaRecord, deleteMediaRecord } from '@/app/admin/pacientes/gallery-actions'

interface GalleryViewerProps {
  patientId: string
}

export function GalleryViewer({ patientId }: GalleryViewerProps) {
  const [images, setImages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const loadMedia = async () => {
    setIsLoading(true)
    const media = await getPatientMedia(patientId)
    setImages(media)
    setIsLoading(false)
  }

  useEffect(() => {
    loadMedia()
  }, [patientId])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // 1. Upload to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${patientId}/${Math.random().toString(36).substring(2)}.${fileExt}`
      
      // Select bucket based on file type
      let bucket = 'cases-images'
      if (file.type.includes('pdf')) {
        bucket = 'documents'
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Save DB record
      const category = file.type.includes('pdf') ? 'document' : 'image'
      await saveMediaRecord({
        patientId,
        bucket,
        fileUrl: fileName,
        category,
        title: file.name,
        mimeType: file.type,
        size: file.size
      })

      // 3. Reload
      await loadMedia()
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir el archivo')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: string, bucket: string, fileUrl: string) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return
    
    setImages(images.filter(img => img.id !== id))
    await deleteMediaRecord(id, bucket, fileUrl, patientId)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-slate-900">Galería del Paciente</h2>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,application/pdf"
          onChange={handleFileChange}
        />
        <button 
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center gap-2 bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Subida rápida */}
          <div 
            onClick={handleUploadClick}
            className="border border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-400 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-600 transition-all cursor-pointer min-h-[200px]"
          >
            <Upload className="w-8 h-8 mb-2" />
            <p className="text-sm font-medium">Click aquí para subir</p>
            <p className="text-xs mt-1">Imágenes, Radiografías o PDFs</p>
          </div>

          {/* Imágenes y Archivos */}
          {images.map((img) => (
            <div key={img.id} className="group relative bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-slate-100 relative flex items-center justify-center">
                {img.category === 'document' ? (
                  <File className="w-16 h-16 text-slate-400" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={img.signedUrl} 
                    alt={img.description}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDelete(img.id, img.bucket, img.fileUrl)}
                    className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate" title={img.description}>{img.description}</h4>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    {img.category === 'document' ? 'DOC' : 'IMG'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(new Date(img.createdAt))}
                </p>
                {img.category === 'document' && (
                  <a href={img.signedUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 text-xs font-medium hover:underline mt-2 inline-block">
                    Ver documento
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
