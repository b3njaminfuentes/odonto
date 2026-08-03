'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

export async function getDoctorPayments() {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('DoctorPayment')
    .select(`
      *,
      doctor:Profile(id, firstName, lastName, color)
    `)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching doctor payments:', error)
    return []
  }

  return data
}

export async function createDoctorPayment(formData: FormData) {
  const userClient = createClient()
  const supabase = createAdminClient()
  const { data: { session } } = await userClient.auth.getSession()
  if (!session) return { error: 'No autorizado' }

  const doctorId = formData.get('doctorId') as string
  const amountStr = formData.get('amount') as string
  const description = formData.get('description') as string
  const signatureUrl = formData.get('signatureUrl') as string | null

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) return { error: 'Monto inválido' }
  if (!doctorId) return { error: 'Debe seleccionar un doctor' }

  const { data, error } = await supabase
    .from('DoctorPayment')
    .insert({
      doctorId,
      amount,
      description: description || null,
      signatureUrl: signatureUrl || null,
      date: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating doctor payment:', error)
    return { error: 'No se pudo registrar el pago' }
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'CREATE',
    entity: 'DoctorPayment',
    entityId: data.id,
    metadata: { doctorId, amount }
  }).catch(() => {})

  revalidatePath('/admin/finanzas')
  return { success: true }
}

export async function getDoctorsList() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('Profile')
    .select('id, firstName, lastName')
    .eq('role', 'doctor')
    .order('firstName', { ascending: true })

  if (error) return []
  return data
}
