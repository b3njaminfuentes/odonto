'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

export async function getClinicalHistory(patientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ClinicalHistory')
    .select('*')
    .eq('patientId', patientId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which is fine for a new patient
    console.error('Error fetching clinical history:', error)
  }

  return data || null
}

export async function saveClinicalHistory(formData: FormData) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'No autorizado' }
  }

  const patientId = formData.get('patientId') as string
  const medicalBackground = formData.get('medicalBackground') as string
  const dentalBackground = formData.get('dentalBackground') as string
  const allergies = formData.get('allergies') as string
  const observations = formData.get('observations') as string

  // UPSERT the history
  const { data, error } = await supabase
    .from('ClinicalHistory')
    .upsert({
      patientId,
      medicalBackground,
      dentalBackground,
      allergies,
      observations
    }, { onConflict: 'patientId' })
    .select()
    .single()

  if (error) {
    console.error('Error saving clinical history:', error)
    return { error: 'No se pudo guardar el historial' }
  }

  // Record version history in ClinicalHistoryVersion
  const { error: versionError } = await supabase
    .from('ClinicalHistoryVersion')
    .insert({
      historyId: data.id,
      medicalBackground,
      dentalBackground,
      allergies,
      observations,
      modifiedBy: session.user.id
    })

  if (versionError) {
    console.error('Error saving history version:', versionError)
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'UPDATE_HISTORY',
    entity: 'ClinicalHistory',
    entityId: data.id,
    metadata: { patientId }
  })

  revalidatePath(`/admin/pacientes/${patientId}`)

  return { success: true, history: data }
}
