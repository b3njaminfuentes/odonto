import React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Edit, CalendarPlus } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PatientTabs } from '@/components/patients/PatientTabs'

export const dynamic = 'force-dynamic'

export default async function PatientProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Buscar el paciente
  const { data: patient, error } = await supabase
    .from('Patient')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !patient) {
    return notFound()
  }

  // Calculamos la edad a partir de la fecha de nacimiento
  const calculateAge = (dob: string) => {
    const diff = Date.now() - new Date(dob).getTime()
    return Math.abs(new Date(diff).getUTCFullYear() - 1970)
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
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a pacientes
        </Link>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm text-sm">
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button className="px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm text-sm">
            <CalendarPlus className="w-4 h-4" />
            Agendar
          </button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 md:items-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold border-4 border-white shadow-sm flex-shrink-0">
          {patient.firstName[0]}{patient.lastName[0]}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">
              {patient.firstName} {patient.lastName}
            </h1>
            <StatusBadge 
              status={getStatusColor(patient.status)} 
              text={patient.status === 'ACTIVE' ? 'Activo' : patient.status === 'INACTIVE' ? 'Inactivo' : 'Archivado'} 
            />
            <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
              {patient.patientCode}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
            <p><strong className="text-gray-900 font-medium">Edad:</strong> {age} años</p>
            <p><strong className="text-gray-900 font-medium">DNI:</strong> {patient.dni || 'N/A'}</p>
            <p><strong className="text-gray-900 font-medium">Email:</strong> {patient.email || 'N/A'}</p>
            <p><strong className="text-gray-900 font-medium">Tel:</strong> {patient.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <PatientTabs patientId={patient.id} />
    </div>
  )
}
