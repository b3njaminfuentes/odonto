'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminJsClient } from '@supabase/supabase-js'

function adminAuth() {
  return createAdminJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Login único, sin distinguir "doctora" o "paciente" en la pantalla.
 * 1. Primero intenta como cuenta de la clínica (email + contraseña real de Supabase Auth).
 * 2. Si no coincide, intenta como paciente: busca por código de acceso y valida
 *    que el email coincida con el registrado (o lo captura si el paciente aún no tenía uno).
 */
export async function unifiedLogin(
  email: string,
  code: string
): Promise<{ success: true } | { error: string }> {
  const cleanEmail = email?.trim().toLowerCase()
  const cleanCode = code?.trim()
  if (!cleanEmail || !cleanEmail.includes('@')) return { error: 'Ingresá tu email.' }
  if (!cleanCode) return { error: 'Ingresá tu código de acceso.' }

  const supabase = createClient()

  // 1. Intento como cuenta de la clínica (email real + contraseña real).
  const { error: adminSignInError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanCode,
  })
  if (!adminSignInError) return { success: true }

  // No fue la clínica: intentamos como paciente por código de acceso.
  const admin = adminAuth()
  const { data: patient } = await admin
    .from('Patient')
    .select('id, profileId, email')
    .eq('accessCode', cleanCode.toUpperCase())
    .maybeSingle()

  if (!patient || !patient.profileId) {
    return { error: 'Email o código incorrectos.' }
  }

  // Si el paciente ya tenía email registrado, debe coincidir (evita que alguien
  // que solo sabe el código entre con cualquier email). Si aún no tenía, lo capturamos ahora.
  if (patient.email) {
    if (patient.email.toLowerCase() !== cleanEmail) {
      return { error: 'Email o código incorrectos.' }
    }
  } else {
    await admin.from('Patient').update({ email: cleanEmail }).eq('id', patient.id)
  }

  const { data: profile } = await admin.from('Profile').select('email').eq('id', patient.profileId).single()
  if (!profile?.email) return { error: 'Tu acceso no está configurado correctamente. Contactá a la clínica.' }

  const { error: patientSignInError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: cleanCode,
  })
  if (patientSignInError) return { error: 'Email o código incorrectos.' }

  return { success: true }
}
