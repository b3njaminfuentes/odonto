'use server'

import { createAdminClient, createClient } from '@/utils/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export async function createClinicOnboarding(formData: FormData) {
  const adminClient = createAdminClient()
  const userClient = createClient()

  const clinicName = (formData.get('clinicName') as string || '').trim()
  const doctorName = (formData.get('doctorName') as string || '').trim()
  const specialty = (formData.get('specialty') as string || '').trim()
  const phone = (formData.get('phone') as string || '').trim()
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const password = formData.get('password') as string || ''
  const plan = (formData.get('plan') as string || 'pro').toLowerCase()

  if (!clinicName || !doctorName || !email || !password) {
    return { error: 'Por favor complete todos los campos obligatorios.' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  try {
    // 1. Generar slug único
    let baseSlug = slugify(clinicName)
    if (!baseSlug) baseSlug = `clinica-${Date.now().toString().slice(-4)}`
    
    // Validar si el slug ya existe
    const { data: existingClinic } = await adminClient
      .from('Clinic')
      .select('id')
      .eq('slug', baseSlug)
      .maybeSingle()

    const finalSlug = existingClinic ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug

    // 2. Crear la Clínica
    const { data: newClinic, error: clinicErr } = await adminClient
      .from('Clinic')
      .insert({
        name: clinicName,
        slug: finalSlug,
        plan: plan
      })
      .select()
      .single()

    if (clinicErr || !newClinic) {
      console.error('Error creando clínica:', clinicErr)
      return { error: 'No se pudo registrar la clínica. Intente con otro nombre.' }
    }

    // 3. Crear ClinicSettings
    await adminClient.from('ClinicSettings').insert({
      clinicId: newClinic.id,
      phone: phone || null,
      doctorName: doctorName,
      specialty: specialty || 'Odontología General',
      currency: 'BOB',
      pendingAppointmentsAlert: true
    })

    // 4. Crear usuario en Supabase Auth
    const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName: doctorName.split(' ')[0] || doctorName,
        lastName: doctorName.split(' ').slice(1).join(' ') || '',
        clinicId: newClinic.id,
        role: 'admin'
      }
    })

    if (authErr || !authUser?.user) {
      console.error('Error creando usuario auth:', authErr)
      return { error: `Error al crear el usuario: ${authErr?.message || 'Email ya registrado'}` }
    }

    const userId = authUser.user.id

    // 5. Crear o actualizar Profile
    const names = doctorName.split(' ')
    const firstName = names[0] || 'Dr.'
    const lastName = names.slice(1).join(' ') || ''

    await adminClient.from('Profile').upsert({
      id: userId,
      email: email,
      firstName,
      lastName,
      specialty: specialty || 'Odontología General',
      phone: phone || null,
      role: 'admin',
      color: '#0F6E56'
    })

    // 6. Asignar UserClinicMap
    await adminClient.from('user_clinic_map').insert({
      userId: userId,
      clinicId: newClinic.id,
      role: 'owner'
    })

    // 7. Enviar Correo de Bienvenida
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : 'https://clinicos.app/login'
    await sendWelcomeEmail({
      doctorName,
      clinicName,
      email,
      tempPassword: password,
      planName: plan.toUpperCase(),
      trialDays: 7,
      loginUrl
    })

    // 8. Iniciar sesión automáticamente en el cliente
    const { error: signInErr } = await userClient.auth.signInWithPassword({
      email,
      password
    })

    if (signInErr) {
      console.warn('Sign-in automático con advertencia:', signInErr)
    }

    revalidatePath('/admin')
    return { success: true, clinicId: newClinic.id, slug: newClinic.slug }
  } catch (err: any) {
    console.error('Excepción en onboarding:', err)
    return { error: err.message || 'Ocurrió un error inesperado.' }
  }
}
