'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, X } from 'lucide-react'
import { uploadProfilePhoto, removeProfilePhoto } from '@/app/admin/pacientes/profile-photo-actions'

interface ProfilePhotoProps {
  patientId: string
  initials: string
  photoUrl: string | null
}

export function ProfilePhoto({ patientId, initials, photoUrl }: ProfilePhotoProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePick = () => inputRef.current?.click()

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    const res = await uploadProfilePhoto(patientId, formData)
    setLoading(false)
    if ('error' in res) setError(res.error)
    else router.refresh()
  }

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Quitar la foto de perfil?')) return
    setLoading(true)
    await removeProfilePhoto(patientId)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex-shrink-0">
      <button
        type="button"
        onClick={handlePick}
        disabled={loading}
        title="Cambiar foto de perfil"
        className="group relative w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden focus:outline-none"
      >
        {photoUrl ? (
          <img src={photoUrl} alt={initials} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-brand-soft text-brand flex items-center justify-center text-3xl font-bold">
            {initials}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
        {photoUrl && !loading && (
          <span
            onClick={handleRemove}
            className="absolute -top-0.5 -right-0.5 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Quitar foto"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {error && <p className="text-xs text-danger mt-1 max-w-[100px]">{error}</p>}
    </div>
  )
}
