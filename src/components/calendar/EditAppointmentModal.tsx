'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { updateAppointment } from '@/app/admin/calendario/actions'

interface EditAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  doctors?: { id: string; name: string; specialty: string | null }[]
  appointment: any | null
}

export function EditAppointmentModal({ isOpen, onClose, doctors = [], appointment }: EditAppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen || !appointment) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      // Agregamos patientId desde el objeto appointment porque no está en el form
      formData.append('patientId', appointment.patient.id)
      
      const result = await updateAppointment(appointment.id, formData)
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    } catch (err) {
      console.error('Error al editar cita:', err)
      setError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  // Pre-llenar datos
  const dateStr = appointment.startsAt.slice(0, 10)
  const timeStr = appointment.startsAt.slice(11, 16)
  
  // Calcular duración en minutos
  const startD = new Date(appointment.startsAt)
  const endD = new Date(appointment.endsAt)
  const diffMinutes = Math.round((endD.getTime() - startD.getTime()) / 60000)
  
  // Para que el select funcione, debe ser uno de los values predefinidos o el valor exacto.
  // Los options son: 15, 30, 45, 60, 90, 120. Usaremos diffMinutes, o 30 si es raro.
  const durationValue = [15, 30, 45, 60, 90, 120].includes(diffMinutes) ? String(diffMinutes) : "30"

  const now = new Date()
  const todayISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  
  // Generar opciones de tiempo (cada 30 min)
  const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00']
  // Si el timeStr no está en TIME_SLOTS, lo agregamos para que el select no se rompa
  if (timeStr && !TIME_SLOTS.includes(timeStr)) {
    TIME_SLOTS.push(timeStr)
    TIME_SLOTS.sort()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div data-lenis-prevent className="relative bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-surface/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-brand font-serif tracking-tight">Editar Cita</h2>
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

          <div className="mb-6 p-4 bg-elevated rounded-xl border border-border flex items-center justify-between">
             <div className="text-sm">
                <span className="text-muted block">Paciente:</span>
                <span className="font-semibold text-text">{appointment.patient.firstName} {appointment.patient.lastName !== 'Desconocido' ? appointment.patient.lastName : ''}</span>
             </div>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Fecha *</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={dateStr}
                  disabled={loading}
                  className="input w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Hora *</label>
                <select name="time" required disabled={loading} defaultValue={timeStr} className="input w-full text-sm">
                  <option value="" disabled>Elegir…</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Duración *</label>
                <select name="duration" required disabled={loading} defaultValue={durationValue} className="input w-full text-sm">
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hora</option>
                  <option value="90">1.5 horas</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Tipo de Cita *</label>
                <select name="type" required disabled={loading} defaultValue={appointment.type || appointment.treatmentType} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all disabled:bg-elevated disabled:text-muted text-sm">
                  <option value="Consulta General">Consulta General</option>
                  <option value="Limpieza">Limpieza Profunda</option>
                  <option value="Curación">Curación</option>
                  <option value="Extracción">Extracción</option>
                  <option value="Control Ortodoncia">Control Ortodoncia</option>
                  <option value="Implante">Cirugía / Implante</option>
                  <option value="Emergencia">Emergencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Doctor (Opcional)</label>
                <select name="doctorId" disabled={loading} defaultValue={appointment.doctor?.id || appointment.doctorId || ''} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all disabled:bg-elevated disabled:text-muted text-sm">
                  <option value="">Cualquiera / Sin asignar</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} {d.specialty ? `(${d.specialty})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Notas (Opcional)</label>
              <textarea 
                name="notes" 
                rows={3} 
                disabled={loading}
                defaultValue={appointment.notes || ''}
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
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
