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
      className="block neo-card group bg-white"
    >
      <div className="flex items-start gap-4 p-5">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neoYellow flex-shrink-0 border-2 border-black shadow-neo-sm group-hover:-translate-y-1 transition-transform">
          {patient.avatarUrl ? (
            <Image 
              src={patient.avatarUrl} 
              alt={`${patient.firstName} ${patient.lastName}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-black text-2xl text-black">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black text-black truncate pr-4 text-xl uppercase tracking-tight">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-black font-bold mb-2">{age} años</p>
            </div>
            <StatusBadge 
              status={getStatusColor(patient.status)} 
              text={patient.status === 'ACTIVE' ? 'Activo' : patient.status === 'INACTIVE' ? 'Inactivo' : 'Archivado'} 
            />
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-2">
            <div className="flex items-center text-xs text-black font-bold">
              <Phone className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
              <span className="truncate">{patient.phone || 'Sin teléfono'}</span>
            </div>
            {patient.email && (
              <div className="flex items-center text-xs text-black font-bold">
                <Mail className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                <span className="truncate">{patient.email}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t-3 border-black border-dashed flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-black/60 tracking-wider">Última Visita</span>
                <span className="text-xs font-bold text-black">{patient.lastVisit || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-black/60 tracking-wider">Próxima</span>
                <span className="text-xs font-bold text-black flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-black" strokeWidth={2.5} />
                  {patient.nextAppointment || 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-neoPink border-2 border-black flex items-center justify-center group-hover:bg-neoYellow text-black shadow-neo-sm transition-colors">
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
