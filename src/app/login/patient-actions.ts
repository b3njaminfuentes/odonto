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
 * Login de paciente con SOLO el código que le dio la doctora. El email es
 * opcional: si lo escribe, se guarda como dato de contacto (para el futuro),
 * pero no se usa para autenticar — el código es la única credencial.
 */
export async function patientLoginWithCode(
  rawCode: string,
  email?: string
): Promise<{ success: true } | { error: string }> {
  const code = rawCode?.trim().toUpperCase()
  if (!code) return { error: 'Ingresá tu código de acceso.' }

  const admin = adminAuth()

  const { data: patient, error: findErr } = await admin
    .from('Patient')
    .select('id, profileId, email')
    .eq('accessCode', code)
    .single()

  if (findErr || !patient || !patient.profileId) {
    return { error: 'Código inválido. Verificá con la clínica.' }
  }

  const { data: profile } = await admin
    .from('Profile')
    .select('email')
    .eq('id', patient.profileId)
    .single()

  if (!profile?.email) return { error: 'Tu acceso no está configurado correctamente. Contactá a la clínica.' }

  // Capturamos el email si lo escribió y aún no lo teníamos guardado.
  const cleanEmail = email?.trim().toLowerCase()
  if (cleanEmail && cleanEmail.includes('@') && !patient.email) {
    await admin.from('Patient').update({ email: cleanEmail }).eq('id', patient.id)
  }

  // Iniciar sesión real (cookie-aware) con el email interno + el código como contraseña.
  const supabase = createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: code,
  })

  if (signInError) return { error: 'Código inválido. Verificá con la clínica.' }
  return { success: true }
}
