import React from 'react'
import { Calendar, AlertCircle, FileText, Activity, Stethoscope, DollarSign, ImageIcon, CalendarClock } from 'lucide-react'
import { intlBO, toBO } from '@/lib/datetime'
import { AccountStatement } from './AccountStatement'
import type { AccountStatement as Statement } from '@/app/admin/pacientes/payment-actions'

interface PatientSummaryTabProps {
  summaryData: {
    appointments: any[]
    history: any
    treatments: any[]
    payments: any[]
    media: any[]
    treatmentsCount: number
    mediaCount: number
    statement: Statement
  }
}

type TimelineItem = {
  date: Date
  kind: 'treatment' | 'appointment' | 'payment' | 'media'
  title: string
  detail: string
  tone: 'brand' | 'info' | 'success' | 'danger' | 'muted'
}

export function PatientSummaryTab({ summaryData }: PatientSummaryTabProps) {
  const { appointments, history, treatments, payments, media, treatmentsCount, mediaCount, statement } = summaryData

  const now = new Date()
  const futureAppointments = appointments
    .filter((a) => new Date(a.startsAt) >= now && a.status !== 'CANCELADO')
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  const nextAppointment = futureAppointments[0] || null

  let alerts: string[] = []
  if (history?.medicalHistory) {
    const medHistory = typeof history.medicalHistory === 'string' ? JSON.parse(history.medicalHistory) : history.medicalHistory
    if (medHistory.allergies?.length) alerts.push(`Alergias: ${medHistory.allergies.join(', ')}`)
    if (medHistory.chronicDiseases?.length) alerts.push(`Condiciones: ${medHistory.chronicDiseases.join(', ')}`)
  }

  // Línea de tiempo unificada: todo lo que le pasó a este paciente, más reciente primero.
  const timeline: TimelineItem[] = [
    ...treatments.map((t): TimelineItem => ({
      date: new Date(t.startDate),
      kind: 'treatment',
      title: t.name,
      detail: `Tratamiento · ${t.status}${t.budget ? ` · Presupuesto Bs ${Number(t.budget).toFixed(2)}` : ''}`,
      tone: t.status === 'CANCELADO' ? 'danger' : t.status === 'COMPLETADO' ? 'info' : 'brand',
    })),
    ...appointments.map((a): TimelineItem => ({
      date: new Date(a.startsAt),
      kind: 'appointment',
      title: a.treatmentType || 'Consulta general',
      detail: `Cita · ${a.status}`,
      tone: a.status === 'CANCELADO' ? 'danger' : a.status === 'CONFIRMADO' ? 'success' : 'muted',
    })),
    ...payments.map((p): TimelineItem => ({
      date: new Date(p.date),
      kind: 'payment',
      title: `Pago de Bs ${Number(p.amount).toFixed(2)}`,
      detail: `${p.method || 'Pago'} · ${p.status}`,
      tone: p.status === 'CANCELADO' ? 'danger' : 'success',
    })),
    ...media.map((m): TimelineItem => ({
      date: new Date(m.createdAt),
      kind: 'media',
      title: m.description || 'Archivo subido',
      detail: `${m.category || 'Documento'} · ${m.visibleToPatient ? 'visible al paciente' : 'privado'}`,
      tone: 'muted',
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const toneClasses: Record<TimelineItem['tone'], string> = {
    brand: 'bg-brand-soft text-brand',
    info: 'bg-info-soft text-info',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
    muted: 'bg-elevated text-muted',
  }
  const kindIcon: Record<TimelineItem['kind'], React.ElementType> = {
    treatment: Stethoscope,
    appointment: CalendarClock,
    payment: DollarSign,
    media: ImageIcon,
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-soft rounded-lg text-brand">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-text">Próxima Cita</h3>
          </div>
          {nextAppointment ? (
            <div>
              <p className="text-xl font-bold text-text mb-1 capitalize">
                {intlBO({ weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(toBO(nextAppointment.startsAt))}
              </p>
              <p className="text-sm text-muted font-medium capitalize">
                {nextAppointment.treatmentType || 'Consulta General'} • {nextAppointment.status}
              </p>
            </div>
          ) : (
            <p className="text-muted text-sm">No hay citas programadas próximamente.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4 flex flex-col justify-center items-center text-center">
            <div className="p-3 bg-brand-soft rounded-full text-brand mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-text">{treatmentsCount}</p>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Tratamientos Activos</p>
          </div>
          <div className="card p-4 flex flex-col justify-center items-center text-center">
            <div className="p-3 bg-elevated rounded-full text-muted mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-text">{mediaCount}</p>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Documentos y Fotos</p>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-warning-soft border border-warning rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-warning">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold">Alertas Médicas Importantes</h3>
          </div>
          <ul className="space-y-2">
            {alerts.map((alert, idx) => (
              <li key={idx} className="text-sm font-medium text-warning flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Estado de cuenta consolidado */}
      <div>
        <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Estado de cuenta</h3>
        <AccountStatement data={statement} />
      </div>

      {/* Línea de tiempo: todo lo que tenemos de este paciente, en un solo lugar */}
      <div>
        <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Historial completo</h3>
        {timeline.length === 0 ? (
          <div className="card p-8 text-center text-muted text-sm">Todavía no hay actividad registrada para este paciente.</div>
        ) : (
          <div className="card divide-y divide-border overflow-hidden">
            {timeline.map((item, i) => {
              const Icon = kindIcon[item.kind]
              return (
                <div key={i} className="flex items-start gap-4 p-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${toneClasses[item.tone]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted mt-0.5">{item.detail}</p>
                  </div>
                  <span className="text-xs text-faint shrink-0 tabular-nums">
                    {intlBO({ dateStyle: 'medium' }).format(item.date)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
