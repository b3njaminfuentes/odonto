'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminJsClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

// Cliente admin (service role) con la API de administración de Auth disponible.
function adminAuth() {
  return createAdminJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Contraseña temporal legible (sin caracteres ambiguos).
function generateTempPassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

/**
 * Genera (o regenera) el acceso al portal para un paciente. SOLO la doctora/admin.
 * Crea el usuario de Auth, su Profile (role=patient) y lo enlaza a la ficha.
 * Devuelve las credenciales UNA vez para que la doctora se las pase al paciente.
 */
export async function generatePatientAccess(patientId: string): Promise<
  | { error: string }
  | { success: true; email: string; password: string; regenerated: boolean }
> {
  // 1. Autorización: quien llama debe ser admin.
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }
  const { data: caller } = await supabase.from('Profile').select('role').eq('id', user.id).single()
  if (caller?.role !== 'admin') return { error: 'Solo la administradora puede generar accesos.' }

  const admin = adminAuth()

  // 2. Cargar la ficha del paciente.
  const { data: patient, error: pErr } = await admin
    .from('Patient')
    .select('id, firstName, lastName, email, patientCode, profileId')
    .eq('id', patientId)
    .single()
  if (pErr || !patient) return { error: 'Paciente no encontrado.' }

  // 3. Email de acceso: el del paciente, o uno sintético estable por código.
  const email = (patient.email && patient.email.trim())
    ? patient.email.trim().toLowerCase()
    : `${patient.patientCode.toLowerCase()}@pacientes.clinicavillarroel.com`
  const password = generateTempPassword()
  const regenerated = !!patient.profileId

  try {
    if (patient.profileId) {
      // Ya tiene acceso: solo reseteamos la contraseña.
      const { error } = await admin.auth.admin.updateUserById(patient.profileId, { password })
      if (error) return { error: `No se pudo restablecer la contraseña: ${error.message}` }
    } else {
      // Crear usuario de Auth (email ya confirmado, sin verificación).
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'patient', patientCode: patient.patientCode },
      })
      if (cErr || !created.user) {
        // Si el email ya existe, intentamos enlazar ese usuario.
        return { error: `No se pudo crear el acceso: ${cErr?.message || 'desconocido'}` }
      }
      const uid = created.user.id

      // Profile con role=patient (idempotente).
      const { error: prErr } = await admin
        .from('Profile')
        .upsert({ id: uid, role: 'patient', email }, { onConflict: 'id' })
      if (prErr) return { error: `No se pudo crear el perfil: ${prErr.message}` }

      // Enlazar la ficha al perfil.
      const { error: linkErr } = await admin
        .from('Patient')
        .update({ profileId: uid })
        .eq('id', patientId)
      if (linkErr) return { error: `No se pudo enlazar la ficha: ${linkErr.message}` }
    }

    await logAuditAction({
      userId: user.id,
      action: regenerated ? 'REGEN_ACCESS' : 'CREATE_ACCESS',
      entity: 'Patient',
      entityId: patientId,
      metadata: { email },
    }).catch(() => {})

    revalidatePath(`/admin/pacientes/${patientId}`)
    return { success: true, email, password, regenerated }
  } catch (e: any) {
    return { error: `Error inesperado: ${e?.message || 'desconocido'}` }
  }
}
