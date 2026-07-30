'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
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

export async function deletePatient(patientId: string): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { error: 'No autorizado.' }

    const svc = serviceClient()

    // 1. Obtener archivos asociados en CaseMedia para eliminarlos del Storage
    const { data: mediaFiles } = await svc
      .from('CaseMedia')
      .select('bucket, fileUrl')
      .eq('patientId', patientId)

    if (mediaFiles && mediaFiles.length > 0) {
      for (const m of mediaFiles) {
        await svc.storage.from(m.bucket).remove([m.fileUrl])
      }
    }

    // 2. Eliminar relaciones dependientes
    await svc.from('ToothMoldChart').delete().eq('patientId', patientId)
    await svc.from('Cephalometry').delete().eq('patientId', patientId)
    await svc.from('CaseMedia').delete().eq('patientId', patientId)
    await svc.from('TimelineEvent').delete().eq('patientId', patientId)
    await svc.from('Diagnosis').delete().eq('patientId', patientId)
    await svc.from('Payment').delete().eq('patientId', patientId)
    await svc.from('Treatment').delete().eq('patientId', patientId)

    const { data: historyData } = await svc.from('ClinicalHistory').select('id').eq('patientId', patientId).single()
    if (historyData) {
      await svc.from('ClinicalHistoryVersion').delete().eq('clinicalHistoryId', historyData.id)
    }
    await svc.from('ClinicalHistory').delete().eq('patientId', patientId)
    await svc.from('Odontogram').delete().eq('patientId', patientId)
    await svc.from('Appointment').delete().eq('patientId', patientId)

    // 3. Eliminar paciente
    const { error } = await svc.from('Patient').delete().eq('id', patientId)

    if (error) {
      console.error('Error deleting patient:', error)
      return { error: `No se pudo eliminar el paciente: ${error.message}` }
    }

    await logAuditAction({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'Patient',
      entityId: patientId,
    }).catch(() => {})

    revalidatePath('/admin/pacientes')
    return { success: true }
  } catch (err: any) {
    console.error('Unhandled exception in deletePatient:', err)
    return { error: `Error de servidor: ${err?.message || 'Desconocido'}` }
  }
}

export async function deletePatients(patientIds: string[]): Promise<{ success: true; deletedCount: number } | { error: string }> {
  try {
    if (!patientIds || patientIds.length === 0) return { error: 'No se seleccionaron pacientes.' }

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { error: 'No autorizado.' }

    const svc = serviceClient()

    // 1. Obtener archivos multimedia de todos los pacientes a eliminar
    const { data: mediaFiles } = await svc
      .from('CaseMedia')
      .select('bucket, fileUrl')
      .in('patientId', patientIds)

    if (mediaFiles && mediaFiles.length > 0) {
      for (const m of mediaFiles) {
        await svc.storage.from(m.bucket).remove([m.fileUrl])
      }
    }

    // 2. Limpiar registros relacionados
    await svc.from('ToothMoldChart').delete().in('patientId', patientIds)
    await svc.from('Cephalometry').delete().in('patientId', patientIds)
    await svc.from('CaseMedia').delete().in('patientId', patientIds)
    await svc.from('Diagnosis').delete().in('patientId', patientIds)
    await svc.from('Payment').delete().in('patientId', patientIds)
    await svc.from('Treatment').delete().in('patientId', patientIds)
    
    const { data: histories } = await svc.from('ClinicalHistory').select('id').in('patientId', patientIds)
    if (histories && histories.length > 0) {
      const historyIds = histories.map(h => h.id)
      await svc.from('ClinicalHistoryVersion').delete().in('clinicalHistoryId', historyIds)
    }
    await svc.from('ClinicalHistory').delete().in('patientId', patientIds)
    await svc.from('Odontogram').delete().in('patientId', patientIds)
    await svc.from('Appointment').delete().in('patientId', patientIds)

    // 3. Eliminar los pacientes en lote
    const { error } = await svc.from('Patient').delete().in('id', patientIds)

    if (error) {
      console.error('Error in bulk deletePatients:', error)
      return { error: `No se pudieron eliminar los pacientes: ${error.message}` }
    }

    await logAuditAction({
      userId: session.user.id,
      action: 'BULK_DELETE',
      entity: 'Patient',
      entityId: patientIds.join(','),
      metadata: { count: patientIds.length },
    }).catch(() => {})

    revalidatePath('/admin/pacientes')
    return { success: true, deletedCount: patientIds.length }
  } catch (err: any) {
    console.error('Unhandled exception in deletePatients:', err)
    return { error: `Error de servidor: ${err?.message || 'Desconocido'}` }
  }
}

