'use client'

import React, { useRef, useState } from 'react'
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface CephImageUploaderProps {
  patientId: string
  onUploadComplete: (url: string, width: number, height: number) => void
}

export function CephImageUploader({ patientId, onUploadComplete }: CephImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // 1. Obtener dimensiones de la imagen antes de subirla
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      const width = img.naturalWidth
      const height = img.naturalHeight

      // 2. Subir a Supabase Storage (bucket: cases-images o uno dedicado)
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `cephalometry/${patientId}/${Date.now()}.${ext}`

      const { data, error: uploadError } = await supabase.storage
        .from('cases-images')
        .upload(path, file)

      if (uploadError) {
        throw uploadError
      }

      // Obtener URL pública o firmada
      const { data: urlData } = await supabase.storage
        .from('cases-images')
        .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 año temporalmente, luego se asienta en DB

      if (!urlData?.signedUrl) {
        throw new Error("No se pudo generar la URL de la imagen")
      }

      onUploadComplete(urlData.signedUrl, width, height)
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || 'Error al subir la imagen')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${
          isUploading 
            ? 'border-border bg-elevated/50 cursor-not-allowed opacity-70' 
            : 'border-border bg-surface hover:border-brand hover:bg-brand-soft/20 cursor-pointer'
        }`}
      >
        {isUploading ? (
          <Loader2 className="w-10 h-10 text-brand animate-spin mb-4" />
        ) : (
          <div className="w-14 h-14 bg-elevated rounded-full flex items-center justify-center shadow-sm mb-4">
            <Upload className="w-6 h-6 text-brand" />
          </div>
        )}
        
        <h3 className="text-lg font-serif font-bold text-text mb-2">
          {isUploading ? 'Procesando imagen...' : 'Subir Radiografía Lateral'}
        </h3>
        <p className="text-sm text-muted max-w-sm">
          {isUploading 
            ? 'Analizando dimensiones y subiendo a la nube de forma segura.' 
            : 'Haz clic aquí para seleccionar el archivo (JPG, PNG). Asegúrate de que sea una radiografía lateral de cráneo clara.'}
        </p>

        {error && (
          <p className="mt-4 text-sm text-danger bg-danger-soft px-3 py-1.5 rounded-lg border border-danger/20">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
