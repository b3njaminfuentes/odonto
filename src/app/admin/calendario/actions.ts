'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAppointment(formData: FormData) {
  try {
    return await createAppointmentInner(formData)
  } catch (e: any) {
    console.error('Unexpected error in createAppointment:', e)
    return { error: 'Ocurrió un error inesperado al crear la cita.' }
  }
}

async function createAppointmentInner(formData: FormData) {
  const supabase = createClient()

  const patientId = formData.get('patientId') as string
  // Aceptamos startsAt directo, o date + time por separado (UI más simple).
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const rawStarts = formData.get('startsAt') as string
  const duration = parseInt(formData.get('duration') as string) || 30
  const treatmentType = formData.get('type') as string
  const notes = formData.get('notes') as string

  let startISO: string
  let endISO: string

  if (date && time) {
    startISO = `${date}T${time}:00`
    const [h, m] = time.split(':').map(Number)
    const totalMinutes = h * 60 + m + duration
    const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
    const endM = String(totalMinutes % 60).padStart(2, '0')
    endISO = `${date}T${endH}:${endM}:00`
  } else if (rawStarts) {
    startISO = rawStarts.slice(0, 19)
    const d = new Date(rawStarts)
    endISO = new Date(d.getTime() + duration * 60000).toISOString().slice(0, 19)
  } else {
    return { error: 'Faltan campos obligatorios.' }
  }

  if (!patientId || !treatmentType) {
    return { error: 'Faltan campos obligatorios.' }
  }

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

  if (startISO.slice(0, 16) < nowBO) {
    return { error: 'No se puede agendar en una fecha u hora que ya pasó.' }
  }

  // 1. Lógica de prevención de choques (Overlap check)
  // Un choque ocurre si: (Existente_Start < Nuevo_End) AND (Existente_End > Nuevo_Start)
  const { data: overlapping, error: overlapError } = await supabase
    .from('Appointment')
    .select('id')
    .not('status', 'eq', 'CANCELADO')
    .lt('startsAt', endISO)
    .gt('endsAt', startISO)
    
  if (overlapError) {
    console.error('Error checking overlaps:', overlapError)
    return { error: 'Error interno validando disponibilidad.' }
  }

  if (overlapping && overlapping.length >= 2) {
    return { error: '¡El horario seleccionado ya tiene el máximo de 2 turnos asignados!' }
  }

  // 2. Crear la cita
  const { data, error } = await supabase
    .from('Appointment')
    .insert({
      patientId,
      startsAt: startISO,
      endsAt: endISO,
      status: 'CONFIRMADO', // Para este MVP, asumimos que se confirma al agendar
      treatmentType,
      notes: notes || null
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23P01') return { error: '¡El horario seleccionado ya tiene el máximo de turnos asignados!' }
    console.error('Error creating appointment:', error)
    return { error: 'No se pudo crear la cita.' }
  }

  revalidatePath('/admin/calendario')
  revalidatePath(`/admin/pacientes/${patientId}`)
  
  return { success: true, appointment: data }
}

// Acción para cancelar o actualizar el estado de una cita
export async function updateAppointmentStatus(appointmentId: string, status: 'CONFIRMADO' | 'PENDIENTE' | 'CANCELADO') {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('Appointment')
    .update({ status })
    .eq('id', appointmentId)

  if (error) {
    console.error('Error updating appointment:', error)
    return { error: 'No se pudo actualizar la cita.' }
  }

  revalidatePath('/admin/calendario')
  return { success: true }
}
