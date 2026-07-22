'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

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

  // Generate public URLs for images
  // For radiographs bucket which is private, we'd need signed URLs or download logic.
  // We'll generate signed URLs for 1 hour.
  const mediaWithUrls = await Promise.all(data.map(async (media) => {
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from(media.bucket)
      .createSignedUrl(media.fileUrl, 3600) // 1 hour

    return {
      ...media,
      signedUrl: urlData?.signedUrl || ''
    }
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
