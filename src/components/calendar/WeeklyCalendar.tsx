'use client'

import React, { useState } from 'react'
import { format, addDays, subDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Clock, User, Phone } from 'lucide-react'
import { NewAppointmentModal } from './NewAppointmentModal'
import { StatusBadge } from '../ui/StatusBadge'

interface AppointmentData {
  id: string
  startsAt: string
  endsAt: string
  status: 'CONFIRMADO' | 'PENDIENTE' | 'CANCELADO' | 'COMPLETADO'
  type: string
  notes?: string
  patient: {
    id: string
    firstName: string
    lastName: string
    phone?: string
  }
}

interface WeeklyCalendarProps {
  initialAppointments: AppointmentData[]
  patients: { id: string, name: string, code: string }[]
}

export function WeeklyCalendar({ initialAppointments, patients }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtrar citas del día actual
  const todayAppointments = initialAppointments.filter(app => 
    isSameDay(new Date(app.startsAt), currentDate)
  ).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  const prevDay = () => setCurrentDate(subDays(currentDate, 1))
  const nextDay = () => setCurrentDate(addDays(currentDate, 1))
  const goToday = () => setCurrentDate(new Date())

  const formatTime = (isoString: string) => format(new Date(isoString), 'HH:mm')

  const getStatusType = (status: string) => {
    switch(status) {
      case 'CONFIRMADO': return 'success'
      case 'PENDIENTE': return 'warning'
      case 'CANCELADO': return 'danger'
      case 'COMPLETADO': return 'info'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Controles del Calendario */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
            <button onClick={prevDay} className="p-2 hover:bg-white rounded-md hover:shadow-sm transition-all text-gray-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToday} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-md hover:shadow-sm transition-all">
              Hoy
            </button>
            <button onClick={nextDay} className="p-2 hover:bg-white rounded-md hover:shadow-sm transition-all text-gray-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 capitalize">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h2>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Agendar Cita
        </button>
      </div>

      {/* Agenda Diaria */}
      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
        {todayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
            <Clock className="w-16 h-16 mb-4 text-gray-200" />
            <p className="text-lg font-medium text-gray-900 mb-1">No hay citas para este día</p>
            <p>Disfruta tu tiempo libre o agenda un nuevo paciente.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {todayAppointments.map((app) => (
              <div key={app.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors group">
                {/* Timeline Box */}
                <div className="flex-shrink-0 w-32 flex flex-col items-start sm:items-end sm:border-r sm:border-gray-100 sm:pr-6">
                  <span className="text-xl font-bold text-gray-900">{formatTime(app.startsAt)}</span>
                  <span className="text-sm text-gray-500">{formatTime(app.endsAt)}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={getStatusType(app.status)} text={app.status} />
                        <span className="text-sm font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                          {app.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-2">
                        <User className="w-5 h-5 text-gray-400" />
                        {app.patient.firstName} {app.patient.lastName}
                      </div>
                      
                      {app.patient.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {app.patient.phone}
                        </div>
                      )}

                      {app.notes && (
                        <p className="text-sm text-gray-500 bg-white p-3 rounded-xl border border-gray-100 shadow-sm mt-2">
                          {app.notes}
                        </p>
                      )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button className="text-sm font-medium text-primary hover:underline">Ver ficha</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NewAppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
      />
    </div>
  )
}
