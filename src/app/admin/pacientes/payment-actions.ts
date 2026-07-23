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
    .in('status', ['ACTIVO', 'PAUSADO'])
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

export interface AccountStatement {
  treatments: {
    id: string
    name: string
    toothNumber: string | null
    status: string
    cost: number
    paid: number
    balance: number
    percent: number
  }[]
  totalCost: number
  totalPaid: number
  balance: number
  generalPaid: number // pagos no vinculados a un tratamiento
}

/**
 * Estado de cuenta del paciente: por cada tratamiento (no cancelado) calcula
 * costo (finalCost o presupuesto), pagado (suma de pagos COMPLETADOS vinculados)
 * y saldo. Devuelve también los totales del paciente.
 */
export async function getAccountStatement(patientId: string): Promise<AccountStatement> {
  const supabase = createClient()
  const [{ data: treatments }, { data: payments }] = await Promise.all([
    supabase.from('Treatment').select('id, name, toothNumber, budget, finalCost, status').eq('patientId', patientId).neq('status', 'CANCELADO'),
    supabase.from('Payment').select('amount, status, treatmentId').eq('patientId', patientId).eq('status', 'COMPLETADO'),
  ])

  const paidByTreatment: Record<string, number> = {}
  let generalPaid = 0
  for (const p of payments || []) {
    const amt = Number(p.amount) || 0
    if (p.treatmentId) paidByTreatment[p.treatmentId] = (paidByTreatment[p.treatmentId] || 0) + amt
    else generalPaid += amt
  }

  const rows = (treatments || []).map((t: any) => {
    const cost = Number(t.finalCost ?? t.budget ?? 0)
    const paid = paidByTreatment[t.id] || 0
    const balance = Math.max(cost - paid, 0)
    return {
      id: t.id,
      name: t.name,
      toothNumber: t.toothNumber ?? null,
      status: t.status,
      cost,
      paid,
      balance,
      percent: cost > 0 ? Math.min(Math.round((paid / cost) * 100), 100) : 0,
    }
  })

  const totalCost = rows.reduce((s, r) => s + r.cost, 0)
  const totalPaid = (payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0)
  const balance = Math.max(totalCost - totalPaid, 0)

  return { treatments: rows, totalCost, totalPaid, balance, generalPaid }
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
