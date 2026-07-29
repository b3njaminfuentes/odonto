'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Loader2, CalendarPlus, AlertCircle, FileText, Check, X } from 'lucide-react'
import { getPatientAppointments, saveClinicalNotes } from '@/app/admin/pacientes/appointment-actions'
import Link from 'next/link'
import { intlBO, toBO } from '@/lib/datetime'

interface PatientAppointmentsProps {
  patientId: string
}

export function PatientAppointments({ patientId }: PatientAppointmentsProps) {
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // States for clinical notes editing
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [currentNotes, setCurrentNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  const loadData = async () => {
    const data = await getPatientAppointments(patientId)
    setAppointments(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [patientId])

  const handleSaveNotes = async (appointmentId: string) => {
    setIsSavingNotes(true)
    const res = await saveClinicalNotes(appointmentId, currentNotes)
    if (res.success) {
      setEditingNotesId(null)
      await loadData() // reload to show updated notes and FINALIZADO status
    } else {
      alert(res.error)
    }
    setIsSavingNotes(false)
  }

  const getStatusColor = (status: string) => {
    if (status === 'CONFIRMADO') return 'bg-brand-soft text-brand ring-brand/20'
    if (status === 'FINALIZADO') return 'bg-success/10 text-success ring-success/20'
    if (status === 'CANCELADO') return 'bg-danger-soft text-danger ring-danger/20'
    if (status === 'OCUPADO') return 'bg-warning-soft text-warning ring-warning/20'
    if (status === 'DISPONIBLE') return 'bg-elevated text-muted ring-border/20'
    return 'bg-info-soft text-info ring-info/20'
  }

  const futureAppointments = appointments.filter(a => new Date(a.startsAt) >= new Date())
  const pastAppointments = appointments.filter(a => new Date(a.startsAt) < new Date())

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="text-xl font-serif text-text flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand" />
          Historial de Sesiones
        </h2>
        <Link 
          href="/admin/calendario"
          className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
        >
          <CalendarPlus className="w-4 h-4" />
          Agendar Cita
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted bg-surface rounded-2xl border border-dashed border-border">
          <Calendar className="w-12 h-12 mb-3 text-muted" />
          <p className="text-sm">No hay citas registradas para este paciente.</p>
        </div>
      ) : (
        <>
          {/* Próximas Citas */}
          {futureAppointments.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" /> Próximas Citas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {futureAppointments.map(a => (
                  <div key={a.id} className="bg-surface border border-brand-soft shadow-sm rounded-2xl p-5 flex items-start gap-4 ring-1 ring-brand/10">
                    <div className="bg-brand-soft rounded-xl p-3 flex flex-col items-center justify-center min-w-[70px] border border-brand-soft">
                      <span className="text-xs font-bold text-brand uppercase">
                        {intlBO({ month: 'short' }).format(toBO(a.startsAt))}
                      </span>
                      <span className="text-2xl font-black text-brand leading-none my-1">
                        {new Date(a.startsAt).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-text">{a.treatmentType || 'Consulta General'}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ring-1 ring-inset ${getStatusColor(a.status)}`}>
                          {a.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted mt-2">
                        <Clock className="w-4 h-4 text-muted" />
                        {intlBO({ timeStyle: 'short' }).format(toBO(a.startsAt))} - 
                        {intlBO({ timeStyle: 'short' }).format(toBO(a.endsAt))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citas Pasadas e Historial */}
          {pastAppointments.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 border-t border-border pt-6">
                Historial de Sesiones Pasadas
              </h3>
              <div className="space-y-4">
                {pastAppointments.map(a => (
                  <div key={a.id} className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:border-brand/30 transition-all">
                    
                    {/* Fila Principal Resumen */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-elevated flex flex-col items-center justify-center shrink-0 border border-border">
                          <span className="text-[10px] font-bold text-muted uppercase leading-none">
                            {intlBO({ month: 'short' }).format(toBO(a.startsAt))}
                          </span>
                          <span className="text-lg font-bold text-text leading-none mt-1">
                            {new Date(a.startsAt).getDate()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-text text-base">{a.treatmentType || 'Consulta General'}</h4>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ring-1 ring-inset ${getStatusColor(a.status)}`}>
                              {a.status === 'CONFIRMADO' ? 'FINALIZADO' : a.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-muted">
                            <Clock className="w-3.5 h-3.5" />
                            {intlBO({ dateStyle: 'long' }).format(toBO(a.startsAt))} · {intlBO({ timeStyle: 'short' }).format(toBO(a.startsAt))}
                          </div>
                        </div>
                      </div>

                      {/* Botón Editar Notas */}
                      {editingNotesId !== a.id && (
                        <button
                          onClick={() => {
                            setEditingNotesId(a.id)
                            setCurrentNotes(a.clinicalNotes || '')
                          }}
                          className="shrink-0 text-sm font-semibold text-brand bg-brand-soft/50 hover:bg-brand-soft px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          {a.clinicalNotes ? 'Ver/Editar Notas' : 'Agregar Notas'}
                        </button>
                      )}
                    </div>

                    {/* Expansión de Notas Clínicas */}
                    {(a.clinicalNotes && editingNotesId !== a.id) && (
                      <div className="px-5 pb-5 pt-0">
                        <div className="bg-elevated/40 p-4 rounded-xl border border-border text-sm text-text whitespace-pre-wrap">
                          <strong className="block text-xs uppercase text-muted mb-2">Notas de la sesión:</strong>
                          {a.clinicalNotes}
                        </div>
                      </div>
                    )}

                    {/* Editor de Notas */}
                    {editingNotesId === a.id && (
                      <div className="p-5 border-t border-border bg-elevated/20 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-text mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand" /> Notas Clínicas de la Sesión
                        </label>
                        <textarea
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          placeholder="Escribe aquí los detalles del tratamiento realizado, observaciones, etc..."
                          rows={4}
                          disabled={isSavingNotes}
                          className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-y text-sm disabled:opacity-50"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            onClick={() => {
                              setEditingNotesId(null)
                              setCurrentNotes('')
                            }}
                            disabled={isSavingNotes}
                            className="px-4 py-2 text-sm font-medium text-muted hover:bg-surface border border-transparent hover:border-border rounded-xl transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveNotes(a.id)}
                            disabled={isSavingNotes}
                            className="btn-primary px-5 py-2 flex items-center gap-2 text-sm shadow-sm"
                          >
                            {isSavingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Guardar y Finalizar
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
