'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

export async function createPayment(formData: FormData) {
  const supabase = createClient()
  
  const patientId = formData.get('patientId') as string
  const amountStr = formData.get('amount') as string
  const method = formData.get('method') as string
  const notes = formData.get('concept') as string // Using 'concept' from form input as 'notes' in DB

  const amount = parseFloat(amountStr)

  if (!patientId || isNaN(amount) || amount <= 0 || !method || !notes) {
    return { error: 'Todos los campos son obligatorios y el monto debe ser válido.' }
  }

  // Insertar pago
  const { data, error } = await supabase
    .from('Payment')
    .insert({
      patientId,
      amount,
      method,
      notes,
      date: new Date().toISOString(),
      status: 'COMPLETADO' // Para el MVP asumimos que el pago se registra al concretarse
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating payment:', error)
    return { error: 'Ocurrió un error al registrar el pago.' }
  }

  // Get current user id to log action
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user?.id) {
    await logAuditAction({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Payment',
      entityId: data.id,
      metadata: { amount, method }
    })
  }

  // Refrescar caché de Finanzas y del Dashboard principal
  revalidatePath('/admin/finanzas')
  revalidatePath('/admin')
  
  return { success: true, payment: data }
}
