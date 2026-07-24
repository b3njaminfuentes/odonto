'use client'

import React, { useState } from 'react'
import {
  format, addDays, isSameDay, getMonth, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Clock, User, Phone, Loader2, CalendarDays, List } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { NewAppointmentModal } from './NewAppointmentModal'
import { StatusBadge } from '../ui/StatusBadge'
import { toBO } from '@/lib/datetime'

interface AppointmentData {
  id: string
  startsAt: string
  endsAt: string
  status: 'CONFIRMADO' | 'PENDIENTE' | 'CANCELADO' | 'COMPLETADO'
  type: string
  notes?: string
  patient: { id: string; firstName: string; lastName: string; phone?: string }
}

interface WeeklyCalendarProps {
  initialAppointments: AppointmentData[]
  patients: { id: string; name: string; code: string }[]
}

const statusDot: Record<string, string> = {
  CONFIRMADO: 'bg-success', PENDIENTE: 'bg-warning', CANCELADO: 'bg-danger', COMPLETADO: 'bg-info',
}

export function WeeklyCalendar({ initialAppointments, patients }: WeeklyCalendarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')

  const [currentDate, setCurrentDate] = useState(dateParam ? new Date(dateParam) : new Date())
  const [view, setView] = useState<'month' | 'day'>('month')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const appts = initialAppointments.filter(a => a.status !== 'CANCELADO')

  const goToMonthData = (newDate: Date) => {
    if (getMonth(currentDate) !== getMonth(newDate) || currentDate.getFullYear() !== newDate.getFullYear()) {
      setIsPending(true)
      router.push(`?date=${format(newDate, 'yyyy-MM-dd')}`)
      setTimeout(() => setIsPending(false), 800)
    }
  }

  const changeMonth = (dir: number) => {
    const nd = dir > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1)
    setCurrentDate(nd); goToMonthData(nd)
  }

  const todayAppointments = appts
    .filter(a => isSameDay(new Date(a.startsAt), currentDate))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  const apptsOn = (day: Date) => appts.filter(a => isSameDay(new Date(a.startsAt), day))

  const formatTime = (iso: string) => format(toBO(iso), 'HH:mm')
  const getStatusType = (s: string) => (s === 'CONFIRMADO' ? 'success' : s === 'PENDIENTE' ? 'warning' : s === 'CANCELADO' ? 'danger' : s === 'COMPLETADO' ? 'info' : 'default')

  // Días de la grilla del mes (semana empieza lunes)
  const monthStart = startOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-elevated rounded-lg p-1 border border-border">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-surface rounded-md transition-all text-muted"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => { setCurrentDate(new Date()); goToMonthData(new Date()) }} className="px-4 py-2 text-sm font-medium text-muted hover:bg-surface rounded-md transition-all">Hoy</button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-surface rounded-md transition-all text-muted"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <h2 className="text-xl font-bold text-text capitalize">
            {view === 'month' ? format(currentDate, "MMMM yyyy", { locale: es }) : format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h2>
          {isPending && <Loader2 className="w-5 h-5 animate-spin text-brand ml-1" />}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-elevated rounded-lg p-1 border border-border">
            <button onClick={() => setView('month')} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5 transition-all ${view === 'month' ? 'bg-surface text-brand shadow-sm' : 'text-muted hover:text-text'}`}><CalendarDays className="w-4 h-4" /> Mes</button>
            <button onClick={() => setView('day')} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5 transition-all ${view === 'day' ? 'bg-surface text-brand shadow-sm' : 'text-muted hover:text-text'}`}><List className="w-4 h-4" /> Día</button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5"><Plus className="w-5 h-5" /> Agendar</button>
        </div>
      </div>

      {/* VISTA MES */}
      {view === 'month' && (
        <div className={`card bg-surface p-3 sm:p-4 transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="grid grid-cols-7 mb-2">
            {weekdays.map(d => <div key={d} className="text-center text-xs font-semibold text-muted uppercase tracking-wider py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const inMonth = isSameMonth(day, currentDate)
              const dayAppts = apptsOn(day)
              const today = isToday(day)
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => { setCurrentDate(day); setView('day') }}
                  className={`min-h-[84px] sm:min-h-[100px] rounded-xl border p-2 text-left flex flex-col gap-1 transition-all hover:border-brand hover:shadow-sm
                    ${inMonth ? 'bg-surface border-border' : 'bg-elevated/40 border-transparent opacity-50'}
                    ${today ? 'ring-2 ring-brand/40 border-brand' : ''}`}
                >
                  <span className={`text-sm font-semibold ${today ? 'text-brand' : inMonth ? 'text-text' : 'text-faint'}`}>{format(day, 'd')}</span>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {dayAppts.slice(0, 3).map(a => (
                      <span key={a.id} className="flex items-center gap-1 text-[10px] sm:text-[11px] text-muted truncate">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[a.status] || 'bg-muted'}`} />
                        <span className="truncate">{formatTime(a.startsAt)} {a.patient.firstName}</span>
                      </span>
                    ))}
                    {dayAppts.length > 3 && <span className="text-[10px] font-medium text-brand">+{dayAppts.length - 3} más</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* VISTA DÍA */}
      {view === 'day' && (
        <div className={`card bg-surface min-h-[500px] transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
          {todayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-faint">
              <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4"><Clock className="w-8 h-8 text-faint" /></div>
              <p className="text-lg font-semibold text-text mb-1">No hay citas para este día</p>
              <p className="text-muted">Elegí otro día en la vista de mes o agenda una cita.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {todayAppointments.map((app) => (
                <div key={app.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-elevated/50 transition-colors group">
                  <div className="flex-shrink-0 w-32 flex flex-col items-start sm:items-end sm:border-r sm:border-border sm:pr-6">
                    <span className="text-xl font-bold text-text">{formatTime(app.startsAt)}</span>
                    <span className="text-sm text-muted">{formatTime(app.endsAt)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={getStatusType(app.status)} text={app.status} />
                          <span className="text-xs font-semibold text-brand bg-brand-soft border border-brand-soft px-2 py-0.5 rounded-md">{app.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-semibold text-text mb-2">
                          <User className="w-5 h-5 text-faint" />
                          {app.patient.firstName} {app.patient.lastName}
                        </div>
                        {app.patient.phone && <div className="flex items-center gap-2 text-sm text-muted mb-3"><Phone className="w-4 h-4 text-faint" />{app.patient.phone}</div>}
                        {app.notes && <p className="text-sm text-muted bg-elevated p-3 rounded-xl border border-border mt-2">{app.notes}</p>}
                      </div>
                      {app.patient.id && (
                        <Link href={`/admin/pacientes/${app.patient.id}`} className="shrink-0 text-sm font-medium text-brand hover:underline whitespace-nowrap">
                          Ver ficha
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <NewAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} patients={patients} />
    </div>
  )
}
