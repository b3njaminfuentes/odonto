'use server'

import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPatientAppointments(patientId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('Appointment')
    .select('*, doctor:doctorId(id, firstName, lastName, color)')
    .eq('patientId', patientId)
    .order('startsAt', { ascending: false })

  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }

  return data
}

export async function saveClinicalNotes(appointmentId: string, clinicalNotes: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('Appointment')
    .update({ 
      clinicalNotes,
      status: 'FINALIZADO'
    })
    .eq('id', appointmentId)
    .select()

  if (error) {
    console.error('Error saving clinical notes:', error)
    return { error: 'No se pudieron guardar las notas clínicas.' }
  }

  revalidatePath('/admin/pacientes/[id]')
  return { success: true, data }
}
