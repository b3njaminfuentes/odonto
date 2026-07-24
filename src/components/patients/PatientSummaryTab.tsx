import React from 'react'
import { Calendar, AlertCircle, FileText, Activity } from 'lucide-react'
import { intlBO, toBO } from '@/lib/datetime'

interface PatientSummaryTabProps {
  summaryData: {
    appointments: any[]
    history: any
    treatmentsCount: number
    mediaCount: number
  }
}

export function PatientSummaryTab({ summaryData }: PatientSummaryTabProps) {
  const { appointments, history, treatmentsCount, mediaCount } = summaryData

  // Encontrar próxima cita
  const now = new Date()
  const futureAppointments = appointments
    .filter((a) => new Date(a.startsAt) >= now && a.status !== 'CANCELADO')
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  
  const nextAppointment = futureAppointments.length > 0 ? futureAppointments[0] : null

  // Extraer alergias o condiciones del historial
  let alerts: string[] = []
  if (history?.medicalHistory) {
    const medHistory = typeof history.medicalHistory === 'string' 
      ? JSON.parse(history.medicalHistory) 
      : history.medicalHistory
      
    if (medHistory.allergies && medHistory.allergies.length > 0) {
      alerts.push(`Alergias: ${medHistory.allergies.join(', ')}`)
    }
    if (medHistory.chronicDiseases && medHistory.chronicDiseases.length > 0) {
      alerts.push(`Condiciones: ${medHistory.chronicDiseases.join(', ')}`)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Próxima Cita Card */}
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
                {intlBO({ 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(toBO(nextAppointment.startsAt))}
              </p>
              <p className="text-sm text-muted font-medium capitalize">
                {nextAppointment.treatmentType || 'Consulta General'} • {nextAppointment.status}
              </p>
            </div>
          ) : (
            <p className="text-muted text-sm">No hay citas programadas próximamente.</p>
          )}
        </div>

        {/* Accesos Rápidos & Stats */}
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

      {/* Alertas Médicas (Solo si existen) */}
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
    </div>
  )
}
