'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

export async function getClinicalHistory(patientId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('ClinicalHistory')
    .select(`
      *,
      versions:ClinicalHistoryVersion(
        id,
        medicalHistory,
        dentalBackground,
        observations,
        changedBy,
        createdAt
      )
    `)
    .eq('patientId', patientId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching clinical history:', error)
  }

  if (data && data.versions) {
    data.versions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return data || null
}

export async function saveEvolutionNote(patientId: string, noteText: string, currentMedicalHistory: any) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { error: 'No autorizado' }

  let historyId: string
  const { data: existingHistory } = await supabase
    .from('ClinicalHistory')
    .select('id')
    .eq('patientId', patientId)
    .single()

  if (!existingHistory) {
    const { data: newHistory, error: createErr } = await supabase
      .from('ClinicalHistory')
      .insert({ patientId, medicalHistory: currentMedicalHistory, observations: noteText, updatedAt: new Date().toISOString() })
      .select('id')
      .single()
      
    if (createErr || !newHistory) return { error: 'No se pudo inicializar el historial.' }
    historyId = newHistory.id
  } else {
    historyId = existingHistory.id
    await supabase.from('ClinicalHistory').update({ observations: noteText, medicalHistory: currentMedicalHistory }).eq('id', historyId)
  }

  const { data: version, error: versionError } = await supabase
    .from('ClinicalHistoryVersion')
    .insert({
      clinicalHistoryId: historyId,
      medicalHistory: currentMedicalHistory,
      observations: noteText,
      changedBy: session.user.id
    })
    .select()
    .single()

  if (versionError) {
    console.error('Error saving history version:', versionError)
    return { error: 'No se pudo guardar la nota de evolución.' }
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'ADD_EVOLUTION_NOTE',
    entity: 'ClinicalHistoryVersion',
    entityId: version.id,
    metadata: { patientId }
  })

  revalidatePath(`/admin/pacientes/${patientId}`)
  return { success: true }
}

export async function updateGeneralHistory(patientId: string, medicalHistory: any, dentalBackground: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'No autorizado' }

  let historyId: string
  const { data: existingHistory } = await supabase
    .from('ClinicalHistory')
    .select('id, observations')
    .eq('patientId', patientId)
    .single()

  if (!existingHistory) {
    const { data: newHistory, error: createErr } = await supabase
      .from('ClinicalHistory')
      .insert({ patientId, medicalHistory, dentalBackground, updatedAt: new Date().toISOString() })
      .select('id')
      .single()
    if (createErr || !newHistory) return { error: 'No se pudo guardar el historial.' }
    historyId = newHistory.id
  } else {
    historyId = existingHistory.id
    await supabase.from('ClinicalHistory')
      .update({ medicalHistory, dentalBackground })
      .eq('id', historyId)
  }

  await supabase.from('ClinicalHistoryVersion').insert({
    clinicalHistoryId: historyId,
    medicalHistory,
    dentalBackground,
    observations: existingHistory ? existingHistory.observations : 'Actualización de antecedentes',
    changedBy: session.user.id
  })

  revalidatePath(`/admin/pacientes/${patientId}`)
  return { success: true }
}
