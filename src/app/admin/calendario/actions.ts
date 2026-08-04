'use server'

import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentClinicId } from '@/lib/tenant'

export async function createAppointment(formData: FormData) {
  try {
    return await createAppointmentInner(formData)
  } catch (e: any) {
    console.error('Unexpected error in createAppointment:', e)
    return { error: 'Ocurrió un error inesperado al crear la cita.' }
  }
}

async function createAppointmentInner(formData: FormData) {
  const supabase = createAdminClient()
  const clinicId = await getCurrentClinicId()

  const patientId = formData.get('patientId') as string
  // Aceptamos startsAt directo, o date + time por separado (UI más simple).
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const rawStarts = formData.get('startsAt') as string
  const duration = parseInt(formData.get('duration') as string) || 30
  const treatmentType = formData.get('type') as string
  const notes = formData.get('notes') as string
  const doctorId = formData.get('doctorId') as string || null

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
  // Límite de la clínica: máximo 2 citas al mismo tiempo (2 sillones)
  const { data: overlapping, error: overlapError } = await supabase
    .from('Appointment')
    .select('id, doctorId')
    .eq('clinicId', clinicId)
    .not('status', 'eq', 'CANCELADO')
    .lt('startsAt', endISO)
    .gt('endsAt', startISO)
    
  if (overlapError) {
    console.error('Error checking overlaps:', overlapError)
    return { error: 'Error interno validando disponibilidad.' }
  }

  if (overlapping && overlapping.length >= 2) {
    return { error: '¡El horario seleccionado ya tiene el máximo de 2 turnos asignados (Sillones llenos)!' }
  }

  // 1.b Validación estricta para el mismo doctor
  // Un doctor no puede atender a dos pacientes a la misma vez.
  if (doctorId) {
    const doctorOverlaps = overlapping?.filter(app => app.doctorId === doctorId) || []
    if (doctorOverlaps.length >= 1) {
      return { error: '¡El especialista ya tiene una cita asignada en ese horario!' }
    }
  }

  // 2. Crear la cita
  const { data, error } = await supabase
    .from('Appointment')
    .insert({
      clinicId,
      patientId,
      doctorId,
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

export async function updateAppointment(appointmentId: string, formData: FormData) {
  try {
    const supabase = createAdminClient()
    const patientId = formData.get('patientId') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const duration = parseInt(formData.get('duration') as string) || 30
    const treatmentType = formData.get('type') as string
    const notes = formData.get('notes') as string
    const doctorId = formData.get('doctorId') as string || null

    if (!date || !time || !patientId || !treatmentType) {
      return { error: 'Faltan campos obligatorios.' }
    }

    const startISO = `${date}T${time}:00`
    const [h, m] = time.split(':').map(Number)
    const totalMinutes = h * 60 + m + duration
    const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
    const endM = String(totalMinutes % 60).padStart(2, '0')
    const endISO = `${date}T${endH}:${endM}:00`

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

    // 1. Lógica de prevención de choques (Overlap check) excluyendo esta cita
    const { data: overlapping, error: overlapError } = await supabase
      .from('Appointment')
      .select('id, doctorId')
      .neq('id', appointmentId)
      .not('status', 'eq', 'CANCELADO')
      .lt('startsAt', endISO)
      .gt('endsAt', startISO)
      
    if (overlapError) {
      console.error('Error checking overlaps:', overlapError)
      return { error: 'Error interno validando disponibilidad.' }
    }

    if (overlapping && overlapping.length >= 2) {
      return { error: '¡El horario seleccionado ya tiene el máximo de 2 turnos asignados (Sillones llenos)!' }
    }

    // 1.b Validación estricta para el mismo doctor
    if (doctorId) {
      const doctorOverlaps = overlapping?.filter(app => app.doctorId === doctorId) || []
      if (doctorOverlaps.length >= 1) {
        return { error: '¡El especialista ya tiene una cita asignada en ese horario!' }
      }
    }

    // 2. Actualizar la cita
    const { data, error } = await supabase
      .from('Appointment')
      .update({
        doctorId,
        startsAt: startISO,
        endsAt: endISO,
        treatmentType,
        notes: notes || null
      })
      .eq('id', appointmentId)
      .select()
      .single()

    if (error) {
      if (error.code === '23P01') return { error: '¡El horario seleccionado ya tiene el máximo de turnos asignados!' }
      console.error('Error updating appointment:', error)
      return { error: 'No se pudo actualizar la cita.' }
    }

    revalidatePath('/admin/calendario')
    revalidatePath(`/admin/pacientes/${patientId}`)
    
    return { success: true, appointment: data }
  } catch (e: any) {
    console.error('Unexpected error in updateAppointment:', e)
    return { error: 'Ocurrió un error inesperado al editar la cita.' }
  }
}

// Acción para cancelar o actualizar el estado de una cita
export async function updateAppointmentStatus(appointmentId: string, status: 'CONFIRMADO' | 'PENDIENTE' | 'CANCELADO') {
  const supabase = createAdminClient()
  
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
