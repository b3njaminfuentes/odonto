import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar'

export const dynamic = 'force-dynamic'

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams?: { date?: string }
}) {
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

  // Recibimos la fecha actual de la vista, o usamos hoy por defecto
  const queryDate = searchParams?.date ? new Date(searchParams.date as string) : new Date()
  
  // Calcular los límites del mes actual para la query
  // Agregamos un buffer de 7 días antes y después para solapamientos de semanas
  const startOfMonth = new Date(queryDate.getFullYear(), queryDate.getMonth(), 1)
  startOfMonth.setDate(startOfMonth.getDate() - 7)
  const endOfMonth = new Date(queryDate.getFullYear(), queryDate.getMonth() + 1, 0)
  endOfMonth.setDate(endOfMonth.getDate() + 7)
  
  const startISO = startOfMonth.toISOString()
  const endISO = endOfMonth.toISOString()
  
  const { data: rawAppointments } = await supabase
    .from('Appointment')
    .select(`
      id,
      startsAt,
      endsAt,
      status,
      treatmentType,
      notes,
      patientId,
      Patient:patientId (
        id,
        firstName,
        lastName,
        phone
      )
    `)
    .gte('startsAt', startISO)
    .lte('startsAt', endISO)
    .not('status', 'eq', 'CANCELADO')
    .order('startsAt', { ascending: true })

  // Mapeamos para aplanar el join de Supabase y adaptarlo a la interfaz
  const appointments = (rawAppointments || []).map((app: any) => ({
    id: app.id,
    startsAt: app.startsAt,
    endsAt: app.endsAt,
    status: app.status,
    type: app.treatmentType || 'General',
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
        <h1 className="text-3xl font-serif text-text tracking-tight">Calendario</h1>
        <p className="text-muted">
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
