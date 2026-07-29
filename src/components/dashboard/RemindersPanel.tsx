'use client'

import { useState } from 'react'
import { MessageCircle, CheckCircle2, Phone, CalendarCheck } from 'lucide-react'
import { markReminderAsSent } from '@/app/admin/appointment-actions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type ReminderApp = {
  id: string
  startsAt: string
  treatmentType: string | null
  patientName: string
  phone: string
}

export function RemindersPanel({ appointments }: { appointments: ReminderApp[] }) {
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())

  const pending = appointments.filter(a => !sentIds.has(a.id))

  if (pending.length === 0) {
    return (
      <div className="card bg-success-soft/30 border-success/30 p-6 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="w-10 h-10 text-success mb-3" />
        <h3 className="font-bold text-success-fg text-lg">Morning Routine Completada</h3>
        <p className="text-success-fg/80 text-sm mt-1 max-w-[250px]">
          Ya enviaste todos los recordatorios de hoy. ¡Excelente trabajo!
        </p>
      </div>
    )
  }

  const handleSend = async (app: ReminderApp) => {
    setSendingId(app.id)

    // Formatear el número (agregar 591 si tiene 8 dígitos)
    let number = app.phone.replace(/[^\d+]/g, '')
    if (number.length === 8) {
      number = `+591${number}`
    }

    // Armar el mensaje
    const dateObj = new Date(app.startsAt)
    const timeStr = format(dateObj, 'HH:mm')
    
    const text = `Hola ${app.patientName.split(' ')[0]}, la Dra. Villarroel te recuerda tu cita programada para hoy a las ${timeStr} hrs para tu sesión de ${app.treatmentType || 'Consulta General'} en Clínica Odontológica Villarroel. Por favor confírmanos tu asistencia. ¡Te esperamos!`
    
    const url = `https://wa.me/${number.replace('+', '')}?text=${encodeURIComponent(text)}`

    // Abrir WhatsApp en nueva pestaña
    window.open(url, '_blank')

    // Marcar como enviado en la DB
    const res = await markReminderAsSent(app.id)
    if (res.success) {
      setSentIds(prev => new Set(prev).add(app.id))
    }

    setSendingId(null)
  }

  return (
    <div className="card bg-gradient-to-br from-brand-soft to-surface border-brand-soft p-6 shadow-lift relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <MessageCircle size={100} />
      </div>
      
      <h2 className="text-lg font-bold text-brand mb-1 flex items-center gap-2 relative z-10">
        <CalendarCheck className="w-5 h-5" />
        Morning Routine
      </h2>
      <p className="text-xs text-muted mb-5 relative z-10">
        Tienes {pending.length} recordatorio{pending.length !== 1 ? 's' : ''} pendiente{pending.length !== 1 ? 's' : ''} para hoy.
      </p>

      <div className="space-y-3 relative z-10">
        {pending.map(app => {
          const isSending = sendingId === app.id
          return (
            <div key={app.id} className="bg-surface rounded-xl p-4 border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-text text-sm">{app.patientName}</p>
                <div className="flex items-center gap-2 text-xs text-muted mt-1">
                  <span className="font-semibold text-brand">{format(new Date(app.startsAt), 'HH:mm')} hs</span>
                  <span>·</span>
                  <span className="truncate max-w-[150px]">{app.treatmentType || 'Consulta General'}</span>
                </div>
              </div>
              <button
                onClick={() => handleSend(app)}
                disabled={isSending}
                className="btn-accent py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isSending ? (
                  <span className="animate-pulse">Enviando...</span>
                ) : (
                  <>
                    <Phone size={14} /> Enviar Recordatorio
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
