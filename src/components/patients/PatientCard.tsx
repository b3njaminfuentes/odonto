'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Phone, Mail, Trash2 } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'

export interface Patient {
  id: string
  firstName: string
  lastName: string
  dob: string
  status: 'ACTIVE' | 'INACTIVE'
  phone?: string | null
  email?: string | null
  avatarUrl?: string | null
  mainTreatment?: string
  lastVisit?: string
  nextAppointment?: string
}

interface PatientCardProps {
  patient: Patient
  selectionMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
  onSingleDelete?: (patient: Patient) => void
}

export function PatientCard({
  patient,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onSingleDelete,
}: PatientCardProps) {
  const calculateAge = (dob: string | null): number | null => {
    if (!dob) return null
    const b = new Date(dob)
    if (isNaN(b.getTime())) return null
    const now = new Date()
    let a = now.getFullYear() - b.getFullYear()
    const m = now.getMonth() - b.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--
    return a >= 0 && a <= 130 ? a : null
  }

  const age = calculateAge(patient.dob)

  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return 'success'
    if (status === 'INACTIVE') return 'warning'
    return 'default'
  }

  return (
    <div
      className={`relative card group p-5 bg-surface border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 ${
        isSelected ? 'border-brand ring-2 ring-brand/30 bg-brand-soft/20' : 'border-border'
      }`}
    >
      {/* Checkbox de Selección o Botón de Borrado en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {selectionMode ? (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect && onToggleSelect(patient.id)}
            className="w-5 h-5 text-brand bg-surface border-border rounded focus:ring-brand cursor-pointer"
          />
        ) : (
          onSingleDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onSingleDelete(patient)
              }}
              className="p-1.5 text-muted hover:text-danger hover:bg-danger-soft rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Eliminar paciente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      <Link href={`/admin/pacientes/${patient.id}`} className="block">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-brand-soft flex-shrink-0 flex items-center justify-center">
            {patient.avatarUrl ? (
              <Image
                src={patient.avatarUrl}
                alt={`${patient.firstName} ${patient.lastName}`}
                fill
                className="object-cover"
              />
            ) : (
              <span className="font-semibold text-lg text-brand">
                {patient.firstName[0]}{patient.lastName[0]}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold text-text truncate pr-2 text-base group-hover:text-brand transition-colors">
                {patient.firstName} {patient.lastName}
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge
                status={getStatusColor(patient.status)}
                text={patient.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                className="scale-90 origin-left"
              />
              <span className="text-xs text-muted">{age !== null ? `${age} años` : 'Edad —'}</span>
            </div>

            {/* Highlight: Próxima Cita */}
            <div className="bg-elevated rounded-lg p-2.5 mb-3 border border-border flex items-center gap-2 group-hover:bg-brand-soft/50 transition-colors">
              <Calendar className="w-4 h-4 text-brand flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold uppercase text-muted tracking-wider">Próxima Cita</span>
                <span className="text-xs font-medium text-text truncate">{patient.nextAppointment || 'No agendada'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              {patient.phone && (
                <div className="flex items-center text-xs text-faint">
                  <Phone className="w-3.5 h-3.5 mr-1" />
                  <span className="truncate">{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center text-xs text-faint">
                  <Mail className="w-3.5 h-3.5 mr-1" />
                  <span className="truncate" title={patient.email}>{patient.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
