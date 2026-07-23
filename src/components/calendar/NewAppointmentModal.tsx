'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createAppointment } from '@/app/admin/calendario/actions'

interface PatientOption {
  id: string
  name: string
  code: string
}

interface NewAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  patients: PatientOption[]
}

export function NewAppointmentModal({ isOpen, onClose, patients }: NewAppointmentModalProps) {
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
    const result = await createAppointment(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      formRef.current?.reset()
      onClose()
    }
  }

  // Pre-calcular la fecha/hora mínima (ahora mismo) para el input
  const now = new Date()
  const nowISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-surface/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-brand font-serif tracking-tight">Agendar Cita</h2>
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
              <select name="patientId" required disabled={loading} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all disabled:bg-elevated disabled:text-muted text-sm">
                <option value="">Selecciona un paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Fecha y Hora *</label>
                <input 
                  type="datetime-local" 
                  name="startsAt" 
                  required 
                  min={nowISO}
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all disabled:bg-elevated disabled:text-muted text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Duración (min) *</label>
                <select name="duration" required disabled={loading} defaultValue="30" className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all disabled:bg-elevated disabled:text-muted text-sm">
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hora</option>
                  <option value="90">1.5 horas</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Tipo de Cita *</label>
              <select name="type" required disabled={loading} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all disabled:bg-elevated disabled:text-muted text-sm">
                <option value="Consulta General">Consulta General</option>
                <option value="Limpieza">Limpieza Profunda</option>
                <option value="Extracción">Extracción</option>
                <option value="Control Ortodoncia">Control Ortodoncia</option>
                <option value="Implante">Cirugía / Implante</option>
                <option value="Emergencia">Emergencia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Notas (Opcional)</label>
              <textarea 
                name="notes" 
                rows={3} 
                disabled={loading}
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-none disabled:bg-elevated disabled:text-muted text-sm"
                placeholder="Detalles adicionales..."
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-muted font-medium hover:bg-elevated rounded-xl transition-colors disabled:opacity-50 text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Agendando...' : 'Agendar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
