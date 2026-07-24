'use client'

import React, { useEffect, useState } from 'react'
import { Ruler, Plus, Loader2, X, Trash2, Save } from 'lucide-react'
import { getCephalometryHistory, saveCephalometry, deleteCephalometry } from '@/app/admin/pacientes/cephalometry-actions'
import { intlBO, toBO } from '@/lib/datetime'

interface Measure {
  key: string
  label: string
  normal: string
  normalMin: number
  normalMax: number
  unit: string
}

// Análisis de Steiner + Downs, las medidas cefalométricas más usadas en ortodoncia.
const MEASURES: Measure[] = [
  { key: 'sna', label: 'SNA', normal: '82°', normalMin: 80, normalMax: 84, unit: '°' },
  { key: 'snb', label: 'SNB', normal: '80°', normalMin: 78, normalMax: 82, unit: '°' },
  { key: 'anb', label: 'ANB', normal: '2°', normalMin: 0, normalMax: 4, unit: '°' },
  { key: 'planoMandibular', label: 'Plano Mandibular (SN-GoGn)', normal: '32°', normalMin: 28, normalMax: 36, unit: '°' },
  { key: 'anguloInterincisal', label: 'Ángulo Interincisal', normal: '130°', normalMin: 124, normalMax: 136, unit: '°' },
  { key: 'u1SN', label: 'Incisivo Superior a SN (U1-SN)', normal: '102°', normalMin: 98, normalMax: 106, unit: '°' },
  { key: 'impa', label: 'IMPA (L1-Plano Mand.)', normal: '90°', normalMin: 86, normalMax: 94, unit: '°' },
  { key: 'convexidadFacial', label: 'Convexidad Facial (Downs)', normal: '0°', normalMin: -2, normalMax: 2, unit: '°' },
]

export function CephalometryTab({ patientId }: { patientId: string }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setHistory(await getCephalometryHistory(patientId))
    setIsLoading(false)
  }
  useEffect(() => { load() }, [patientId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    const res = await saveCephalometry(patientId, new FormData(e.currentTarget))
    setIsSaving(false)
    if (res?.error) { setError(res.error); return }
    setIsAdding(false)
    await load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este análisis cefalométrico?')) return
    await deleteCephalometry(id, patientId)
    await load()
  }

  const outOfRange = (m: Measure, value: number) => value < m.normalMin || value > m.normalMax

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="text-xl font-serif text-text flex items-center gap-2">
          <Ruler className="w-5 h-5 text-brand" />
          Cefalometría
        </h2>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn-primary px-4 py-2 flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nuevo Análisis
          </button>
        )}
      </div>

      <p className="text-sm text-muted -mt-2">
        Análisis cefalométrico (Steiner / Downs). Cada valor muestra al lado el rango normal de referencia para comparar.
      </p>

      {isAdding && (
        <div className="bg-elevated border border-border rounded-2xl p-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text">Nuevo Análisis Cefalométrico</h3>
            <button onClick={() => setIsAdding(false)} className="p-2 text-muted hover:bg-surface rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          {error && <div className="mb-4 p-3 bg-danger-soft border border-danger/30 rounded-xl text-danger text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MEASURES.map((m) => (
                <div key={m.key} className="space-y-1.5">
                  <label className="flex items-center justify-between text-sm font-medium text-muted">
                    <span>{m.label}</span>
                    <span className="text-xs text-faint">Normal: {m.normal}</span>
                  </label>
                  <input type="number" step="0.1" name={m.key} placeholder="Ej: 82.0" className="input w-full px-4 py-2.5 bg-surface" />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted">Notas / Interpretación clínica</label>
              <textarea name="notes" rows={3} placeholder="Ej: Patrón esquelético clase II, retrusión mandibular leve..." className="input w-full px-4 py-2.5 bg-surface resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-muted hover:bg-surface font-medium rounded-xl transition-colors text-sm">Cancelar</button>
              <button type="submit" disabled={isSaving} className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar Análisis
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted bg-surface rounded-2xl border border-dashed border-border">
          <Ruler className="w-12 h-12 mb-3 text-muted" />
          <p className="text-sm">Aún no hay análisis cefalométricos registrados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((h) => (
            <div key={h.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-text">
                  {intlBO({ dateStyle: 'long' }).format(toBO(h.createdAt))}
                </p>
                <button onClick={() => handleDelete(h.id)} className="text-faint hover:text-danger transition-colors" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {MEASURES.filter((m) => h[m.key] != null).map((m) => {
                  const val = Number(h[m.key])
                  const bad = outOfRange(m, val)
                  return (
                    <div key={m.key} className={`rounded-xl p-3 border ${bad ? 'bg-warning-soft border-warning/30' : 'bg-elevated border-border'}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">{m.label}</p>
                      <p className={`text-lg font-bold ${bad ? 'text-warning' : 'text-text'}`}>{val}{m.unit}</p>
                      <p className="text-[10px] text-faint">Normal: {m.normal}</p>
                    </div>
                  )
                })}
              </div>
              {h.notes && <p className="text-sm text-muted bg-elevated p-3 rounded-xl border border-border">{h.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
