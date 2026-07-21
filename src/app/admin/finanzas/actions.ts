'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPayment(formData: FormData) {
  const supabase = createClient()
  
  const patientId = formData.get('patientId') as string
  const amountStr = formData.get('amount') as string
  const method = formData.get('method') as string
  const concept = formData.get('concept') as string

  const amount = parseFloat(amountStr)

  if (!patientId || isNaN(amount) || amount <= 0 || !method || !concept) {
    return { error: 'Todos los campos son obligatorios y el monto debe ser válido.' }
  }

  // Insertar pago
  const { data, error } = await supabase
    .from('Payment')
    .insert({
      patientId,
      amount,
      method,
      concept,
      date: new Date().toISOString(),
      status: 'COMPLETADO' // Para el MVP asumimos que el pago se registra al concretarse
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating payment:', error)
    return { error: 'Ocurrió un error al registrar el pago.' }
  }

  // Refrescar caché de Finanzas y del Dashboard principal
  revalidatePath('/admin/finanzas')
  revalidatePath('/admin')
  
  return { success: true, payment: data }
}
