'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAppointment(formData: FormData) {
  const supabase = createClient()
  
  const patientId = formData.get('patientId') as string
  const startsAt = formData.get('startsAt') as string // ISO string o "YYYY-MM-DDTHH:mm"
  const duration = parseInt(formData.get('duration') as string) || 30
  const treatmentType = formData.get('type') as string
  const notes = formData.get('notes') as string

  if (!patientId || !startsAt || !treatmentType) {
    return { error: 'Faltan campos obligatorios.' }
  }

  const startObj = new Date(startsAt)
  const endsAtObj = new Date(startObj.getTime() + duration * 60000)
  
  const startISO = startObj.toISOString()
  const endISO = endsAtObj.toISOString()

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

  if (overlapping && overlapping.length > 0) {
    return { error: '¡El horario seleccionado choca con otro turno existente!' }
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
    console.error('Error creating appointment:', error)
    return { error: 'No se pudo crear la cita.' }
  }

  revalidatePath('/admin/calendario')
  revalidatePath(`/admin/pacientes/${patientId}`)
  
  return { success: true, appointment: data }
}

// Acción para cancelar o actualizar el estado de una cita
export async function updateAppointmentStatus(appointmentId: string, status: 'CONFIRMADO' | 'PENDIENTE' | 'CANCELADO' | 'COMPLETADO') {
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
