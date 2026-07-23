'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createPatient } from '@/app/admin/pacientes/actions'

interface CreatePatientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccessClose?: () => void
}

export function CreatePatientModal({ isOpen, onClose, onSuccessClose }: CreatePatientModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ patientCode: string, name: string, id: string } | null>(null)
  
  // Live validation states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [isTouched, setIsTouched] = useState(false)

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
    
    try {
      const result = await createPatient(formData)
      
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        setLoading(false)
        formRef.current?.reset()
        setSuccessData({
          patientCode: result.patient.patientCode,
          name: `${result.patient.firstName} ${result.patient.lastName}`,
          id: result.patient.id
        })
      }
    } catch (err) {
      console.error(err)
      setError("Error de conexión con el servidor. Intenta nuevamente.")
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSuccessData(null)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={!loading ? handleClose : undefined}
      />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 mx-4">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-slate-900">Nuevo Paciente</h2>
          <button 
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {successData ? (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-8 max-w-sm w-full text-center">
                <svg className="w-12 h-12 text-teal-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">¡Paciente Creado!</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Has registrado a <strong>{successData.name}</strong>. Código de acceso al portal:
                </p>
                
                <div className="bg-white border border-teal-200 rounded-xl p-4 mb-4">
                  <span className="text-3xl font-mono font-semibold text-teal-700 tracking-wider">{successData.patientCode}</span>
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href={`/admin/pacientes/${successData.id}`}
                    className="w-full text-center bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors block"
                  >
                    Ir al perfil del paciente
                  </a>
                  <button
                    onClick={() => {
                      if (onSuccessClose) onSuccessClose()
                      else handleClose()
                    }}
                    className="w-full text-slate-600 hover:text-slate-800 font-medium px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Cerrar y Volver a la lista
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" onChange={() => setIsTouched(true)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="sm:col-span-2 bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs">1</span>
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombres *</label>
                      <input 
                        name="firstName" 
                        required 
                        disabled={loading}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        data-invalid={isTouched && firstName.trim() === ''}
                        className="clinical-input w-full px-4 py-2.5 data-[invalid=true]:border-red-300 data-[invalid=true]:ring-red-500/10" 
                      />
                      {isTouched && firstName.trim() === '' && (
                        <p className="text-xs text-red-600 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">Este campo es obligatorio</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Apellidos *</label>
                      <input 
                        name="lastName" 
                        required 
                        disabled={loading}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        data-invalid={isTouched && lastName.trim() === ''}
                        className="clinical-input w-full px-4 py-2.5 data-[invalid=true]:border-red-300 data-[invalid=true]:ring-red-500/10" 
                      />
                      {isTouched && lastName.trim() === '' && (
                        <p className="text-xs text-red-600 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">Este campo es obligatorio</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha de Nacimiento *</label>
                      <input type="date" name="dob" required disabled={loading} className="clinical-input w-full px-4 py-2.5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">DNI o Cédula</label>
                      <input name="dni" disabled={loading} className="clinical-input w-full px-4 py-2.5" />
                    </div>
                  </div>
                </div>

                {/* Contacto */}
                <div className="sm:col-span-2 bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs">2</span>
                    Contacto
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        disabled={loading}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="clinical-input w-full px-4 py-2.5" 
                        placeholder="+591..." 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                      <input type="email" name="email" disabled={loading} className="clinical-input w-full px-4 py-2.5" />
                    </div>
                  </div>
                </div>

                {/* Emergencia */}
                <div className="sm:col-span-2 bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs">3</span>
                    Emergencia (Opcional)
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre Contacto</label>
                      <input name="emergencyContactName" disabled={loading} className="clinical-input w-full px-4 py-2.5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono Contacto</label>
                      <input type="tel" name="emergencyContactPhone" disabled={loading} className="clinical-input w-full px-4 py-2.5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 pb-2 flex justify-end gap-3 mt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || (isTouched && (firstName.trim() === '' || lastName.trim() === ''))}
                  className="clinical-btn px-6 py-2.5 text-sm flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar paciente'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
