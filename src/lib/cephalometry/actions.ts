'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentClinicId } from '@/lib/tenant'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function uploadCephImage(formData: FormData): Promise<{ success: true; url: string; width: number; height: number } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const file = formData.get('file') as File | null
  const patientId = formData.get('patientId') as string
  const widthStr = formData.get('width') as string
  const heightStr = formData.get('height') as string

  if (!file || !patientId) return { error: 'Archivo o paciente faltante.' }

  const width = parseInt(widthStr, 10) || 0
  const height = parseInt(heightStr, 10) || 0

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `cephalometry/${patientId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const svc = serviceClient()
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: upErr } = await svc.storage.from('cases-images').upload(path, buffer, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  })

  if (upErr) {
    return { error: `No se pudo subir la imagen: ${upErr.message}` }
  }

  const { data: urlData } = await svc.storage.from('cases-images').createSignedUrl(path, 60 * 60 * 24 * 365 * 5)

  if (!urlData?.signedUrl) {
    return { error: 'No se pudo generar la URL de la imagen.' }
  }

  return { success: true, url: urlData.signedUrl, width, height }
}

export async function getCasesByPatient(patientId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const cases = await prisma.cephalometricCase.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: {
      doctor: { select: { firstName: true, lastName: true } }
    }
  })
  
  return cases
}

export async function getCaseById(caseId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const cephCase = await prisma.cephalometricCase.findUnique({
    where: { id: caseId },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      doctor: { select: { firstName: true, lastName: true } }
    }
  })

  return cephCase
}

export async function saveCephalometricCase(payload: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { id, patientId, doctorId, imageUrl, imageWidth, imageHeight, pixelsPerMm, landmarks, analysisResults, primaryAnalysis, status, notes } = payload
  
  if (id && id !== 'new') {
    // Es una actualizacion
    const existing = await prisma.cephalometricCase.findUnique({ where: { id } })
    if (existing?.status === 'completed') {
      throw new Error('No se puede modificar un caso que ya ha sido firmado y cerrado.')
    }

    const updated = await prisma.cephalometricCase.update({
      where: { id },
      data: {
        pixelsPerMm,
        landmarks,
        analysisResults,
        primaryAnalysis,
        status,
        notes
      }
    })

    await prisma.cephalometricCaseEvent.create({
      data: {
        caseId: updated.id,
        action: 'landmarks_updated',
        doctorId: user.id
      }
    })

    revalidatePath(`/admin/pacientes/${updated.patientId}`)
    return updated
  } else {
    // Es una creacion
    const clinicId = await getCurrentClinicId()
    const created = await prisma.cephalometricCase.create({
      data: {
        clinicId,
        patientId,
        doctorId: doctorId || user.id,
        imageUrl,
        imageWidth,
        imageHeight,
        pixelsPerMm,
        landmarks: landmarks || {},
        analysisResults: analysisResults || null,
        primaryAnalysis: primaryAnalysis || 'steiner',
        status: status || 'draft',
        notes
      }
    })

    await prisma.cephalometricCaseEvent.create({
      data: {
        caseId: created.id,
        action: 'created',
        doctorId: user.id
      }
    })

    revalidatePath(`/admin/pacientes/${created.patientId}`)
    return created
  }
}

export async function signAndCompleteCase(caseId: string, signatureUrl: string, contentHash: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const updated = await prisma.cephalometricCase.update({
    where: { id: caseId },
    data: {
      status: 'completed',
      doctorSignatureUrl: signatureUrl,
      reportContentHash: contentHash,
      signedAt: new Date()
    }
  })

  await prisma.cephalometricCaseEvent.create({
    data: {
      caseId: updated.id,
      action: 'completed',
      doctorId: user.id
    }
  })

  revalidatePath(`/admin/pacientes/${updated.patientId}`)
  return updated
}

export async function duplicateCase(caseId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const original = await prisma.cephalometricCase.findUnique({ where: { id: caseId } })
  if (!original) throw new Error('Caso no encontrado')

  const duplicated = await prisma.cephalometricCase.create({
    data: {
      patientId: original.patientId,
      doctorId: user.id,
      imageUrl: original.imageUrl,
      imageWidth: original.imageWidth,
      imageHeight: original.imageHeight,
      pixelsPerMm: original.pixelsPerMm,
      landmarks: original.landmarks as any,
      analysisResults: original.analysisResults as any,
      primaryAnalysis: original.primaryAnalysis,
      status: 'draft',
      notes: original.notes,
      duplicatedFromId: original.id
    }
  })

  await prisma.cephalometricCaseEvent.create({
    data: {
      caseId: duplicated.id,
      action: 'duplicated',
      doctorId: user.id
    }
  })

  revalidatePath(`/admin/pacientes/${original.patientId}`)
  return duplicated
}
