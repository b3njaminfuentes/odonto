import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { Calendar, AlertCircle, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toBO } from '@/lib/datetime'

export const dynamic = 'force-dynamic'

export default async function PortalDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Buscar el paciente
  const { data: patient } = await supabase
    .from('Patient')
    .select('id, firstName, lastName')
    .eq('profileId', user.id)
    .single()

  if (!patient) {
    return (
      <div className="bg-surface rounded-2xl p-8 shadow-sm border border-border text-center">
        <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Ficha no vinculada</h2>
        <p className="text-muted">
          Tu cuenta aún no ha sido vinculada a una ficha clínica. Por favor, comunícate con la clínica.
        </p>
      </div>
    )
  }

  // Buscar próximas citas
  const { data: appointments } = await supabase
    .from('Appointment')
    .select('*')
    .eq('patientId', patient.id)
    .gte('startsAt', new Date().toISOString())
    .not('status', 'eq', 'CANCELADO')
    .order('startsAt', { ascending: true })
    .limit(3)

  // Buscar tratamientos activos
  const { data: activeTreatments } = await supabase
    .from('Treatment')
    .select('*')
    .eq('patientId', patient.id)
    .in('status', ['ACTIVO', 'PAUSADO'])
    .order('createdAt', { ascending: false })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-surface rounded-2xl p-6 sm:p-8 shadow-sm border border-brand-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-serif font-bold text-text mb-2">Bienvenido, {patient.firstName}</h2>
          <p className="text-muted max-w-lg">
            Aquí puedes revisar tu historial de tratamientos, tus próximas citas y el estado de tu cuenta de manera segura.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Citas */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border flex flex-col h-full">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand" />
            Próximas Citas
          </h3>
          
          {(!appointments || appointments.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <Calendar className="w-10 h-10 text-muted mb-2" />
              <p className="text-muted text-sm">No tienes citas programadas actualmente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map(app => (
                <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-brand-soft/50 rounded-xl border border-brand-soft">
                  <div>
                    <p className="font-bold text-brand capitalize">
                      {format(toBO(app.startsAt), "EEEE, d 'de' MMMM", { locale: es })}
                    </p>
                    <p className="text-sm font-medium text-brand">
                      {format(toBO(app.startsAt), "HH:mm")} - {app.treatmentType || 'Consulta General'}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span className="inline-block px-2.5 py-1 bg-brand-soft text-brand text-[10px] font-bold uppercase tracking-wide rounded-md">
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tratamientos */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border flex flex-col h-full">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand" />
            Tratamientos Actuales
          </h3>
          
          {(!activeTreatments || activeTreatments.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <Activity className="w-10 h-10 text-muted mb-2" />
              <p className="text-muted text-sm">No tienes tratamientos activos en este momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTreatments.map(t => (
                <div key={t.id} className="p-4 bg-elevated rounded-xl border border-border">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-text">{t.name}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      t.status === 'ACTIVO' ? 'bg-brand-soft text-brand' : 'bg-info-soft text-info'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  {t.toothNumber && (
                    <p className="text-xs text-muted font-medium">Pieza Dental: {t.toothNumber}</p>
                  )}
                  {t.description && (
                    <p className="text-sm text-muted mt-2 line-clamp-2">{t.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
