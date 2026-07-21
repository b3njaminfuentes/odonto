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
      className="block bg-surface rounded-xl p-5 border border-gray-100 card-hover group transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-white shadow-sm">
          {patient.avatarUrl ? (
            <Image 
              src={patient.avatarUrl} 
              alt={`${patient.firstName} ${patient.lastName}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900 truncate pr-4 text-lg">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{age} años</p>
            </div>
            <StatusBadge 
              status={getStatusColor(patient.status)} 
              text={patient.status === 'ACTIVE' ? 'Activo' : patient.status === 'INACTIVE' ? 'Inactivo' : 'Archivado'} 
            />
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-2">
            <div className="flex items-center text-xs text-gray-600">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              <span className="truncate">{patient.phone || 'Sin teléfono'}</span>
            </div>
            {patient.email && (
              <div className="flex items-center text-xs text-gray-600">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                <span className="truncate">{patient.email}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Última Visita</span>
                <span className="text-xs font-medium text-gray-700">{patient.lastVisit || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Próxima</span>
                <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" />
                  {patient.nextAppointment || 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white text-gray-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
