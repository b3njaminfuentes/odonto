'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Creamos un código de paciente aleatorio. Ej: PT-100234
const generatePatientCode = () => `PT-${Math.floor(100000 + Math.random() * 900000)}`

export async function createPatient(formData: FormData) {
  const supabase = createClient()
  
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const dob = formData.get('dob') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const dni = formData.get('dni') as string
  const emergencyContactName = formData.get('emergencyContactName') as string
  const emergencyContactPhone = formData.get('emergencyContactPhone') as string

  // Validación básica
  if (!firstName || !lastName || !dob) {
    return { error: 'Nombre, Apellido y Fecha de Nacimiento son obligatorios.' }
  }

  // Insertar en Supabase usando el JWT de sesión del Admin (RLS se encargará de dejarlo pasar)
  const { data, error } = await supabase
    .from('Patient')
    .insert({
      patientCode: generatePatientCode(),
      firstName,
      lastName,
      dob,
      email: email || null,
      phone: phone || null,
      dni: dni || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      status: 'ACTIVE',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating patient:', error)
    if (error.code === '23505') {
      return { error: 'Ya existe un paciente con ese DNI o Email.' }
    }
    return { error: 'Ocurrió un error inesperado al crear el paciente.' }
  }

  // Refresca la caché de Next.js para que el nuevo paciente aparezca instantáneamente
  revalidatePath('/admin/pacientes')
  
  return { success: true, patient: data }
}
