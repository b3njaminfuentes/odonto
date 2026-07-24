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
    return (data || []).map((a: any) =>
      new Date(a.startsAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })
    )
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
    const day = new Date(dateISO)
    if (isNaN(day.getTime())) return { error: 'Fecha inválida.' }
    const [h, m] = time.split(':').map(Number)
    const startsAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0, 0)
    const now = new Date()
    if (startsAt.getTime() < now.getTime() - 5 * 60 * 1000) return { error: 'Esa fecha ya pasó.' }
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000)

    const sb = admin()

    // Evitar doble reserva exacta del mismo horario.
    const { data: clash, error: clashError } = await sb
      .from('Appointment')
      .select('id')
      .eq('startsAt', startsAt.toISOString())
      .not('status', 'eq', 'CANCELADO')
      .limit(1)
    if (clashError) {
      console.error('requestAppointment clash check error:', clashError)
      return { error: 'No se pudo verificar disponibilidad. Intentá de nuevo.' }
    }
    if (clash && clash.length > 0) return { error: 'Ese horario acaba de ocuparse. Elegí otro, por favor.' }

    const { error } = await sb.from('Appointment').insert({
      patientId: null,
      treatmentType: service,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      status: 'PENDIENTE',
      notes: `Solicitud web — ${name.trim()} · Tel: ${phone.trim()}`,
    })

    if (error) {
      console.error('requestAppointment insert error:', error)
      return { error: 'No se pudo registrar la solicitud. Intentá de nuevo.' }
    }
    return { success: true }
  } catch (e: any) {
    console.error('requestAppointment unexpected error:', e)
    return { error: 'Ocurrió un error inesperado. Por favor, escribinos por WhatsApp.' }
  }
}
