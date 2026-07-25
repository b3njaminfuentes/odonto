'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'
import { intlBO, toBO } from '@/lib/datetime'
import { generatePatientAccess } from './access-actions'

// Creamos un código de paciente aleatorio. Ej: PT-100234
const generatePatientCode = () => `PT-${Math.floor(100000 + Math.random() * 900000)}`

export async function createPatient(formData: FormData) {
  try {
    const supabase = createClient()

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const dob = formData.get('dob') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const dni = formData.get('dni') as string
    const emergencyContactName = formData.get('emergencyContactName') as string
    const emergencyContactPhone = formData.get('emergencyContactPhone') as string
    const referralSource = formData.get('referralSource') as string

    // Al crear un paciente nuevo solo el nombre es obligatorio: la dra completa
    // el resto (email, teléfono, fecha de nacimiento, etc.) después, desde el perfil.
    if (!firstName || !lastName) {
      return { error: 'Nombre y Apellido son obligatorios.' }
    }

    // Insertar en Supabase usando el cliente autenticado normal
    const { data, error } = await supabase
      .from('Patient')
      .insert({
        patientCode: generatePatientCode(),
        firstName,
        lastName,
        dob: dob || null,
        email: email || null,
        phone: phone || null,
        dni: dni || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        referralSource: referralSource || null,
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating patient:', error)
      if (error.code === '23505') {
        return { error: 'Ya existe un paciente con ese DNI o Email.' }
      }
      return { error: `Error de BD: ${error.message || JSON.stringify(error)}` }
    }

    // Get current user id to log action
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user?.id) {
      await logAuditAction({
        userId: session.user.id,
        action: 'CREATE',
        entity: 'Patient',
        entityId: data.id,
        metadata: { patientCode: data.patientCode }
      })
    }

    // Refresca la caché de Next.js para que el nuevo paciente aparezca instantáneamente
    revalidatePath('/admin/pacientes')

    // Generamos de una el acceso real al portal (accessCode), para que el código
    // que se le muestra a la doctora sea el mismo que valida el login del paciente.
    const access = await generatePatientAccess(data.id)
    const accessCode = 'code' in access ? access.code : null

    return { success: true, patient: data, accessCode }
  } catch (err: any) {
    console.error('Unhandled exception in createPatient:', err)
    return { error: `Server exception: ${err?.message || 'Unknown error'}` }
  }
}

export async function updatePatient(patientId: string, formData: FormData) {
  try {
    const supabase = createClient()

    const firstName = (formData.get('firstName') as string)?.trim()
    const lastName = (formData.get('lastName') as string)?.trim()
    const dob = formData.get('dob') as string
    if (!firstName || !lastName) {
      return { error: 'Nombre y Apellido son obligatorios.' }
    }

    const { error } = await supabase
      .from('Patient')
      .update({
        firstName,
        lastName,
        dob: dob || null,
        email: (formData.get('email') as string)?.trim() || null,
        phone: (formData.get('phone') as string)?.trim() || null,
        dni: (formData.get('dni') as string)?.trim() || null,
        status: (formData.get('status') as string) || 'ACTIVE',
        emergencyContactName: (formData.get('emergencyContactName') as string)?.trim() || null,
        emergencyContactPhone: (formData.get('emergencyContactPhone') as string)?.trim() || null,
        referralSource: (formData.get('referralSource') as string)?.trim() || null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', patientId)

    if (error) {
      if (error.code === '23505') return { error: 'Ya existe otro paciente con ese DNI o Email.' }
      return { error: `Error de BD: ${error.message}` }
    }

    revalidatePath(`/admin/pacientes/${patientId}`)
    revalidatePath('/admin/pacientes')
    return { success: true }
  } catch (err: any) {
    console.error('Unhandled exception in updatePatient:', err)
    return { error: `Server exception: ${err?.message || 'Unknown error'}` }
  }
}

