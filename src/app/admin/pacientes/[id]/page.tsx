import React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PatientTabs } from '@/components/patients/PatientTabs'
import { PatientAccessButton } from '@/components/patients/PatientAccessButton'
import { EditPatientModal } from '@/components/patients/EditPatientModal'
import { ProfilePhoto } from '@/components/patients/ProfilePhoto'
import { getAccountStatement } from '@/app/admin/pacientes/payment-actions'
import { getProfilePhotoUrl } from '@/app/admin/pacientes/profile-photo-actions'

export const dynamic = 'force-dynamic'

export default async function PatientProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Buscar el paciente con todo lo necesario para el resumen completo (línea de tiempo)
  const { data: patient, error } = await supabase
    .from('Patient')
    .select(`
      *,
      appointments:Appointment(id, startsAt, endsAt, treatmentType, status),
      history:ClinicalHistory(medicalHistory, updatedAt),
      treatments:Treatment(id, name, status, startDate, budget, finalCost),
      payments:Payment(id, amount, status, date, method),
      media:CaseMedia(id, description, category, createdAt, visibleToPatient)
    `)
    .eq('id', params.id)
    .single()

  if (error || !patient) {
    console.error('Error fetching patient profile:', error)
    return notFound()
  }

  const [statement, photoUrl] = await Promise.all([
    getAccountStatement(params.id),
    getProfilePhotoUrl(patient.profilePhotoId),
  ])

  // Edad real a partir de la fecha de nacimiento (defensivo ante fechas inválidas o futuras)
  const calculateAge = (dob: string): number | null => {
    const b = new Date(dob)
    if (isNaN(b.getTime())) return null
    const now = new Date()
    let age = now.getFullYear() - b.getFullYear()
    const m = now.getMonth() - b.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
    return age >= 0 && age <= 130 ? age : null
  }
  const age = calculateAge(patient.dob)

  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return 'success'
    if (status === 'INACTIVE') return 'warning'
    return 'default'
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/pacientes"
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a pacientes
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/admin/pacientes/${patient.id}/cotizacion`}
            className="px-4 py-2 bg-surface border border-border text-muted font-medium rounded-xl hover:border-brand hover:text-brand transition-colors flex items-center gap-2 shadow-sm text-sm"
          >
            <FileText className="w-4 h-4" />
            Cotización
          </Link>
          <EditPatientModal patient={patient} />
          <PatientAccessButton patientId={patient.id} hasAccess={!!patient.profileId} />
        </div>
      </div>

      {/* Header Profile Card (Sticky) */}
      <div className="sticky top-0 z-20 bg-surface rounded-2xl p-6 shadow-sm border border-border flex flex-col md:flex-row gap-6 md:items-center">
        <ProfilePhoto patientId={patient.id} initials={`${patient.firstName[0]}${patient.lastName[0]}`} photoUrl={photoUrl} />
        
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-text font-serif">
              {patient.firstName} {patient.lastName}
            </h1>
            <StatusBadge 
              status={getStatusColor(patient.status)} 
              text={patient.status === 'ACTIVE' ? 'Activo' : patient.status === 'INACTIVE' ? 'Inactivo' : patient.status === 'ARCHIVED' ? 'Archivado' : patient.status} 
            />
            <span className="text-xs font-mono bg-elevated text-muted px-2 py-1 rounded-md">
              {patient.patientCode}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-muted">
            <p><strong className="text-text font-medium">Edad:</strong> {age !== null ? `${age} años` : '—'}</p>
            <p><strong className="text-text font-medium">DNI:</strong> {patient.dni || 'N/A'}</p>
            <p><strong className="text-text font-medium">Email:</strong> {patient.email || 'N/A'}</p>
            <p><strong className="text-text font-medium">Tel:</strong> {patient.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <PatientTabs 
        patientId={patient.id} 
        summaryData={{
          appointments: patient.appointments || [],
          history: patient.history,
          treatments: patient.treatments || [],
          payments: patient.payments || [],
          media: patient.media || [],
          treatmentsCount: (patient.treatments || []).filter((t: any) => t.status === 'ACTIVO').length,
          mediaCount: (patient.media || []).length,
          statement,
        }}
      />
    </div>
  )
}
