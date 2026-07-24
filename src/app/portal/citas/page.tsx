import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { Calendar, AlertCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toBO } from '@/lib/datetime'

export const dynamic = 'force-dynamic'

export default async function CitasPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Buscar el paciente
  const { data: patient } = await supabase
    .from('Patient')
    .select('id')
    .eq('profileId', user.id)
    .single()

  if (!patient) {
    return (
      <div className="bg-surface rounded-2xl p-8 shadow-sm border border-border text-center">
        <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Ficha no vinculada</h2>
        <p className="text-muted">Tu cuenta aún no ha sido vinculada a una ficha clínica.</p>
      </div>
    )
  }

  const { data: appointments } = await supabase
    .from('Appointment')
    .select('*')
    .eq('patientId', patient.id)
    .order('startsAt', { ascending: false })

  const futureAppointments = appointments?.filter(a => new Date(a.startsAt) >= new Date() && a.status !== 'CANCELADO') || []
  const pastAppointments = appointments?.filter(a => new Date(a.startsAt) < new Date() || a.status === 'CANCELADO') || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="bg-surface rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
        <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-brand" />
          Mis Citas
        </h2>
        <p className="text-muted">Consulta tu historial de visitas y tus próximos turnos programados.</p>
      </div>

      {/* Próximas Citas */}
      {futureAppointments.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" /> Próximos Turnos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {futureAppointments.map(a => (
              <div key={a.id} className="bg-surface border border-brand-soft shadow-sm rounded-2xl p-5 flex items-start gap-4 ring-1 ring-brand/10">
                <div className="bg-brand-soft rounded-xl p-3 flex flex-col items-center justify-center min-w-[70px] border border-brand-soft">
                  <span className="text-xs font-bold text-brand uppercase">
                    {format(toBO(a.startsAt), "MMM", { locale: es })}
                  </span>
                  <span className="text-2xl font-black text-brand leading-none my-1">
                    {format(toBO(a.startsAt), "d")}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-text">{a.treatmentType || 'Consulta General'}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted mt-2">
                    <Clock className="w-4 h-4 text-muted" />
                    {format(toBO(a.startsAt), "HH:mm")} - {format(toBO(a.endsAt), "HH:mm")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      <div>
        <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
          Historial de Visitas
        </h3>
        
        {pastAppointments.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-12 text-muted">
            <Calendar className="w-10 h-10 mb-2 text-muted" />
            <p className="text-sm">Aún no hay visitas pasadas registradas.</p>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-elevated text-muted font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Horario</th>
                  <th className="px-6 py-4">Motivo / Tratamiento</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted">
                {pastAppointments.map(a => (
                  <tr key={a.id} className="hover:bg-elevated/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text capitalize">
                      {format(toBO(a.startsAt), "EEEE, d 'de' MMMM", { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {format(toBO(a.startsAt), "HH:mm")}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {a.treatmentType || 'Consulta General'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ring-1 ring-inset ${
                        a.status === 'CONFIRMADO' ? 'bg-brand-soft text-brand ring-brand/20' :
                        a.status === 'CANCELADO' ? 'bg-danger-soft text-danger ring-danger/20' :
                        a.status === 'OCUPADO' ? 'bg-warning-soft text-warning ring-warning/20' :
                        'bg-elevated text-muted ring-border/20'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
