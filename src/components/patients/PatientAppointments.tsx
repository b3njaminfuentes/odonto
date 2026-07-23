'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Loader2, CalendarPlus, AlertCircle } from 'lucide-react'
import { getPatientAppointments } from '@/app/admin/pacientes/appointment-actions'
import Link from 'next/link'

interface PatientAppointmentsProps {
  patientId: string
}

export function PatientAppointments({ patientId }: PatientAppointmentsProps) {
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const data = await getPatientAppointments(patientId)
      setAppointments(data || [])
      setIsLoading(false)
    }
    loadData()
  }, [patientId])

  const getStatusColor = (status: string) => {
    if (status === 'CONFIRMADO') return 'bg-teal-50 text-teal-700 ring-teal-600/20'
    if (status === 'CANCELADO') return 'bg-red-50 text-red-700 ring-red-600/20'
    if (status === 'OCUPADO') return 'bg-orange-50 text-orange-700 ring-orange-600/20'
    if (status === 'DISPONIBLE') return 'bg-slate-100 text-slate-700 ring-slate-500/20'
    return 'bg-blue-50 text-blue-700 ring-blue-600/20'
  }

  const futureAppointments = appointments.filter(a => new Date(a.startsAt) >= new Date())
  const pastAppointments = appointments.filter(a => new Date(a.startsAt) < new Date())

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h2 className="text-xl font-serif text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Historial de Citas
        </h2>
        <Link 
          href="/admin/calendario"
          className="clinical-btn px-4 py-2 flex items-center gap-2 text-sm"
        >
          <CalendarPlus className="w-4 h-4" />
          Agendar Cita
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          <Calendar className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-sm">No hay citas registradas para este paciente.</p>
        </div>
      ) : (
        <>
          {/* Próximas Citas */}
          {futureAppointments.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Próximas Citas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {futureAppointments.map(a => (
                  <div key={a.id} className="bg-white border border-teal-100 shadow-sm rounded-2xl p-5 flex items-start gap-4 ring-1 ring-teal-500/10">
                    <div className="bg-teal-50 rounded-xl p-3 flex flex-col items-center justify-center min-w-[70px] border border-teal-100">
                      <span className="text-xs font-bold text-teal-600 uppercase">
                        {new Intl.DateTimeFormat('es-BO', { month: 'short' }).format(new Date(a.startsAt))}
                      </span>
                      <span className="text-2xl font-black text-teal-700 leading-none my-1">
                        {new Date(a.startsAt).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-900">{a.treatmentType || 'Consulta General'}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ring-1 ring-inset ${getStatusColor(a.status)}`}>
                          {a.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mt-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Intl.DateTimeFormat('es-BO', { timeStyle: 'short' }).format(new Date(a.startsAt))} - 
                        {new Intl.DateTimeFormat('es-BO', { timeStyle: 'short' }).format(new Date(a.endsAt))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citas Pasadas */}
          {pastAppointments.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-t border-slate-100 pt-6">
                Citas Pasadas
              </h3>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Horario</th>
                      <th className="px-6 py-4">Motivo / Tratamiento</th>
                      <th className="px-6 py-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pastAppointments.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {new Intl.DateTimeFormat('es-BO', { dateStyle: 'long' }).format(new Date(a.startsAt))}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Intl.DateTimeFormat('es-BO', { timeStyle: 'short' }).format(new Date(a.startsAt))}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {a.treatmentType || 'Consulta General'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ring-1 ring-inset ${getStatusColor(a.status)}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
