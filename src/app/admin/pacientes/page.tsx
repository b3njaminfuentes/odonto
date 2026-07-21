import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { PatientLeaderboard } from '@/components/patients/PatientLeaderboard'
import { Patient } from '@/components/patients/PatientCard'

export const dynamic = 'force-dynamic'

export default async function PacientesPage() {
  const supabase = createClient()

  // Traer los pacientes de la tabla de Supabase, ordenados por los de creación más reciente
  const { data: rawPatients, error } = await supabase
    .from('Patient')
    .select(`
      id,
      firstName,
      lastName,
      dob,
      phone,
      email,
      status,
      avatarUrl
    `)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching patients:', error)
  }

  // Mapear los datos de Supabase a la interfaz Patient
  // Como aún no tenemos lógica pesada de "última cita", "tratamiento principal"
  // pondremos valores por defecto que se rellenarán con SQL avanzado o vistas luego.
  const initialPatients: Patient[] = (rawPatients || []).map((p: any) => ({
    ...p,
    // Por ahora simularemos estos datos para mantener la elegancia de la UI
    // En la Fase 4 y 5 estos vendrán del join real.
    mainTreatment: 'Consulta General', 
    lastVisit: 'Hace 2 semanas',
    nextAppointment: 'Próxima semana'
  }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-serif text-gray-900 tracking-tight">Pacientes</h1>
        <p className="text-gray-500">
          Gestiona tu lista de pacientes y accede a sus historiales clínicos.
        </p>
      </div>

      <PatientLeaderboard initialPatients={initialPatients} />
    </div>
  )
}
