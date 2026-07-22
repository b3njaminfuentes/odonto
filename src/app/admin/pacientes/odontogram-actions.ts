'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

export async function getOdontogram(patientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Odontogram')
    .select('*')
    .eq('patientId', patientId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching odontogram:', error)
  }

  return data?.chart || {}
}

export async function saveOdontogram(patientId: string, chartData: any) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'No autorizado' }
  }

  const { data, error } = await supabase
    .from('Odontogram')
    .upsert({
      patientId,
      chart: chartData,
      updatedAt: new Date().toISOString()
    }, { onConflict: 'patientId' })
    .select()
    .single()

  if (error) {
    console.error('Error saving odontogram:', error)
    return { error: 'No se pudo guardar el odontograma' }
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'UPDATE_ODONTOGRAM',
    entity: 'Odontogram',
    entityId: data.id,
    metadata: { patientId }
  })

  revalidatePath(`/admin/pacientes/${patientId}`)

  return { success: true }
}
