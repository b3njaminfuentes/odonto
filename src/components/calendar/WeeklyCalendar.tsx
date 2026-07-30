'use client'

import React, { useState } from 'react'
import {
  format, addDays, subDays, isSameDay, getMonth, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Clock, User, Phone, Loader2, CalendarDays, List, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { NewAppointmentModal } from './NewAppointmentModal'
import { StatusBadge } from '../ui/StatusBadge'
import { updateAppointmentStatus } from '@/app/admin/calendario/actions'

interface AppointmentData {
  id: string
  startsAt: string
  endsAt: string
  status: 'CONFIRMADO' | 'PENDIENTE' | 'CANCELADO'
  type: string
  notes?: string
  patient: { id: string; firstName: string; lastName: string; phone?: string }
  doctor: { name: string } | null
}

interface WeeklyCalendarProps {
  initialAppointments: AppointmentData[]
  patients: { id: string; name: string; code: string }[]
  doctors?: { id: string; name: string; specialty: string | null }[]
}

const statusDot: Record<string, string> = {
  CONFIRMADO: 'bg-success', FINALIZADO: 'bg-success', PENDIENTE: 'bg-warning', CANCELADO: 'bg-danger',
}

/**
 * Convierte un ISO local string ("2026-07-28T16:00:00") a un Date
 * interpretado como hora local (NO UTC).
 * Esto es clave porque nuestras citas se guardan sin Z ni offset.
 */
function parseLocalISO(iso: string): Date {
  // Si el string no tiene Z ni offset, parseISO de date-fns lo interpreta como local
  // Pero para estar seguros, forzamos interpretación local
  if (!iso) return new Date()
  // Si ya tiene Z o +/- offset, devolver directo
  if (iso.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(iso)) {
    return new Date(iso)
  }
  // Interpretar como hora local: YYYY-MM-DDTHH:mm:ss
  const [datePart, timePart] = iso.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  if (!timePart) return new Date(y, m - 1, d)
  const [hh, mm, ss] = timePart.split(':').map(Number)
  return new Date(y, m - 1, d, hh || 0, mm || 0, ss || 0)
}

/** Obtener la fecha de "hoy" en Bolivia (America/La_Paz) como Date local */
function getTodayBolivia(): Date {
  const now = new Date()
  const boliviaStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  const [y, m, d] = boliviaStr.split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0) // start of the day in local time
}

/** Obtener la hora actual exacta en Bolivia (America/La_Paz) como Date local */
function getNowBolivia(): Date {
  const now = new Date()
  const boliviaStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now).replace(' ', 'T')
  return parseLocalISO(boliviaStr)
}

/** Comparar si una cita cae en un día específico, usando parse local */
function isSameDayLocal(isoStr: string, day: Date): boolean {
  const d = parseLocalISO(isoStr)
  return d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
}

