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

// Código de acceso legible (sin caracteres ambiguos: sin 0/O, 1/I/l).
function generateAccessCode(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

/**
 * Genera (o regenera) el acceso al portal para un paciente. SOLO la doctora/admin.
 * El paciente entra al portal SOLO con este código (no necesita usuario ni email).
 * Por dentro usamos Supabase Auth con un email sintético + el código como contraseña,
 * pero el único dato que la doctora entrega al paciente es el código.
 */
export async function generatePatientAccess(patientId: string): Promise<
  | { error: string }
  | { success: true; code: string; regenerated: boolean }
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
    .select('id, firstName, lastName, patientCode, profileId')
    .eq('id', patientId)
    .single()
  if (pErr || !patient) return { error: 'Paciente no encontrado.' }

  // 3. Email interno (sintético, nunca visto por el paciente) + código de acceso nuevo.
  const email = `${patient.patientCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@pacientes.clinicavillarroel.com`
  const code = generateAccessCode()
  const regenerated = !!patient.profileId

  const findUserByEmail = async (mail: string): Promise<string | null> => {
    for (let page = 1; page <= 20; page++) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 })
      const u = data?.users?.find((x: any) => (x.email || '').toLowerCase() === mail)
      if (u) return u.id
      if (!data || data.users.length < 200) break
    }
    return null
  }

  try {
    let uid: string
    if (patient.profileId) {
      // Ya tiene acceso: solo reseteamos el código.
      const { error } = await admin.auth.admin.updateUserById(patient.profileId, { password: code })
      if (error) return { error: `No se pudo restablecer el código: ${error.message}` }
      uid = patient.profileId
    } else {
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email,
        password: code,
        email_confirm: true,
        user_metadata: { role: 'patient', patientCode: patient.patientCode },
      })
      if (cErr || !created?.user) {
        const existingId = await findUserByEmail(email)
        if (!existingId) return { error: `No se pudo crear el acceso: ${cErr?.message || 'desconocido'}` }
        await admin.auth.admin.updateUserById(existingId, { password: code })
        uid = existingId
      } else {
        uid = created.user.id
      }

      const { error: prErr } = await admin
        .from('Profile')
        .upsert({ id: uid, role: 'patient', email }, { onConflict: 'id' })
      if (prErr) return { error: `No se pudo crear el perfil: ${prErr.message}` }

      const { error: linkErr } = await admin
        .from('Patient')
        .update({ profileId: uid })
        .eq('id', patientId)
      if (linkErr) return { error: `No se pudo enlazar la ficha: ${linkErr.message}` }
    }

    // Guardamos el código en la ficha para poder ubicar al paciente por él al iniciar sesión.
    const { error: codeErr } = await admin.from('Patient').update({ accessCode: code }).eq('id', patientId)
    if (codeErr) return { error: `No se pudo guardar el código: ${codeErr.message}` }

    await logAuditAction({
      userId: user.id,
      action: regenerated ? 'REGEN_ACCESS' : 'CREATE_ACCESS',
      entity: 'Patient',
      entityId: patientId,
      metadata: {},
    }).catch(() => {})

    revalidatePath(`/admin/pacientes/${patientId}`)
    return { success: true, code, regenerated }
  } catch (e: any) {
    return { error: `Error inesperado: ${e?.message || 'desconocido'}` }
  }
}
