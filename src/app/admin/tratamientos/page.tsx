import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { TreatmentsTable } from '@/components/patients/TreatmentsTable'

export const dynamic = 'force-dynamic'

export default async function TratamientosGlobalPage() {
  const supabase = createClient()

  const { data: treatments } = await supabase
    .from('Treatment')
    .select(`
      id,
      name,
      description,
      status,
      startDate,
      budget,
      patientId,
      Patient:patientId (
        firstName,
        lastName,
        patientCode
      )
    `)
    .order('startDate', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-3xl font-serif text-text tracking-tight">Tratamientos</h1>
        <p className="text-muted">
          Vista global de todos los tratamientos activos e históricos de la clínica.
        </p>
      </div>

      <TreatmentsTable treatments={(treatments as any) || []} />
    </div>
  )
}
