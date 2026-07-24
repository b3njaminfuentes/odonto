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

/**
 * Sube un archivo (foto/PDF) al Storage y crea el registro CaseMedia.
 * Corre server-side con service-role para evitar la fragilidad de RLS de Storage;
 * la seguridad se garantiza verificando que quien llama sea admin.
 */
export async function uploadPatientMedia(formData: FormData): Promise<{ success: true } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }
  const { data: caller } = await supabase.from('Profile').select('role').eq('id', user.id).single()
  if (caller?.role !== 'admin') return { error: 'Solo la administradora puede subir archivos.' }

  const file = formData.get('file') as File | null
  const patientId = formData.get('patientId') as string
  const description = ((formData.get('description') as string) || '').trim()
  const visibleToPatient = formData.get('visibleToPatient') === 'true'
  if (!file || !patientId) return { error: 'Archivo o paciente faltante.' }
  if (file.size > 20 * 1024 * 1024) return { error: 'El archivo supera los 20 MB.' }

  const isPdf = file.type.includes('pdf')
  const bucket = isPdf ? 'documents' : 'cases-images'
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const path = `${patientId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const svc = serviceClient()
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: upErr } = await svc.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })
  if (upErr) return { error: `No se pudo subir el archivo: ${upErr.message}` }

  const { data, error } = await svc.from('CaseMedia').insert({
    patientId,
    bucket,
    fileUrl: path,
    category: isPdf ? 'document' : 'image',
    description: description || file.name,
    mimeType: file.type,
    size: file.size,
    visibleToPatient,
    uploadedBy: user.id,
  }).select().single()
  if (error) {
    await svc.storage.from(bucket).remove([path]).catch(() => {})
    return { error: `No se pudo guardar el registro: ${error.message}` }
  }

  await logAuditAction({ userId: user.id, action: 'UPLOAD_MEDIA', entity: 'CaseMedia', entityId: data.id, metadata: { patientId } }).catch(() => {})
  revalidatePath(`/admin/pacientes/${patientId}`)
  return { success: true }
}

export async function getPatientMedia(patientId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('CaseMedia')
    .select('*')
    .eq('patientId', patientId)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching media:', error)
    return []
  }

  // Firmamos con service-role para no depender de la RLS de Storage (privado).
  const svc = serviceClient()
  const mediaWithUrls = await Promise.all(data.map(async (media) => {
    const { data: urlData } = await svc
      .storage
      .from(media.bucket)
      .createSignedUrl(media.fileUrl, 3600) // 1 hora
    return { ...media, signedUrl: urlData?.signedUrl || '' }
  }))

  return mediaWithUrls
}

export async function saveMediaRecord({
  patientId,
  bucket,
  fileUrl,
  category,
  title,
  mimeType,
  size
}: {
  patientId: string
  bucket: string
  fileUrl: string
  category: string
  title: string
  mimeType: string
  size: number
  visibleToPatient?: boolean
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'No autorizado' }
  }

  const { data, error } = await supabase
    .from('CaseMedia')
    .insert({
      patientId,
      bucket,
      fileUrl,
      category,
      description: title,
      mimeType,
      size,
      visibleToPatient: visibleToPatient || false,
      uploadedBy: session.user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving media record:', error)
    return { error: 'No se pudo guardar el registro' }
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'UPLOAD_MEDIA',
    entity: 'CaseMedia',
    entityId: data.id,
    metadata: { patientId, fileUrl }
  })

  revalidatePath(`/admin/pacientes/${patientId}`)

  return { success: true, media: data }
}

export async function deleteMediaRecord(mediaId: string, bucket: string, fileUrl: string, patientId: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'No autorizado' }
  }

  // Delete from storage
  const { error: storageError } = await supabase
    .storage
    .from(bucket)
    .remove([fileUrl])

  if (storageError) {
    console.error('Error deleting from storage:', storageError)
    // Continue anyway to clean up DB
  }

  // Delete from DB
  const { error: dbError } = await supabase
    .from('CaseMedia')
    .delete()
    .eq('id', mediaId)

  if (dbError) {
    console.error('Error deleting media record:', dbError)
    return { error: 'No se pudo eliminar el registro' }
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'DELETE_MEDIA',
    entity: 'CaseMedia',
    entityId: mediaId,
    metadata: { patientId, fileUrl }
  })

  revalidatePath(`/admin/pacientes/${patientId}`)

  return { success: true }
}

export async function updateMediaRecord(mediaId: string, updates: { description?: string, visibleToPatient?: boolean }, patientId: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('CaseMedia')
    .update(updates)
    .eq('id', mediaId)

  if (error) {
    console.error('Error updating media:', error)
    return { error: 'No se pudo actualizar' }
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'CaseMedia',
    entityId: mediaId,
    metadata: { patientId, updates }
  })

  revalidatePath(`/admin/pacientes/${patientId}`)
  return { success: true }
}
