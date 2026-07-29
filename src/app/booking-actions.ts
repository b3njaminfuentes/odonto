'use server'

import { createClient as createAdminJsClient } from '@supabase/supabase-js'

function admin() {
  return createAdminJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/** Horas ya ocupadas (no disponibles) para una fecha dada — para deshabilitar slots. */
export async function getBookedSlots(dateISO: string): Promise<string[]> {
  try {
    const day = new Date(dateISO)
    if (isNaN(day.getTime())) return []
    const start = new Date(day); start.setHours(0, 0, 0, 0)
    const end = new Date(day); end.setHours(23, 59, 59, 999)
    const { data } = await admin()
      .from('Appointment')
      .select('startsAt, status')
      .gte('startsAt', start.toISOString())
      .lte('startsAt', end.toISOString())
      .not('status', 'eq', 'CANCELADO')
    const times = (data || []).map((a: any) =>
      new Date(a.startsAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })
    )

    // Agrupar las citas por horario para permitir hasta 2 por el mismo horario
    const timeCounts = times.reduce((acc: any, time: string) => {
      acc[time] = (acc[time] || 0) + 1
      return acc
    }, {})

    // Devolver solo los horarios que tienen 2 o más reservas (completamente ocupados)
    return Object.keys(timeCounts).filter(time => timeCounts[time] >= 2)
  } catch {
    return []
  }
}

/** Solicitud pública de cita. Crea una cita PENDIENTE que la doctora confirma luego. */
export async function requestAppointment(input: {
  service: string
  dateISO: string
  time: string
  name: string
  phone: string
}): Promise<{ success: true } | { error: string }> {
  try {
    const { service, dateISO, time, name, phone } = input

    // Validación básica anti-spam / integridad.
    if (!name?.trim() || name.trim().length < 2) return { error: 'Ingresá tu nombre.' }
    if (!phone?.trim() || phone.replace(/[^\d+]/g, '').length < 6) return { error: 'Ingresá un teléfono válido.' }
    if (!service || !dateISO || !/^\d{2}:\d{2}$/.test(time)) return { error: 'Datos de la cita incompletos.' }

    // Construir la fecha/hora a partir de año-mes-día locales (evita corrimientos de huso horario
    // entre el navegador del paciente y el servidor).
    const datePart = dateISO.slice(0, 10)
    const startsAtStr = `${datePart}T${time}:00`
    const [h, m] = time.split(':').map(Number)
    const totalMinutes = h * 60 + m + 30
    const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
    const endM = String(totalMinutes % 60).padStart(2, '0')
    const endsAtStr = `${datePart}T${endH}:${endM}:00`

    // Validación anti-pasado en hora local de Bolivia
    const nowBO = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date()).replace(' ', 'T')

    if (startsAtStr.slice(0, 16) < nowBO) return { error: 'Esa fecha ya pasó.' }

    const sb = admin()

    // Evitar triple reserva exacta del mismo horario (máximo 2 permitidas).
    const { data: clash, error: clashError } = await sb
      .from('Appointment')
      .select('id')
      .eq('startsAt', startsAtStr)
      .not('status', 'eq', 'CANCELADO')
      .limit(2)
    if (clashError) {
      console.error('requestAppointment clash check error:', clashError)
      return { error: 'No se pudo verificar disponibilidad. Intentá de nuevo.' }
    }
    if (clash && clash.length >= 2) return { error: 'Ese horario acaba de ocuparse. Elegí otro, por favor.' }

    // Conciliación de paciente: buscar por teléfono
    let patientIdToLink: string | null = null
    const { data: existingPatientData } = await sb
      .from('Patient')
      .select('id')
      .eq('phone', phone.trim())
      .limit(1)
      
    const existingPatient = existingPatientData?.[0]

    if (existingPatient) {
      patientIdToLink = existingPatient.id
    } else {
      // Crear pre-perfil automáticamente
      const newPatientCode = `PT-${Math.floor(100000 + Math.random() * 900000)}`
      const [fName, ...lNameArr] = name.trim().split(' ')
      const { data: newPatient, error: createError } = await sb
        .from('Patient')
        .insert({
          patientCode: newPatientCode,
          firstName: fName || 'Paciente',
          lastName: lNameArr.join(' ') || 'Web',
          phone: phone.trim(),
          status: 'ACTIVE'
        })
        .select('id')
        .single()
      
      if (!createError && newPatient) {
        patientIdToLink = newPatient.id
      }
    }

    const { error } = await sb.from('Appointment').insert({
      patientId: patientIdToLink,
      treatmentType: service,
      startsAt: startsAtStr,
      endsAt: endsAtStr,
      status: 'PENDIENTE',
      notes: `Solicitud web automática`,
    })

    if (error) {
      // 23P01 = violación de la restricción de exclusión (choque real detectado por la DB,
      // incluso si dos personas reservan el mismo instante en simultáneo).
      if (error.code === '23P01') return { error: 'Ese horario acaba de ocuparse. Elegí otro, por favor.' }
      console.error('requestAppointment insert error:', error)
      return { error: 'No se pudo registrar la solicitud. Intentá de nuevo.' }
    }
    return { success: true }
  } catch (e: any) {
    console.error('requestAppointment unexpected error:', e)
    return { error: 'Ocurrió un error inesperado. Por favor, escribinos por WhatsApp.' }
  }
}
