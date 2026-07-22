'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

export async function getPatientTreatments(patientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Treatment')
    .select('*')
    .eq('patientId', patientId)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching treatments:', error)
    return []
  }

  return data
}

export async function createTreatment(formData: FormData) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'No autorizado' }
  }

  const patientId = formData.get('patientId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const budgetStr = formData.get('budget') as string
  const startDate = new Date().toISOString()

  const budget = budgetStr ? parseFloat(budgetStr) : 0

  if (!patientId || !name) {
    return { error: 'Faltan campos obligatorios' }
  }

  const { data, error } = await supabase
    .from('Treatment')
    .insert({
      patientId,
      name,
      description,
      budget,
      startDate,
      status: 'ACTIVO'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating treatment:', error)
    return { error: 'No se pudo crear el tratamiento' }
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'CREATE',
    entity: 'Treatment',
    entityId: data.id,
    metadata: { patientId, name }
  })

  revalidatePath(`/admin/pacientes/${patientId}`)
  revalidatePath('/admin/tratamientos')

  return { success: true, treatment: data }
}

export async function updateTreatmentStatus(treatmentId: string, status: 'ACTIVO' | 'COMPLETADO' | 'PAUSADO' | 'CANCELADO', patientId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('Treatment')
    .update({ status })
    .eq('id', treatmentId)

  if (error) {
    console.error('Error updating treatment status:', error)
    return { error: 'No se pudo actualizar el tratamiento' }
  }

  revalidatePath(`/admin/pacientes/${patientId}`)
  revalidatePath('/admin/tratamientos')

  return { success: true }
}
