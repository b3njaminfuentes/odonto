'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

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

    // Validación básica
    if (!firstName || !lastName || !dob) {
      return { error: 'Nombre, Apellido y Fecha de Nacimiento son obligatorios.' }
    }

    // Insertar en Supabase usando el cliente autenticado normal
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
    
    return { success: true, patient: data }
  } catch (err: any) {
    console.error('Unhandled exception in createPatient:', err)
    return { error: `Server exception: ${err?.message || 'Unknown error'}` }
  }
}

export async function getMorePatients(offset: number) {
  const supabase = createClient()
  
  const { data: rawPatients, error } = await supabase
    .from('Patient')
    .select(`
      id,
      firstName,
      lastName,
      dob,
      phone,
      email,
      status,
      profilePhotoId,
      Treatment (
        name,
        status,
        createdAt
      ),
      Appointment (
        startsAt,
        status
      )
    `)
    .order('createdAt', { ascending: false })
    .range(offset, offset + 19)

  if (error) {
    console.error('Error fetching more patients:', error)
    return []
  }

  const now = new Date()

  return (rawPatients || []).map((p: any) => {
    let mainTreatment = 'Consulta General'
    if (p.Treatment && p.Treatment.length > 0) {
      const activeTreatments = p.Treatment.filter((t: any) => t.status === 'ACTIVO')
      if (activeTreatments.length > 0) {
        activeTreatments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        mainTreatment = activeTreatments[0].name
      } else {
        p.Treatment.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        mainTreatment = p.Treatment[0].name
      }
    }

    let lastVisit = 'Sin visitas previas'
    let nextAppointment = 'No agendada'

    if (p.Appointment && p.Appointment.length > 0) {
      const pastAppointments = p.Appointment.filter((a: any) => new Date(a.startsAt) < now && a.status === 'CONFIRMADO')
      const futureAppointments = p.Appointment.filter((a: any) => new Date(a.startsAt) >= now && a.status !== 'CANCELADO')

      if (pastAppointments.length > 0) {
        pastAppointments.sort((a: any, b: any) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
        lastVisit = new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(new Date(pastAppointments[0].startsAt))
      }

      if (futureAppointments.length > 0) {
        futureAppointments.sort((a: any, b: any) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
        nextAppointment = new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(new Date(futureAppointments[0].startsAt))
      }
    }

    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      dob: p.dob,
      phone: p.phone,
      email: p.email,
      status: p.status,
      // profilePhotoId es un UUID (objeto en el bucket privado patients-profile),
      // no una URL. Hasta que exista el flujo de subida+signed URL, caemos a iniciales.
      avatarUrl: null,
      mainTreatment,
      lastVisit,
      nextAppointment
    }
  })
}
