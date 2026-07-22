import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { Calendar, AlertCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Ficha no vinculada</h2>
        <p className="text-slate-500">Tu cuenta aún no ha sido vinculada a una ficha clínica.</p>
      </div>
    )
  }

  const { data: appointments } = await supabase
    .from('Appointment')
    .select('*')
    .eq('patientId', patient.id)
    .order('startsAt', { ascending: false })

  const futureAppointments = appointments?.filter(a => new Date(a.startsAt) >= new Date() && a.status !== 'CANCELADA') || []
  const pastAppointments = appointments?.filter(a => new Date(a.startsAt) < new Date() || a.status === 'CANCELADA') || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Mis Citas
        </h2>
        <p className="text-slate-500">Consulta tu historial de visitas y tus próximos turnos programados.</p>
      </div>

      {/* Próximas Citas */}
      {futureAppointments.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" /> Próximos Turnos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {futureAppointments.map(a => (
              <div key={a.id} className="bg-white border border-teal-100 shadow-sm rounded-2xl p-5 flex items-start gap-4 ring-1 ring-teal-500/10">
                <div className="bg-teal-50 rounded-xl p-3 flex flex-col items-center justify-center min-w-[70px] border border-teal-100">
                  <span className="text-xs font-bold text-teal-600 uppercase">
                    {format(new Date(a.startsAt), "MMM", { locale: es })}
                  </span>
                  <span className="text-2xl font-black text-teal-700 leading-none my-1">
                    {format(new Date(a.startsAt), "d")}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900">{a.treatmentType || 'Consulta General'}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mt-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {format(new Date(a.startsAt), "HH:mm")} - {format(new Date(a.endsAt), "HH:mm")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          Historial de Visitas
        </h3>
        
        {pastAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center py-12 text-slate-400">
            <Calendar className="w-10 h-10 mb-2 text-slate-300" />
            <p className="text-sm">Aún no hay visitas pasadas registradas.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Horario</th>
                  <th className="px-6 py-4">Motivo / Tratamiento</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pastAppointments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 capitalize">
                      {format(new Date(a.startsAt), "EEEE, d 'de' MMMM", { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(a.startsAt), "HH:mm")}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {a.treatmentType || 'Consulta General'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ring-1 ring-inset ${
                        a.status === 'COMPLETADA' ? 'bg-teal-50 text-teal-700 ring-teal-600/20' : 
                        a.status === 'CANCELADA' ? 'bg-red-50 text-red-700 ring-red-600/20' : 
                        a.status === 'NO_ASISTIO' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                        'bg-slate-100 text-slate-700 ring-slate-500/20'
                      }`}>
                        {a.status === 'NO_ASISTIO' ? 'Falta' : a.status}
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
