'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markReminderAsSent(appointmentId: string) {
  try {
    const userClient = createClient()
    const supabase = createAdminClient()
    const { data: { session } } = await userClient.auth.getSession()
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
