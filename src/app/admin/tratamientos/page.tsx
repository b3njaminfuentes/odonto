import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { Stethoscope, User, Calendar, CreditCard, Filter } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TratamientosGlobalPage() {
  const supabase = createClient()

  const { data: treatments } = await supabase
    .from('Treatment')
    .select(`
      id,
      name,
      description,
      status,
      startDate,
      budget,
      patientId,
      Patient:patientId (
        firstName,
        lastName,
        patientCode
      )
    `)
    .order('startDate', { ascending: false })
    .limit(50)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVO': return 'success'
      case 'COMPLETADO': return 'info'
      case 'PAUSADO': return 'warning'
      case 'CANCELADO': return 'danger'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-serif text-text tracking-tight">Tratamientos</h1>
          <p className="text-muted">
            Vista global de todos los tratamientos activos e históricos de la clínica.
          </p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-border text-muted rounded-xl hover:bg-elevated transition-colors shadow-sm text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>
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
              {treatments?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-faint">
                    <Stethoscope className="w-12 h-12 mx-auto mb-4 text-faint" />
                    <p>Aún no hay tratamientos registrados.</p>
                  </td>
                </tr>
              ) : (
                treatments?.map((t: any) => (
                  <tr key={t.id} className="hover:bg-elevated/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text">{t.name}</div>
                      {t.description && <div className="text-xs text-muted mt-1 truncate max-w-[200px]">{t.description}</div>}
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
