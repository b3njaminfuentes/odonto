import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar'

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
  const supabase = createClient()

  // Traer pacientes para el select del Modal (id, nombre, código)
  const { data: rawPatients } = await supabase
    .from('Patient')
    .select('id, firstName, lastName, patientCode')
    .eq('status', 'ACTIVE')
    .order('lastName')

  const patientsForSelect = (rawPatients || []).map(p => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    code: p.patientCode
  }))

  // Traer citas de las próximas semanas / mes (para el MVP traemos todas las no canceladas recientes o futuras)
  // En producción se traería solo el rango visible.
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  
  const { data: rawAppointments } = await supabase
    .from('Appointment')
    .select(`
      id,
      startsAt,
      endsAt,
      status,
      type,
      notes,
      patientId,
      Patient:patientId (
        id,
        firstName,
        lastName,
        phone
      )
    `)
    .gte('startsAt', thirtyDaysAgo)
    .not('status', 'eq', 'CANCELADO')
    .order('startsAt', { ascending: true })

  // Mapeamos para aplanar el join de Supabase y adaptarlo a la interfaz
  const appointments = (rawAppointments || []).map((app: any) => ({
    id: app.id,
    startsAt: app.startsAt,
    endsAt: app.endsAt,
    status: app.status,
    type: app.type,
    notes: app.notes,
    patient: {
      id: app.Patient?.id || app.patientId,
      firstName: app.Patient?.firstName || 'Paciente',
      lastName: app.Patient?.lastName || 'Desconocido',
      phone: app.Patient?.phone
    }
  }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-3xl font-serif text-gray-900 tracking-tight">Calendario</h1>
        <p className="text-gray-500">
          Gestiona tus turnos diarios y evita choques de horario.
        </p>
      </div>

      <WeeklyCalendar 
        initialAppointments={appointments} 
        patients={patientsForSelect} 
      />
    </div>
  )
}