export function WeeklyCalendar({ initialAppointments, patients, doctors = [] }: WeeklyCalendarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')

  const [currentDate, setCurrentDate] = useState(() => {
    if (dateParam) {
      const [y, m, d] = dateParam.split('-').map(Number)
      return new Date(y, m - 1, d, 12, 0, 0)
    }
    return getTodayBolivia()
  })
  const [view, setView] = useState<'month' | 'day'>('month')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const changeStatus = async (id: string, status: 'CONFIRMADO' | 'CANCELADO') => {
    setUpdatingId(id)
    await updateAppointmentStatus(id, status)
    setUpdatingId(null)
    router.refresh()
  }

  const appts = initialAppointments.filter(a => a.status !== 'CANCELADO')
  const sortedPatients = [...patients].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))

  const goToMonthData = (newDate: Date) => {
    if (getMonth(currentDate) !== getMonth(newDate) || currentDate.getFullYear() !== newDate.getFullYear()) {
      setIsPending(true)
      const yyyy = newDate.getFullYear()
      const mm = String(newDate.getMonth() + 1).padStart(2, '0')
      const dd = String(newDate.getDate()).padStart(2, '0')
      router.push(`?date=${yyyy}-${mm}-${dd}`)
      setTimeout(() => setIsPending(false), 800)
    }
  }

  // Navegación con flechas: en vista MES → mes anterior/siguiente; en vista DÍA → día anterior/siguiente
  const navigateBack = () => {
    if (view === 'day') {
      const nd = subDays(currentDate, 1)
      setCurrentDate(nd)
      goToMonthData(nd)
    } else {
      const nd = subMonths(currentDate, 1)
      setCurrentDate(nd)
      goToMonthData(nd)
    }
  }

  const navigateForward = () => {
    if (view === 'day') {
      const nd = addDays(currentDate, 1)
      setCurrentDate(nd)
      goToMonthData(nd)
    } else {
      const nd = addMonths(currentDate, 1)
      setCurrentDate(nd)
      goToMonthData(nd)
    }
  }

  const goToToday = () => {
    const today = getTodayBolivia()
    setCurrentDate(today)
    goToMonthData(today)
  }

  const todayAppointments = appts
    .filter(a => isSameDayLocal(a.startsAt, currentDate))
    .sort((a, b) => parseLocalISO(a.startsAt).getTime() - parseLocalISO(b.startsAt).getTime())

  const apptsOn = (day: Date) => appts.filter(a => isSameDayLocal(a.startsAt, day))

  const formatTime = (iso: string) => (iso ? iso.slice(11, 16) : '')
  const getStatusType = (s: string) => (s === 'CONFIRMADO' || s === 'FINALIZADO' ? 'success' : s === 'PENDIENTE' ? 'warning' : s === 'CANCELADO' ? 'danger' : 'default')

  // Check if a day is "today" in Bolivia
  const todayBolivia = getTodayBolivia()
  const exactNowBolivia = getNowBolivia()
  const isTodayBolivia = (day: Date) =>
    day.getFullYear() === todayBolivia.getFullYear() &&
    day.getMonth() === todayBolivia.getMonth() &&
    day.getDate() === todayBolivia.getDate()

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
            <button onClick={navigateBack} className="p-2 hover:bg-surface rounded-md transition-all text-muted"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={goToToday} className="px-4 py-2 text-sm font-medium text-muted hover:bg-surface rounded-md transition-all">Hoy</button>
            <button onClick={navigateForward} className="p-2 hover:bg-surface rounded-md transition-all text-muted"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <h2 className="text-xl font-bold text-text capitalize">
            {view === 'month' ? format(currentDate, "MMMM yyyy", { locale: es }) : format(currentDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
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
              const today = isTodayBolivia(day)
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
                    {dayAppts.slice(0, 3).map(a => {
                      const isWebBooking = a.status === 'PENDIENTE' && a.notes?.startsWith('Solicitud web')
                      // Si la cita termina antes de AHORA, ya pasó
                      const isPast = parseLocalISO(a.endsAt) < exactNowBolivia && a.status === 'CONFIRMADO'
                      const displayStatus = isPast ? 'FINALIZADO' : a.status
                      const dotColor = isWebBooking ? 'bg-danger' : (displayStatus === 'FINALIZADO' ? 'bg-success' : (statusDot[displayStatus] || 'bg-muted'))
                      
                      return (
                        <span key={a.id} className="flex items-center gap-1 text-[10px] sm:text-[11px] text-muted truncate">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor} ${isWebBooking ? 'animate-pulse' : ''}`} />
                          <span className={`truncate ${isWebBooking ? 'font-bold text-danger' : ''}`}>
                            {formatTime(a.startsAt)} {a.patient.firstName || 'Web'}
                          </span>
                        </span>
                      )
                    })}
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
              {todayAppointments.map((app) => {
                const isWebBooking = app.status === 'PENDIENTE' && app.notes?.startsWith('Solicitud web')
                const isPast = parseLocalISO(app.endsAt) < exactNowBolivia && app.status === 'CONFIRMADO'
                const displayStatus = isPast ? 'FINALIZADO' : app.status
                const badgeColor = isWebBooking ? 'danger' : getStatusType(displayStatus)
                
                return (
                <div key={app.id} className={`p-6 flex flex-col sm:flex-row gap-6 hover:bg-elevated/50 transition-colors group ${isWebBooking ? 'bg-danger-soft/30 border-l-4 border-danger' : ''}`}>
                  <div className="flex-shrink-0 w-32 flex flex-col items-start sm:items-end sm:border-r sm:border-border sm:pr-6">
                    <span className="text-xl font-bold text-text">{formatTime(app.startsAt)}</span>
                    <span className="text-sm text-muted">{formatTime(app.endsAt)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={badgeColor as any} text={displayStatus} />
                          {isWebBooking && <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-danger px-2 py-0.5 rounded-full animate-pulse">Reserva Web</span>}
                          <span className="text-xs font-semibold text-brand bg-brand-soft border border-brand-soft px-2 py-0.5 rounded-md">{app.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-semibold text-text mb-2">
                          <User className="w-5 h-5 text-faint" />
                          {app.patient.firstName} {app.patient.lastName !== 'Desconocido' ? app.patient.lastName : ''}
                        </div>
                        {app.patient.phone && <div className="flex items-center gap-2 text-sm text-muted mb-3"><Phone className="w-4 h-4 text-faint" />{app.patient.phone}</div>}
                        {app.doctor?.name && (
                          <div className="flex items-center gap-2 text-sm text-brand font-medium mb-3">
                            <span className="w-4 h-4 flex items-center justify-center bg-brand/10 rounded-full text-[10px]">DR</span>
                            {app.doctor.name}
                          </div>
                        )}
                        {app.notes && <p className={`text-sm p-3 rounded-xl border mt-2 ${isWebBooking ? 'bg-danger-soft text-danger border-danger/20 font-medium' : 'bg-elevated text-muted border-border'}`}>{app.notes}</p>}

                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          {updatingId === app.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-brand" />
                          ) : (
                            <>
                              {app.status === 'PENDIENTE' && (
                                <button
                                  onClick={() => changeStatus(app.id, 'CONFIRMADO')}
                                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                    isWebBooking ? 'bg-danger text-white hover:bg-danger/90 shadow-md ring-2 ring-danger/30' : 'bg-success/10 text-success hover:bg-success/20'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" /> {isWebBooking ? 'Confirmar por WhatsApp' : 'Confirmar'}
                                </button>
                              )}
                              {(app.status === 'PENDIENTE' || app.status === 'CONFIRMADO') && (
                                <button
                                  onClick={() => changeStatus(app.id, 'CANCELADO')}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" /> Cancelar
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {app.patient.id && (
                        <Link href={`/admin/pacientes/${app.patient.id}`} className="shrink-0 text-sm font-medium text-brand hover:underline whitespace-nowrap">
                          Ver ficha
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      )}

      <NewAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} patients={sortedPatients} doctors={doctors} />
    </div>
  )
}
