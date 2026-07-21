import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { Calendar, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ficha no vinculada</h2>
        <p className="text-gray-500">
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Bienvenido, {patient.firstName}</h2>
          <p className="text-gray-500 max-w-lg">
            Aquí puedes revisar tu historial de tratamientos, tus próximas citas y el estado de tu cuenta de manera segura.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Próximas Citas
        </h3>
        
        {(!appointments || appointments.length === 0) ? (
          <p className="text-gray-500 py-4">No tienes citas programadas actualmente.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map(app => (
              <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 capitalize">
                    {format(new Date(app.startsAt), "EEEE, d 'de' MMMM", { locale: es })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(app.startsAt), "HH:mm")} - {app.type}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className="inline-block px-3 py-1 bg-successLight text-success text-xs font-bold uppercase tracking-wide rounded-full">
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tratamiento Actual</h3>
        <p className="text-gray-500">Consulta general y evaluación.</p>
      </div>
    </div>
  )
}
