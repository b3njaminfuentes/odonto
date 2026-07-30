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
    .order('firstName', { ascending: true })
    .order('lastName', { ascending: true })

  const patientsForSelect = (rawPatients || []).map(p => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    code: p.patientCode
  }))

  const { data: { session } } = await supabase.auth.getSession()
  const { data: currentUser } = await supabase
    .from('Profile')
    .select('role, id')
    .eq('id', session?.user?.id)
    .single()

  const { data: doctors } = await supabase
    .from('Profile')
    .select('id, firstName, lastName, specialty, color')
    .in('role', ['admin', 'doctor'])
    .eq('isActive', true)
    
  const isDoctor = currentUser?.role === 'doctor'

  const doctorsForSelect = (doctors || [])
    .filter(d => isDoctor ? d.id === currentUser?.id : true)
    .map(d => ({
      id: d.id,
      name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Doctor',
      specialty: d.specialty,
      color: d.color
    }))



  // Determinar el mes a consultar usando la fecha recibida o "hoy en Bolivia"
  let queryYear: number
  let queryMonth: number // 0-indexed

  if (searchParams?.date) {
    // El parámetro viene como YYYY-MM-DD — parsearlo directo, NO como new Date()
    const [y, m, d] = (searchParams.date as string).split('-').map(Number)
    queryYear = y
    queryMonth = m - 1
  } else {
    // Usar la fecha de hoy en hora de Bolivia (America/La_Paz)
    const todayBO = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
    const [y, m] = todayBO.split('-').map(Number)
    queryYear = y
    queryMonth = m - 1
  }

  // Calcular los límites del mes con buffer de 7 días para la grilla del calendario.
  // Usamos strings locales YYYY-MM-DDTHH:mm:ss porque las citas se almacenan en hora local (sin Z).
  const startDate = new Date(queryYear, queryMonth, 1)
  startDate.setDate(startDate.getDate() - 7)
  const endDate = new Date(queryYear, queryMonth + 1, 0)
  endDate.setDate(endDate.getDate() + 7)

  const pad2 = (n: number) => String(n).padStart(2, '0')
  const toLocalISO = (d: Date) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T00:00:00`
  const toLocalISOEnd = (d: Date) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T23:59:59`

  const startISO = toLocalISO(startDate)
  const endISO = toLocalISOEnd(endDate)

  let query = supabase
    .from('Appointment')
    .select(`
      id,
      startsAt,
      endsAt,
      status,
      treatmentType,
      notes,
      patientId,
      doctorId,
      Patient:patientId (
        id,
        firstName,
        lastName,
        phone
      ),
      doctor:doctorId (
        id,
        firstName,
        lastName,
        color
      )
    `)
    .gte('startsAt', startISO)
    .lte('startsAt', endISO)
    .not('status', 'eq', 'CANCELADO')

  if (isDoctor && currentUser?.id) {
    query = query.eq('doctorId', currentUser.id)
  }

  const { data: rawAppointments } = await query.order('startsAt', { ascending: true })

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
    },
    doctor: app.doctor ? {
      name: `${app.doctor.firstName || ''} ${app.doctor.lastName || ''}`.trim(),
      color: app.doctor.color
    } : null
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
        doctors={doctorsForSelect}
      />
    </div>
  )
}
