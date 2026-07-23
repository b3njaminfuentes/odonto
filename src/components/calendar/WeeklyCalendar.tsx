'use client'

import React, { useState } from 'react'
import { format, addDays, subDays, isSameDay, getMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Clock, User, Phone, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  
  const [currentDate, setCurrentDate] = useState(dateParam ? new Date(dateParam) : new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // Filtrar citas del día actual
  const todayAppointments = initialAppointments.filter(app => 
    isSameDay(new Date(app.startsAt), currentDate)
  ).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  const navigateToDate = (newDate: Date) => {
    const currentMonth = getMonth(currentDate)
    const newMonth = getMonth(newDate)
    
    setCurrentDate(newDate)
    
    // Si cambiamos de mes, actualizamos la URL para que el servidor traiga los datos de ese mes
    if (currentMonth !== newMonth) {
      setIsPending(true)
      const dateString = format(newDate, 'yyyy-MM-dd')
      router.push(`?date=${dateString}`)
      // El estado isPending se limpia idealmente con un useTransition, pero como useEffect no funciona bien 
      // con las props asíncronas de RSC, haremos un pequeño timeout o simplemente asumimos carga rápida.
      setTimeout(() => setIsPending(false), 800)
    }
  }

  const prevDay = () => navigateToDate(subDays(currentDate, 1))
  const nextDay = () => navigateToDate(addDays(currentDate, 1))
  const goToday = () => navigateToDate(new Date())

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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-elevated rounded-lg p-1 border border-border">
            <button onClick={prevDay} className="p-2 hover:bg-surface rounded-md hover:shadow-sm transition-all text-muted">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToday} className="px-4 py-2 text-sm font-medium text-muted hover:bg-surface rounded-md hover:shadow-sm transition-all">
              Hoy
            </button>
            <button onClick={nextDay} className="p-2 hover:bg-surface rounded-md hover:shadow-sm transition-all text-muted">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-text capitalize">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h2>
          {isPending && <Loader2 className="w-5 h-5 animate-spin text-brand ml-2" />}
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5"
        >
          <Plus className="w-5 h-5" />
          Agendar Cita
        </button>
      </div>

      {/* Agenda Diaria */}
      <div className={`card bg-surface min-h-[500px] transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        {todayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-faint">
            <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-faint" />
            </div>
            <p className="text-lg font-semibold text-text mb-1">No hay citas para este día</p>
            <p className="text-muted">Disfruta tu tiempo libre o agenda un nuevo paciente.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {todayAppointments.map((app) => (
              <div key={app.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-elevated/50 transition-colors group">
                {/* Timeline Box */}
                <div className="flex-shrink-0 w-32 flex flex-col items-start sm:items-end sm:border-r sm:border-border sm:pr-6">
                  <span className="text-xl font-bold text-text">{formatTime(app.startsAt)}</span>
                  <span className="text-sm text-muted">{formatTime(app.endsAt)}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={getStatusType(app.status)} text={app.status} />
                        <span className="text-xs font-semibold text-brand bg-brand-soft border border-brand-soft px-2 py-0.5 rounded-md">
                          {app.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-lg font-semibold text-text mb-2">
                        <User className="w-5 h-5 text-faint" />
                        {app.patient.firstName} {app.patient.lastName}
                      </div>
                      
                      {app.patient.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted mb-3">
                          <Phone className="w-4 h-4 text-faint" />
                          {app.patient.phone}
                        </div>
                      )}

                      {app.notes && (
                        <p className="text-sm text-muted bg-elevated p-3 rounded-xl border border-border shadow-sm mt-2">
                          {app.notes}
                        </p>
                      )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button className="text-sm font-medium text-brand hover:text-brand hover:underline">Ver ficha</button>
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
