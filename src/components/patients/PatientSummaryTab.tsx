import React from 'react'
import { Calendar, AlertCircle, FileText, Activity } from 'lucide-react'

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
        <div className="clinical-card p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Próxima Cita</h3>
          </div>
          
          {nextAppointment ? (
            <div>
              <p className="text-xl font-bold text-slate-900 mb-1 capitalize">
                {new Intl.DateTimeFormat('es-BO', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(new Date(nextAppointment.startsAt))}
              </p>
              <p className="text-sm text-slate-500 font-medium capitalize">
                {nextAppointment.treatmentType || 'Consulta General'} • {nextAppointment.status}
              </p>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No hay citas programadas próximamente.</p>
          )}
        </div>

        {/* Accesos Rápidos & Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="clinical-card p-4 flex flex-col justify-center items-center text-center">
            <div className="p-3 bg-teal-50 rounded-full text-teal-600 mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{treatmentsCount}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tratamientos Activos</p>
          </div>
          <div className="clinical-card p-4 flex flex-col justify-center items-center text-center">
            <div className="p-3 bg-slate-50 rounded-full text-slate-600 mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{mediaCount}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Documentos y Fotos</p>
          </div>
        </div>
      </div>

      {/* Alertas Médicas (Solo si existen) */}
      {alerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-orange-800">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold">Alertas Médicas Importantes</h3>
          </div>
          <ul className="space-y-2">
            {alerts.map((alert, idx) => (
              <li key={idx} className="text-sm font-medium text-orange-900 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                {alert}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
