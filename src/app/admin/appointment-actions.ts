'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markReminderAsSent(appointmentId: string) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { error: 'No autorizado' }

    const { error } = await supabase
      .from('Appointment')
      .update({ reminderSentAt: new Date().toISOString() })
      .eq('id', appointmentId)

    if (error) throw error

    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Error marking reminder as sent:', error)
    return { error: error.message }
  }
}
