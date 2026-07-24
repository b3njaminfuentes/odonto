'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Stethoscope, User, Calendar, CreditCard, Search } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface TreatmentRow {
  id: string
  name: string
  description: string | null
  status: string
  startDate: string
  budget: number | null
  patientId: string
  Patient: { firstName: string; lastName: string; patientCode: string } | null
}

const STATUS_OPTIONS = ['TODOS', 'ACTIVO', 'COMPLETADO', 'PAUSADO', 'CANCELADO'] as const

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVO': return 'success'
    case 'COMPLETADO': return 'info'
    case 'PAUSADO': return 'warning'
    case 'CANCELADO': return 'danger'
    default: return 'default'
  }
}

export function TreatmentsTable({ treatments }: { treatments: TreatmentRow[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>('TODOS')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return treatments.filter((t) => {
      if (status !== 'TODOS' && t.status !== status) return false
      if (!q) return true
      const patientName = `${t.Patient?.firstName ?? ''} ${t.Patient?.lastName ?? ''}`.toLowerCase()
      return t.name.toLowerCase().includes(q) || patientName.includes(q) || (t.Patient?.patientCode ?? '').toLowerCase().includes(q)
    })
  }, [treatments, query, status])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por tratamiento o paciente…"
            className="input w-full pl-10"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="input sm:w-52">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'TODOS' ? 'Todos los estados' : s}</option>)}
        </select>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-elevated/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Tratamiento</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Fecha Inicio</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Presupuesto</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-faint">
                    <Stethoscope className="w-12 h-12 mx-auto mb-4 text-faint" />
                    <p>{treatments.length === 0 ? 'Aún no hay tratamientos registrados.' : 'Ningún tratamiento coincide con la búsqueda.'}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-elevated/50 transition-colors group align-top">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-medium text-text">{t.name}</div>
                      {t.description && <div className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">{t.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/pacientes/${t.patientId}`} className="flex items-center gap-2 group-hover:text-brand transition-colors">
                        <User className="w-4 h-4 text-faint" />
                        <span className="font-medium text-text group-hover:text-brand transition-colors">
                          {t.Patient?.firstName} {t.Patient?.lastName}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Calendar className="w-4 h-4 text-faint" />
                        {new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(new Date(t.startDate))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-text">
                        <CreditCard className="w-4 h-4 text-faint" />
                        Bs {Number(t.budget || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={getStatusColor(t.status)} text={t.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
