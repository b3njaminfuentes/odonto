'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Loader2, DollarSign } from 'lucide-react'
import { createPayment } from '@/app/admin/finanzas/actions'

interface PatientOption {
  id: string
  name: string
  code: string
}

interface NewPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  patients: PatientOption[]
}

export function NewPaymentModal({ isOpen, onClose, patients }: NewPaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createPayment(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      formRef.current?.reset()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div data-lenis-prevent className="relative bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-surface/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text font-serif flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            Registrar Pago
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
              <label className="block text-sm font-medium text-muted mb-1">Paciente *</label>
              <select name="patientId" required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-brand outline-none transition-all">
                <option value="">Selecciona un paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Monto ($) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-muted" />
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
              <label className="block text-sm font-medium text-muted mb-1">Método de Pago *</label>
              <select name="method" required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-brand outline-none transition-all">
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="TARJETA">Tarjeta de Débito/Crédito</option>
                <option value="QR">Código QR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Concepto *</label>
              <input 
                type="text" 
                name="concept" 
                required 
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-brand outline-none transition-all"
                placeholder="Ej. Abono por tratamiento de conducto"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-muted font-medium hover:bg-elevated rounded-xl transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-success text-white font-medium hover:bg-success/90 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Registrar Ingreso
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
