'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

export async function getCephalometryHistory(patientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Cephalometry')
    .select('*')
    .eq('patientId', patientId)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching cephalometry:', error)
    return []
  }
  return data
}

export async function saveCephalometry(patientId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'No autorizado' }

  const num = (key: string) => {
    const raw = formData.get(key) as string
    if (!raw || raw.trim() === '') return null
    const n = parseFloat(raw)
    return isNaN(n) ? null : n
  }

  const values = {
    patientId,
    sna: num('sna'),
    snb: num('snb'),
    anb: num('anb'),
    planoMandibular: num('planoMandibular'),
    anguloInterincisal: num('anguloInterincisal'),
    u1SN: num('u1SN'),
    impa: num('impa'),
    convexidadFacial: num('convexidadFacial'),
    notes: (formData.get('notes') as string)?.trim() || null,
    createdBy: session.user.id,
  }

  const hasAnyValue = Object.entries(values).some(([k, v]) => !['patientId', 'notes', 'createdBy'].includes(k) && v !== null)
  if (!hasAnyValue) return { error: 'Cargá al menos una medida.' }

  const { data, error } = await supabase.from('Cephalometry').insert(values).select().single()

  if (error) {
    console.error('Error saving cephalometry:', error)
    return { error: 'No se pudo guardar el análisis cefalométrico' }
  }

  await logAuditAction({
    userId: session.user.id,
    action: 'CREATE',
    entity: 'Cephalometry',
    entityId: data.id,
    metadata: { patientId },
  }).catch(() => {})

  revalidatePath(`/admin/pacientes/${patientId}`)
  return { success: true }
}

export async function deleteCephalometry(id: string, patientId: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'No autorizado' }

  const { error } = await supabase.from('Cephalometry').delete().eq('id', id)
  if (error) return { error: 'No se pudo eliminar el registro' }

  revalidatePath(`/admin/pacientes/${patientId}`)
  return { success: true }
}
