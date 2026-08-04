'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

export async function getPatientTreatments(patientId: string) {
  const supabase = createAdminClient()
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
  const userClient = createClient()
  const supabase = createAdminClient()
  const { data: { session } } = await userClient.auth.getSession()

  if (!session) {
    return { error: 'No autorizado' }
  }

  const patientId = formData.get('patientId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const toothNumber = formData.get('toothNumber') as string
  const budgetStr = formData.get('budget') as string
  const finalCostStr = formData.get('finalCost') as string
  const status = formData.get('status') as string || 'ACTIVO'
  const startDate = new Date().toISOString()

  const budget = budgetStr ? parseFloat(budgetStr) : null
  const finalCost = finalCostStr ? parseFloat(finalCostStr) : null

  if (!patientId || !name) {
    return { error: 'Faltan campos obligatorios' }
  }
  if (budget !== null && (isNaN(budget) || budget < 0)) return { error: 'El presupuesto no puede ser negativo.' }
  if (finalCost !== null && (isNaN(finalCost) || finalCost < 0)) return { error: 'El costo final no puede ser negativo.' }

  const { data, error } = await supabase
    .from('Treatment')
    .insert({
      patientId,
      name,
      description: description || null,
      toothNumber: toothNumber || null,
      budget,
      finalCost,
      startDate,
      status
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
  const supabase = createAdminClient()
  
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

export async function updateTreatment(treatmentId: string, formData: FormData) {
  const userClient = createClient()
  const supabase = createAdminClient()
  const { data: { session } } = await userClient.auth.getSession()

  if (!session) {
    return { error: 'No autorizado' }
  }

  const patientId = formData.get('patientId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const toothNumber = formData.get('toothNumber') as string
  const budgetStr = formData.get('budget') as string
  const finalCostStr = formData.get('finalCost') as string
  const status = formData.get('status') as string

  const budget = budgetStr ? parseFloat(budgetStr) : null
  const finalCost = finalCostStr ? parseFloat(finalCostStr) : null

  if (!name) {
    return { error: 'El nombre es obligatorio' }
  }
  if (budget !== null && (isNaN(budget) || budget < 0)) return { error: 'El presupuesto no puede ser negativo.' }
  if (finalCost !== null && (isNaN(finalCost) || finalCost < 0)) return { error: 'El costo final no puede ser negativo.' }

  const { error } = await supabase
    .from('Treatment')
    .update({
      name,
      description: description || null,
      toothNumber: toothNumber || null,
      budget,
      finalCost,
      status
    })
    .eq('id', treatmentId)

  if (error) {
    console.error('Error updating treatment:', error)
    return { error: 'No se pudo actualizar el tratamiento' }
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Treatment',
    entityId: treatmentId,
    metadata: { patientId, name }
  })

  revalidatePath(`/admin/pacientes/${patientId}`)
  return { success: true }
}

export async function deleteTreatment(treatmentId: string, patientId: string) {
  const userClient = createClient()
  const supabase = createAdminClient()
  const { data: { session } } = await userClient.auth.getSession()

  if (!session) {
    return { error: 'No autorizado' }
  }

  const { error } = await supabase
    .from('Treatment')
    .delete()
    .eq('id', treatmentId)

  if (error) {
    console.error('Error deleting treatment:', error)
    return { error: 'No se pudo eliminar el tratamiento' }
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'DELETE',
    entity: 'Treatment',
    entityId: treatmentId,
    metadata: { patientId }
  }).catch(() => {})

  revalidatePath(`/admin/pacientes/${patientId}`)
  revalidatePath('/admin/tratamientos')
  return { success: true }
}

