'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/utils/audit'

interface MoldMeasurementItem {
  arc: 'upper' | 'lower'
  moldLine: 'A' | 'B' | 'C' | 'D' | 'E'
  toothPosition: string // U1..U7 or L1..L7
  measurementMm: number | null
  biteAdjustment: string | null
  isHighlighted?: boolean
}

export async function getPatientMoldCharts(patientId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('ToothMoldChart')
    .select(`
      id,
      patientId,
      treatmentId,
      notes,
      createdAt,
      updatedAt,
      measurements:ToothMoldMeasurement(*)
    `)
    .eq('patientId', patientId)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching mold charts:', error)
    return []
  }

  return data || []
}

export async function saveMoldChart(payload: {
  patientId: string
  treatmentId?: string | null
  notes?: string | null
  measurements: MoldMeasurementItem[]
}): Promise<{ success: true; chartId: string } | { error: string }> {
  const userClient = createClient()
  const supabase = createAdminClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { patientId, treatmentId, notes, measurements } = payload
  if (!patientId) return { error: 'Paciente no especificado.' }

  // 1. Crear ficha principal
  const { data: chart, error: chartError } = await supabase
    .from('ToothMoldChart')
    .insert({
      patientId,
      treatmentId: treatmentId || null,
      notes: notes || null,
      createdBy: user.id,
    })
    .select()
    .single()

  if (chartError || !chart) {
    console.error('Error creating ToothMoldChart:', chartError)
    return { error: 'No se pudo crear la ficha de moldes.' }
  }

  // 2. Insertar las mediciones
  const rowsToInsert = measurements.map((m) => ({
    chartId: chart.id,
    arc: m.arc,
    moldLine: m.moldLine,
    toothPosition: m.toothPosition,
    measurementMm: m.measurementMm !== null && !isNaN(Number(m.measurementMm)) ? Number(m.measurementMm) : null,
    biteAdjustment: m.biteAdjustment || null,
    isHighlighted: !!m.isHighlighted,
  }))

  if (rowsToInsert.length > 0) {
    const { error: measError } = await supabase
      .from('ToothMoldMeasurement')
      .insert(rowsToInsert)

    if (measError) {
      console.error('Error inserting ToothMoldMeasurements:', measError)
      // Limpiar ficha creada en caso de fallo parcial
      await supabase.from('ToothMoldChart').delete().eq('id', chart.id)
      return { error: 'No se pudieron guardar las mediciones de la ficha.' }
    }
  }

  await logAuditAction({
    userId: user.id,
    action: 'CREATE_MOLD_CHART',
    entity: 'ToothMoldChart',
    entityId: chart.id,
    metadata: { patientId, count: measurements.length },
  }).catch(() => {})

  revalidatePath(`/admin/pacientes/${patientId}`)
  return { success: true, chartId: chart.id }
}

export async function deleteMoldChart(chartId: string, patientId: string) {
  const userClient = createClient()
  const supabase = createAdminClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('ToothMoldChart')
    .delete()
    .eq('id', chartId)

  if (error) {
    console.error('Error deleting ToothMoldChart:', error)
    return { error: 'No se pudo eliminar la ficha.' }
  }

  await logAuditAction({
    userId: user.id,
    action: 'DELETE_MOLD_CHART',
    entity: 'ToothMoldChart',
    entityId: chartId,
    metadata: { patientId },
  }).catch(() => {})

  revalidatePath(`/admin/pacientes/${patientId}`)
  return { success: true }
}
