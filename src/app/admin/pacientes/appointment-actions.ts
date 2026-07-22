'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPatientAppointments(patientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Appointment')
    .select('*')
    .eq('patientId', patientId)
    .order('startsAt', { ascending: false })

  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }

  return data
}
