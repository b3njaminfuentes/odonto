'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createPatient } from '@/app/admin/pacientes/actions'

interface CreatePatientModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreatePatientModal({ isOpen, onClose }: CreatePatientModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ patientCode: string, name: string } | null>(null)
  
  const formRef = useRef<HTMLFormElement>(null)

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createPatient(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      formRef.current?.reset()
      setSuccessData({
        patientCode: result.patient.patientCode,
        name: `${result.patient.firstName} ${result.patient.lastName}`
      })
    }
  }

  const handleClose = () => {
    setSuccessData(null)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900 font-serif">Nuevo Paciente</h2>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {successData ? (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-gray-900 mb-2">¡Paciente Creado!</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Has registrado exitosamente a <strong>{successData.name}</strong>. Comparte el siguiente PIN (Código de Paciente) para que pueda acceder a su portal:
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 w-full max-w-sm">
                <span className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Código / PIN de Acceso</span>
                <span className="text-4xl font-mono font-bold text-primary tracking-widest">{successData.patientCode}</span>
              </div>

              <button
                onClick={handleClose}
                className="px-8 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 rounded-xl transition-colors shadow-sm"
              >
                Cerrar y Volver
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="space-y-4 sm:col-span-2 border-b border-gray-100 pb-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Información Personal</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                      <input name="firstName" required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                      <input name="lastName" required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                      <input type="date" name="dob" required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DNI o Cédula</label>
                      <input name="dni" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Contacto */}
                <div className="space-y-4 sm:col-span-2 border-b border-gray-100 pb-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contacto</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input type="tel" name="phone" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="+591..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" name="email" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Emergencia */}
                <div className="space-y-4 sm:col-span-2 pb-2">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Emergencia</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Contacto</label>
                      <input name="emergencyContactName" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Contacto</label>
                      <input type="tel" name="emergencyContactPhone" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary text-white font-medium hover:bg-primary/90 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar Paciente
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
