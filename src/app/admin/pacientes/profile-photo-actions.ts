'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

const BUCKET = 'patients-profile'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' } as const
  const { data: caller } = await supabase.from('Profile').select('role').eq('id', user.id).single()
  if (caller?.role !== 'admin') return { error: 'Solo la administradora puede hacer esto.' } as const
  return { userId: user.id } as const
}

export async function getProfilePhotoUrl(profilePhotoId: string | null): Promise<string | null> {
  if (!profilePhotoId) return null
  const svc = serviceClient()
  const { data } = await svc.storage.from(BUCKET).createSignedUrl(profilePhotoId, 3600)
  return data?.signedUrl || null
}

export async function uploadProfilePhoto(patientId: string, formData: FormData): Promise<{ success: true } | { error: string }> {
  const auth = await requireAdmin()
  if ('error' in auth) return auth

  const file = formData.get('file') as File | null
  if (!file) return { error: 'Ningún archivo recibido.' }
  if (!file.type.startsWith('image/')) return { error: 'La foto de perfil debe ser una imagen.' }
  if (file.size > 20 * 1024 * 1024) return { error: 'La imagen supera los 20 MB.' }

  const svc = serviceClient()

  const { data: patient } = await svc.from('Patient').select('profilePhotoId').eq('id', patientId).single()
  const previousPath = patient?.profilePhotoId

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${patientId}/avatar-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: upErr } = await svc.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })
  if (upErr) return { error: `No se pudo subir la foto: ${upErr.message}` }

  const { error: dbErr } = await svc.from('Patient').update({ profilePhotoId: path, updatedAt: new Date().toISOString() }).eq('id', patientId)
  if (dbErr) {
    await svc.storage.from(BUCKET).remove([path]).catch(() => {})
    return { error: `No se pudo guardar la foto: ${dbErr.message}` }
  }

  if (previousPath) {
    await svc.storage.from(BUCKET).remove([previousPath]).catch(() => {})
  }

  await logAuditAction({ userId: auth.userId, action: 'UPDATE', entity: 'Patient', entityId: patientId, metadata: { profilePhoto: true } }).catch(() => {})

  revalidatePath(`/admin/pacientes/${patientId}`)
  revalidatePath('/admin/pacientes')
  return { success: true }
}

export async function removeProfilePhoto(patientId: string): Promise<{ success: true } | { error: string }> {
  const auth = await requireAdmin()
  if ('error' in auth) return auth

  const svc = serviceClient()
  const { data: patient } = await svc.from('Patient').select('profilePhotoId').eq('id', patientId).single()
  if (patient?.profilePhotoId) {
    await svc.storage.from(BUCKET).remove([patient.profilePhotoId]).catch(() => {})
  }

  const { error } = await svc.from('Patient').update({ profilePhotoId: null, updatedAt: new Date().toISOString() }).eq('id', patientId)
  if (error) return { error: `No se pudo quitar la foto: ${error.message}` }

  revalidatePath(`/admin/pacientes/${patientId}`)
  revalidatePath('/admin/pacientes')
  return { success: true }
}
