'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Activity, Edit2, Lock, Copy, Eye } from 'lucide-react'
import { getCasesByPatient, duplicateCase } from '@/lib/cephalometry/actions'
import { intlBO, toBO } from '@/lib/datetime'
import { useRouter } from 'next/navigation'

interface CephalometryListProps {
  patientId: string
}

export function CephalometryList({ patientId }: CephalometryListProps) {
  const [cases, setCases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const loadCases = async () => {
    setIsLoading(true)
    try {
      const data = await getCasesByPatient(patientId)
      setCases(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [patientId])

  const handleNew = () => {
    router.push(`/admin/pacientes/${patientId}/cefalometria/new`)
  }

  const handleDuplicate = async (e: React.MouseEvent, caseId: string) => {
    e.stopPropagation()
    if (!confirm('¿Crear una copia de este caso para editar o comparar?')) return
    
    try {
      const newCase = await duplicateCase(caseId)
      router.push(`/admin/pacientes/${patientId}/cefalometria/${newCase.id}`)
    } catch (err) {
      alert("Error al duplicar el caso.")
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 bg-surface border border-border p-6 rounded-2xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand" />
            Estudios Cefalométricos
          </h2>
          <p className="text-xs text-muted mt-1">
            Análisis de ortodoncia automatizados y firmados digitalmente.
          </p>
        </div>
        <button 
          onClick={handleNew}
          className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Estudio
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted text-sm py-10">Cargando estudios...</div>
      ) : cases.length === 0 ? (
        <div className="text-center py-12 bg-elevated/50 rounded-xl border border-dashed border-border">
          <Activity className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-semibold text-text mb-1">Sin estudios registrados</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            No se han realizado análisis cefalométricos para este paciente aún.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => {
            const isCompleted = c.status === 'completed'
            return (
              <div 
                key={c.id} 
                className="bg-elevated/60 border border-border rounded-xl p-4 flex flex-col gap-4 hover:border-brand/50 transition-colors cursor-pointer group"
                onClick={() => router.push(`/admin/pacientes/${patientId}/cefalometria/${c.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-text capitalize">
                      Análisis {c.primaryAnalysis}
                    </h3>
                    <p className="text-xs text-muted mt-1">
                      {intlBO({ dateStyle: 'long' }).format(toBO(c.createdAt))}
                    </p>
                  </div>
                  {isCompleted ? (
                    <span className="px-2.5 py-1 bg-success-soft text-success text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Firmado
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-warning-soft text-warning-fg text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Borrador
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="w-20 h-20 bg-surface rounded-lg border border-border overflow-hidden shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.imageUrl} alt="Rx" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 flex flex-col justify-end text-xs text-muted">
                    <p className="mb-1"><span className="font-semibold">Dr(a):</span> {c.doctor.firstName} {c.doctor.lastName}</p>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/pacientes/${patientId}/cefalometria/${c.id}`)
                        }}
                        className="flex-1 py-1.5 bg-brand-soft/50 text-brand rounded-md font-semibold hover:bg-brand hover:text-white transition-colors text-center"
                      >
                        {isCompleted ? 'Ver Reporte' : 'Continuar Editando'}
                      </button>
                      {isCompleted && (
                        <button 
                          onClick={(e) => handleDuplicate(e, c.id)}
                          className="px-3 py-1.5 bg-elevated border border-border text-text rounded-md font-semibold hover:bg-surface transition-colors"
                          title="Duplicar para editar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
