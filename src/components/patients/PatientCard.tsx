import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Phone, Mail, ChevronRight } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'

export interface Patient {
  id: string
  firstName: string
  lastName: string
  dob: string
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  phone?: string | null
  email?: string | null
  avatarUrl?: string | null
  // Atributos derivados de relaciones
  mainTreatment?: string
  lastVisit?: string
  nextAppointment?: string
}

export function PatientCard({ patient }: { patient: Patient }) {
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
    <Link 
      href={`/admin/pacientes/${patient.id}`}
      className="block clinical-card group p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-teal-50 flex-shrink-0 flex items-center justify-center">
          {patient.avatarUrl ? (
            <Image 
              src={patient.avatarUrl} 
              alt={`${patient.firstName} ${patient.lastName}`}
              fill
              className="object-cover"
            />
          ) : (
            <span className="font-semibold text-lg text-teal-700">
              {patient.firstName[0]}{patient.lastName[0]}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-slate-900 truncate pr-2 text-base">
              {patient.firstName} {patient.lastName}
            </h3>
            <StatusBadge 
              status={getStatusColor(patient.status)} 
              text={patient.status === 'ACTIVE' ? 'Activo' : patient.status === 'INACTIVE' ? 'Inactivo' : 'Archivado'} 
              className="scale-90 origin-top-right"
            />
          </div>
          <p className="text-sm text-slate-500 mb-3">{age} años</p>

          {/* Highlight: Próxima Cita */}
          <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100 flex items-center gap-2 group-hover:bg-teal-50/50 transition-colors">
            <Calendar className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Próxima Cita</span>
              <span className="text-xs font-medium text-slate-900 truncate">{patient.nextAppointment || 'No agendada'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
            {patient.phone && (
              <div className="flex items-center text-xs text-slate-400">
                <Phone className="w-3.5 h-3.5 mr-1" />
                <span className="truncate">{patient.phone}</span>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 mr-1" />
                <span className="truncate" title={patient.email}>{patient.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
