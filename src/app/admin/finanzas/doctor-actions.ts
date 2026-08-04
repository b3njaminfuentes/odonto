'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'
import { getCurrentClinicId } from '@/lib/tenant'

export async function getDoctorPayments() {
  const supabase = createAdminClient()
  const clinicId = await getCurrentClinicId()
  
  const { data, error } = await supabase
    .from('DoctorPayment')
    .select(`
      *,
      doctor:Profile(id, firstName, lastName, color)
    `)
    .eq('clinicId', clinicId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching doctor payments:', error)
    return []
  }

  return data
}

export async function getDoctorsList() {
  const supabase = createAdminClient()
  const clinicId = await getCurrentClinicId()

  const { data, error } = await supabase
    .from('Profile')
    .select('id, firstName, lastName, role, color')
    .in('role', ['doctor', 'admin'])
    .order('firstName')

  if (error) {
    console.error('Error fetching doctors list:', error)
    return []
  }

  return data || []
}

export async function createDoctorPayment(formData: FormData) {
  const userClient = createClient()
  const supabase = createAdminClient()
  const clinicId = await getCurrentClinicId()

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
      clinicId,
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
    metadata: { doctorId, amount, description }
  })

  revalidatePath('/admin/finanzas')
  return { success: true, payment: data }
}

export async function deleteDoctorPayment(id: string) {
  const userClient = createClient()
  const supabase = createAdminClient()
  const { data: { session } } = await userClient.auth.getSession()
  if (!session) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('DoctorPayment')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting doctor payment:', error)
    return { error: 'No se pudo eliminar el pago' }
  }

  revalidatePath('/admin/finanzas')
  return { success: true }
}
