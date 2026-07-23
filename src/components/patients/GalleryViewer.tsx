'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Upload, Image as ImageIcon, X, Loader2, File, Edit2, Eye, EyeOff, Save } from 'lucide-react'
import { getPatientMedia, uploadPatientMedia, deleteMediaRecord, updateMediaRecord } from '@/app/admin/pacientes/gallery-actions'

interface GalleryViewerProps {
  patientId: string
}

export function GalleryViewer({ patientId }: GalleryViewerProps) {
  const [images, setImages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMedia, setEditingMedia] = useState<any | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [mediaForm, setMediaForm] = useState({ description: '', visibleToPatient: false })
  const [error, setError] = useState<string | null>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setPendingFile(file)
    setMediaForm({ description: file.name, visibleToPatient: false })
    setEditingMedia(null)
    setIsModalOpen(true)
    
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openEditModal = (img: any) => {
    setEditingMedia(img)
    setPendingFile(null)
    setMediaForm({ description: img.description || '', visibleToPatient: img.visibleToPatient || false })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setPendingFile(null)
    setEditingMedia(null)
  }

  const handleSaveModal = async () => {
    setIsUploading(true)
    setError(null)
    try {
      if (pendingFile) {
        // Subida vía server action (service-role), robusta ante RLS de Storage.
        const fd = new FormData()
        fd.append('file', pendingFile)
        fd.append('patientId', patientId)
        fd.append('description', mediaForm.description)
        fd.append('visibleToPatient', String(mediaForm.visibleToPatient))
        const res = await uploadPatientMedia(fd)
        if ('error' in res) { setError(res.error); setIsUploading(false); return }
      } else if (editingMedia) {
        const res = await updateMediaRecord(editingMedia.id, {
          description: mediaForm.description,
          visibleToPatient: mediaForm.visibleToPatient
        }, patientId)
        if (res && 'error' in res) { setError(res.error); setIsUploading(false); return }
      }
      await loadMedia()
      closeModal()
    } catch (err) {
      console.error('Error in media modal:', err)
      setError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string, bucket: string, fileUrl: string) => {
    e.stopPropagation()
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return
    
    setImages(images.filter(img => img.id !== id))
    await deleteMediaRecord(id, bucket, fileUrl, patientId)
  }

  const toggleVisibilityDirect = async (e: React.MouseEvent, img: any) => {
    e.stopPropagation()
    const newVisibility = !img.visibleToPatient
    
    // Optimistic UI update
    setImages(images.map(i => i.id === img.id ? { ...i, visibleToPatient: newVisibility } : i))
    
    await updateMediaRecord(img.id, { visibleToPatient: newVisibility }, patientId)
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
        <h2 className="text-xl font-serif text-text flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-brand" />
          Documentos y Fotos
        </h2>
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
          className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
        >
          {isUploading && pendingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Subir Archivo
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Subida rápida */}
          <div 
            onClick={handleUploadClick}
            className="border-2 border-dashed border-border rounded-2xl bg-elevated flex flex-col items-center justify-center p-6 text-muted hover:border-brand hover:bg-brand-soft hover:text-brand transition-all cursor-pointer min-h-[220px]"
          >
            <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center shadow-sm mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold">Click para subir</p>
            <p className="text-xs font-medium mt-1">Fotos, Radiografías o PDF</p>
          </div>

          {/* Galería */}
          {images.map((img) => (
            <div 
              key={img.id} 
              onClick={() => openEditModal(img)}
              className="group relative bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              {/* Imagen/Preview */}
              <div className="aspect-[4/3] bg-elevated relative flex items-center justify-center overflow-hidden">
                {img.category === 'document' ? (
                  <File className="w-16 h-16 text-muted" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={img.signedUrl} 
                    alt={img.description}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                
                {/* Botón flotante para eliminar (solo visible en hover) */}
                <button 
                  onClick={(e) => handleDelete(e, img.id, img.bucket, img.fileUrl)}
                  className="absolute top-3 right-3 p-1.5 bg-danger/90 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger transition-all shadow-sm"
                  title="Eliminar archivo"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Badge flotante de visibilidad */}
                <button
                  onClick={(e) => toggleVisibilityDirect(e, img)}
                  className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md transition-colors ${
                    img.visibleToPatient 
                    ? 'bg-brand/90 text-white hover:bg-brand' 
                    : 'bg-elevated/60 text-white hover:bg-bg/80'
                  }`}
                  title={img.visibleToPatient ? 'Visible en portal' : 'Oculto (Privado)'}
                >
                  {img.visibleToPatient ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {img.visibleToPatient ? 'Público' : 'Privado'}
                </button>
              </div>

              {/* Info y Edición */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <h4 className="font-bold text-text text-sm line-clamp-2 leading-snug group-hover:text-brand transition-colors" title={img.description}>
                      {img.description}
                    </h4>
                  </div>
                  <p className="text-xs font-medium text-muted flex items-center gap-1.5">
                    {new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(new Date(img.createdAt))}
                  </p>
                </div>
                
                {img.category === 'document' && (
                  <a 
                    href={img.signedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                    className="text-brand text-xs font-semibold hover:underline mt-3 inline-block"
                  >
                    Abrir documento
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Subir / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-bg/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={closeModal} />
          
          <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md mx-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-lg font-serif font-bold text-text">
                {pendingFile ? 'Detalles del Archivo' : 'Editar Documento'}
              </h3>
              <button onClick={closeModal} className="p-2 text-muted hover:text-muted hover:bg-elevated rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-danger-soft border border-danger/30 rounded-xl text-danger text-sm">{error}</div>
              )}
              {pendingFile && (
                <div className="bg-elevated p-4 rounded-xl border border-border flex items-center gap-3">
                  <File className="w-8 h-8 text-brand opacity-75" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-text truncate">{pendingFile.name}</p>
                    <p className="text-xs text-muted">{(pendingFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Descripción o Nombre</label>
                <input 
                  type="text" 
                  value={mediaForm.description}
                  onChange={(e) => setMediaForm({ ...mediaForm, description: e.target.value })}
                  placeholder="Ej: Radiografía Panorámica Inicial"
                  className="input w-full px-4 py-2.5"
                />
              </div>

              {/* Toggle de Visibilidad Clínico */}
              <label className="flex items-start gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-elevated transition-colors">
                <div className="flex items-center h-5 mt-0.5">
                  <input 
                    type="checkbox"
                    checked={mediaForm.visibleToPatient}
                    onChange={(e) => setMediaForm({ ...mediaForm, visibleToPatient: e.target.checked })}
                    className="w-4 h-4 text-brand bg-elevated border-border rounded focus:ring-brand focus:ring-2 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text">Visible para el paciente</p>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">
                    Si activas esta opción, el paciente podrá ver este documento/foto al iniciar sesión en su portal personal. Útil para que vean su progreso.
                  </p>
                </div>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-5 py-2.5 text-muted hover:bg-elevated font-medium rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveModal}
                  disabled={isUploading || !mediaForm.description.trim()}
                  className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : (pendingFile ? <Upload className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                  {pendingFile ? 'Confirmar y Subir' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
