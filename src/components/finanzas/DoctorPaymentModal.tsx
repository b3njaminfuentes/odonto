'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Loader2, UserMinus, PenTool } from 'lucide-react'
import { createDoctorPayment } from '@/app/admin/finanzas/doctor-actions'
import { SignaturePad } from '@/components/ui/SignaturePad'

interface DoctorOption {
  id: string
  firstName: string
  lastName: string
}

interface DoctorPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  doctors: DoctorOption[]
  onSuccess: () => void
}

export function DoctorPaymentModal({ isOpen, onClose, doctors, onSuccess }: DoctorPaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!signatureData) {
      setError('La firma digital del doctor es obligatoria para registrar el pago.')
      return
    }

    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('signatureUrl', signatureData)

    const result = await createDoctorPayment(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      formRef.current?.reset()
      setSignatureData(null)
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div data-lenis-prevent className="relative bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-surface/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text font-serif flex items-center gap-2">
            <UserMinus className="w-5 h-5 text-warning" />
            Registrar Pago a Doctor
          </h2>
          <button onClick={onClose} className="p-2 text-muted hover:text-muted hover:bg-elevated rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-danger-soft text-danger text-sm rounded-xl border border-danger">
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Doctor *</label>
              <select name="doctorId" required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-brand outline-none transition-all">
                <option value="">Selecciona un doctor...</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>Dra. {d.firstName} {d.lastName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Monto Pagado (Bs) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-muted font-bold text-sm">Bs</span>
                </div>
                <input 
                  type="number" 
                  name="amount"
                  min="0"
                  step="0.01"
                  required 
                  className="w-full pl-11 pr-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-brand outline-none transition-all font-medium text-text" 
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Descripción / Notas</label>
              <input 
                type="text" 
                name="description" 
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-brand outline-none transition-all"
                placeholder="Ej. Pago por comisiones de ortodoncia mes Julio"
              />
            </div>

            <div className="bg-surface/50 border border-border p-4 rounded-xl">
              <label className="flex items-center gap-2 text-sm font-bold text-text mb-3">
                <PenTool className="w-4 h-4 text-brand" />
                Firma Digital Requerida *
              </label>
              <div className="animate-in fade-in slide-in-from-top-2">
                <SignaturePad 
                  onSave={setSignatureData} 
                  disabled={loading} 
                />
                <p className="text-xs text-muted mt-2 text-center">
                  El doctor debe firmar aquí como constancia de recepción.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-muted font-medium hover:bg-elevated rounded-xl transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-warning text-white font-medium hover:bg-warning/90 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Registrar Pago y Firma
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
