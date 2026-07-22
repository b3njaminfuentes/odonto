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
      
      <div className="relative neo-card bg-neoBg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-neoYellow border-b-3 border-black px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black">Nuevo Paciente</h2>
          <button 
            onClick={handleClose}
            className="p-2 text-black hover:bg-black hover:text-neoYellow border-2 border-transparent hover:border-black rounded-xl transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-neoPink border-3 border-black rounded-xl text-black font-bold">
              {error}
            </div>
          )}

          {successData ? (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-neoGreen border-3 border-black shadow-neo-sm text-black rounded-xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-black uppercase text-black mb-2">¡Paciente Creado!</h3>
              <p className="text-black font-bold max-w-md mx-auto mb-8">
                Has registrado exitosamente a <strong>{successData.name}</strong>. Comparte el siguiente PIN (Código de Paciente) para que pueda acceder a su portal:
              </p>
              
              <div className="bg-neoYellow border-3 border-black rounded-2xl shadow-neo-sm p-6 mb-8 w-full max-w-sm">
                <span className="block text-sm font-black text-black mb-2 uppercase tracking-wider">Código / PIN de Acceso</span>
                <span className="text-5xl font-mono font-black text-black tracking-widest">{successData.patientCode}</span>
              </div>

              <button
                onClick={handleClose}
                className="neo-btn bg-black text-white px-8 py-4 text-lg"
              >
                Cerrar y Volver
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Información Personal */}
                <div className="space-y-6 sm:col-span-2 border-b-3 border-black border-dashed pb-8">
                  <h3 className="text-lg font-black text-black uppercase tracking-widest bg-neoYellow inline-block px-3 py-1 border-2 border-black rounded-lg shadow-neo-sm">Información Personal</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Nombres *</label>
                      <input name="firstName" required className="neo-input w-full px-4 py-3 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Apellidos *</label>
                      <input name="lastName" required className="neo-input w-full px-4 py-3 bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Fecha de Nacimiento *</label>
                      <input type="date" name="dob" required className="neo-input w-full px-4 py-3 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">DNI o Cédula</label>
                      <input name="dni" className="neo-input w-full px-4 py-3 bg-white" />
                    </div>
                  </div>
                </div>

                {/* Contacto */}
                <div className="space-y-6 sm:col-span-2 border-b-3 border-black border-dashed pb-8">
                  <h3 className="text-lg font-black text-black uppercase tracking-widest bg-neoGreen inline-block px-3 py-1 border-2 border-black rounded-lg shadow-neo-sm">Contacto</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Teléfono</label>
                      <input type="tel" name="phone" className="neo-input w-full px-4 py-3 bg-white" placeholder="+591..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Email</label>
                      <input type="email" name="email" className="neo-input w-full px-4 py-3 bg-white" />
                    </div>
                  </div>
                </div>

                {/* Emergencia */}
                <div className="space-y-6 sm:col-span-2 pb-4">
                  <h3 className="text-lg font-black text-black uppercase tracking-widest bg-neoPink inline-block px-3 py-1 border-2 border-black rounded-lg shadow-neo-sm">Emergencia</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Nombre Contacto</label>
                      <input name="emergencyContactName" className="neo-input w-full px-4 py-3 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Teléfono Contacto</label>
                      <input type="tel" name="emergencyContactPhone" className="neo-input w-full px-4 py-3 bg-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-neoBg pt-6 pb-2 flex justify-end gap-4 mt-8 border-t-3 border-black">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="neo-btn bg-white px-6 py-3 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="neo-btn bg-neoGreen px-8 py-3 disabled:opacity-70 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
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
