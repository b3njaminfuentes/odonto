'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

export async function getPatientPayments(patientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Payment')
    .select(`
      *,
      treatment:Treatment(id, name, toothNumber)
    `)
    .eq('patientId', patientId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    return []
  }

  return data
}

export async function getPatientActiveTreatments(patientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Treatment')
    .select('id, name, toothNumber, budget, finalCost')
    .eq('patientId', patientId)
    .in('status', ['ACTIVO', 'PLANIFICADO'])
    .order('createdAt', { ascending: false })

  if (error) return []
  return data
}

export async function createPayment(formData: FormData) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'No autorizado' }

  const patientId = formData.get('patientId') as string
  const treatmentId = formData.get('treatmentId') as string
  const amountStr = formData.get('amount') as string
  const method = formData.get('method') as string
  const notes = formData.get('notes') as string
  
  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) return { error: 'Monto inválido' }

  const { data, error } = await supabase
    .from('Payment')
    .insert({
      patientId,
      treatmentId: treatmentId || null,
      amount,
      method,
      notes: notes || null,
      status: 'COMPLETADO',
      date: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating payment:', error)
    return { error: 'No se pudo registrar el pago' }
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'CREATE',
    entity: 'Payment',
    entityId: data.id,
    metadata: { patientId, amount }
  })

  revalidatePath(`/admin/pacientes/${patientId}`)
  return { success: true }
}

export async function updatePaymentStatus(paymentId: string, status: string, patientId: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('Payment')
    .update({ status })
    .eq('id', paymentId)

  if (error) {
    console.error('Error updating payment:', error)
    return { error: 'Error al actualizar pago' }
  }
  
  revalidatePath(`/admin/pacientes/${patientId}`)
  return { success: true }
}
