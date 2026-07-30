'use server'

import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAuthProfile } from '@/utils/supabase/server'

export async function createTeamMember(formData: FormData) {
  const { profile } = await getAuthProfile()
  if (profile?.role !== 'admin') {
    throw new Error('Solo los administradores pueden invitar al equipo')
  }

  const supabaseAdmin = createAdminClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const specialty = formData.get('specialty') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  // 1. Create Auth User using Admin API (Bypasses email confirmation)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    console.error('Error creating auth user:', authError)
    throw new Error(authError?.message || 'Error al crear la cuenta de usuario')
  }

  // 2. Insert Profile
  const { error: profileError } = await supabaseAdmin
    .from('Profile')
    .insert({
      id: authData.user.id,
      email,
      role,
      firstName,
      lastName,
      specialty,
      phone,
      isActive: true,
    })

  if (profileError) {
    console.error('Error creating profile:', profileError)
    // Rollback auth user
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    throw new Error('Error al guardar el perfil del doctor')
  }

  revalidatePath('/admin/equipo')
}
