'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, Calendar, FileSpreadsheet, Check, Sparkles } from 'lucide-react'
import { getPatientMoldCharts, saveMoldChart, deleteMoldChart } from '@/app/admin/pacientes/mold-actions'
import { intlBO, toBO } from '@/lib/datetime'

const UPPER_TEETH = ['U7', 'U6', 'U5', 'U4', 'U3', 'U2', 'U1']
const LOWER_TEETH = ['L7', 'L6', 'L5', 'L4', 'L3', 'L2', 'L1']
const MOLD_LINES = ['A', 'B', 'C', 'D', 'E'] as const

const BITE_ADJUSTMENTS: Record<typeof MOLD_LINES[number], string> = {
  A: '+1.0 mm',
  B: '+0.5 mm',
  C: 'Media',
  D: '-0.5 mm',
  E: '-1.0 mm',
}

// Plantilla por defecto con los valores de referencia del formato físico
const DEFAULT_UPPER_VALUES: Record<string, Record<string, string>> = {
  A: { U7: '2.0', U6: '4.0', U5: '5.0', U4: '5.5', U3: '6.0', U2: '5.5', U1: '6.0' },
  B: { U7: '2.0', U6: '3.5', U5: '4.5', U4: '5.0', U3: '5.5', U2: '5.0', U1: '5.5' },
  C: { U7: '2.0', U6: '3.0', U5: '4.0', U4: '4.5', U3: '5.0', U2: '4.5', U1: '5.0' },
  D: { U7: '2.0', U6: '2.5', U5: '3.5', U4: '4.0', U3: '4.5', U2: '4.0', U1: '4.5' },
  E: { U7: '2.0', U6: '2.0', U5: '3.0', U4: '3.5', U3: '4.0', U2: '3.5', U1: '4.0' },
}

const DEFAULT_LOWER_VALUES: Record<string, Record<string, string>> = {
  A: { L7: '3.5', L6: '3.5', L5: '4.5', L4: '5.0', L3: '5.5', L2: '5.0', L1: '5.0' },
  B: { L7: '3.0', L6: '3.0', L5: '4.0', L4: '4.5', L3: '5.0', L2: '4.5', L1: '4.5' },
  C: { L7: '2.5', L6: '2.5', L5: '3.5', L4: '4.0', L3: '4.5', L2: '4.0', L1: '4.0' },
  D: { L7: '2.0', L6: '2.0', L5: '3.0', L4: '3.5', L3: '4.0', L2: '3.5', L1: '3.5' },
  E: { L7: '2.0', L6: '2.0', L5: '2.5', L4: '3.0', L3: '3.5', L2: '3.0', L1: '3.0' },
}

interface ToothMoldChartFormProps {
  patientId: string
}

export function ToothMoldChartForm({ patientId }: ToothMoldChartFormProps) {
  const [charts, setCharts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Estado de edición para la nueva ficha
  const [upperMatrix, setUpperMatrix] = useState<Record<string, Record<string, string>>>(DEFAULT_UPPER_VALUES)
  const [lowerMatrix, setLowerMatrix] = useState<Record<string, Record<string, string>>>(DEFAULT_LOWER_VALUES)
  const [highlights, setHighlights] = useState<Record<string, boolean>>({
    'upper-D-U4': true, 'upper-D-U3': true, 'upper-D-U2': true, 'upper-D-U1': true,
    'lower-B-L5': true, 'lower-B-L4': true, 'lower-B-L3': true, 'lower-B-L2': true, 'lower-B-L1': true,
  })
  const [notes, setNotes] = useState('')
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null)

  const loadCharts = async () => {
    setIsLoading(true)
    const data = await getPatientMoldCharts(patientId)
    setCharts(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadCharts()
  }, [patientId])

  const handleUpperChange = (line: string, tooth: string, val: string) => {
    setUpperMatrix(prev => ({ ...prev, [line]: { ...prev[line], [tooth]: val } }))
  }

  const handleLowerChange = (line: string, tooth: string, val: string) => {
    setLowerMatrix(prev => ({ ...prev, [line]: { ...prev[line], [tooth]: val } }))
  }

  const toggleHighlight = (key: string) => {
    setHighlights(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleLoadDefaults = () => {
    setUpperMatrix(DEFAULT_UPPER_VALUES)
    setLowerMatrix(DEFAULT_LOWER_VALUES)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccessMsg(null)

    // Formatear mediciones para enviar al servidor
    const measurements: any[] = []

    // Arco Superior
    MOLD_LINES.forEach(line => {
      UPPER_TEETH.forEach(tooth => {
        const key = `upper-${line}-${tooth}`
        const rawVal = upperMatrix[line]?.[tooth]
        const numVal = rawVal !== undefined && rawVal !== '' ? parseFloat(rawVal) : null
        measurements.push({
          arc: 'upper',
          moldLine: line,
          toothPosition: tooth,
          measurementMm: numVal,
          biteAdjustment: BITE_ADJUSTMENTS[line],
          isHighlighted: !!highlights[key]
        })
      })
    })

    // Arco Inferior
    MOLD_LINES.forEach(line => {
      LOWER_TEETH.forEach(tooth => {
        const key = `lower-${line}-${tooth}`
        const rawVal = lowerMatrix[line]?.[tooth]
        const numVal = rawVal !== undefined && rawVal !== '' ? parseFloat(rawVal) : null
        measurements.push({
          arc: 'lower',
          moldLine: line,
          toothPosition: tooth,
          measurementMm: numVal,
          biteAdjustment: BITE_ADJUSTMENTS[line],
          isHighlighted: !!highlights[key]
        })
      })
    })

    const res = await saveMoldChart({
      patientId,
      notes: notes.trim() || null,
      measurements
    })

    if ('error' in res) {
      setError(res.error)
    } else {
      setSuccessMsg('Ficha de moldes guardada correctamente.')
      await loadCharts()
      setTimeout(() => setSuccessMsg(null), 4000)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta ficha de moldes?')) return
    await deleteMoldChart(id, patientId)
    await loadCharts()
  }

  const loadPastChartIntoView = (chart: any) => {
    setSelectedChartId(chart.id)
    const newUpper: Record<string, Record<string, string>> = {}
    const newLower: Record<string, Record<string, string>> = {}
    const newHigh: Record<string, boolean> = {}

    MOLD_LINES.forEach(line => {
      newUpper[line] = {}
      newLower[line] = {}
    })

    chart.measurements?.forEach((m: any) => {
      const key = `${m.arc}-${m.moldLine}-${m.toothPosition}`
      if (m.isHighlighted) newHigh[key] = true

      const strVal = m.measurementMm !== null && m.measurementMm !== undefined ? String(m.measurementMm) : ''
      if (m.arc === 'upper') {
        if (!newUpper[m.moldLine]) newUpper[m.moldLine] = {}
        newUpper[m.moldLine][m.toothPosition] = strVal
      } else {
        if (!newLower[m.moldLine]) newLower[m.moldLine] = {}
        newLower[m.moldLine][m.toothPosition] = strVal
      }
    })

    setUpperMatrix(newUpper)
    setLowerMatrix(newLower)
    setHighlights(newHigh)
    setNotes(chart.notes || '')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-brand" />
            Ficha de Selección de Moldes Dentales
          </h2>
          <p className="text-xs text-muted mt-1">
            Matriz de mediciones por pieza dental (mm) y línea de molde con ajuste de mordida para Ortodoncia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadDefaults}
            className="px-3 py-1.5 text-xs font-semibold text-brand bg-brand-soft border border-brand-soft hover:bg-brand/10 rounded-xl transition-all flex items-center gap-1.5"
            title="Cargar valores estándar de referencia"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Cargar Plantilla Estándar
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger-soft border border-danger/30 rounded-xl text-danger text-sm">{error}</div>
      )}

      {successMsg && (
        <div className="p-4 bg-success-soft border border-success/30 rounded-xl text-success text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* HISTORIAL DE FICHAS GUARDADAS */}
      {charts.length > 0 && (
        <div className="bg-elevated/60 p-4 rounded-2xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand" /> Historial de Fichas Guardadas ({charts.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {charts.map((c) => {
              const isSelected = selectedChartId === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => loadPastChartIntoView(c)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border cursor-pointer flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-brand text-brand-fg border-brand shadow-sm'
                      : 'bg-surface text-text border-border hover:border-brand'
                  }`}
                >
                  <span>{intlBO({ dateStyle: 'medium', timeStyle: 'short' }).format(toBO(c.createdAt))}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(c.id)
                    }}
                    className="p-1 text-danger hover:bg-danger-soft rounded-md transition-colors"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* FORMULARIO / TABLA RÉPLICA DEL FORMATO FÍSICO */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-6">
        
        {/* ARCO SUPERIOR (Upper Arc) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand flex items-center gap-2">
              Upper Arc (Arco Superior)
            </h3>
            <span className="text-xs text-muted">Haz clic en una celda para resaltarla</span>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-elevated text-muted border-b border-border">
                  <th className="p-2 border-r border-border font-bold w-12">Línea</th>
                  {UPPER_TEETH.map(t => (
                    <th key={t} className="p-2 border-r border-border font-bold min-w-[55px]">{t}</th>
                  ))}
                  <th className="p-2 font-bold min-w-[100px] text-brand">Ajuste Mordida</th>
                </tr>
              </thead>
              <tbody>
                {MOLD_LINES.map(line => (
                  <tr key={line} className="border-b border-border/60 hover:bg-elevated/30 transition-colors">
                    <td className="p-2 border-r border-border font-bold bg-elevated/50 text-text">{line}</td>
                    {UPPER_TEETH.map(tooth => {
                      const key = `upper-${line}-${tooth}`
                      const isHigh = !!highlights[key]
                      const val = upperMatrix[line]?.[tooth] || ''
                      return (
                        <td
                          key={tooth}
                          onClick={() => toggleHighlight(key)}
                          className={`p-1 border-r border-border/60 cursor-pointer transition-colors ${
                            isHigh ? 'bg-rose-100 dark:bg-rose-950/60 ring-1 ring-rose-400' : ''
                          }`}
                        >
                          <input
                            type="text"
                            value={val}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpperChange(line, tooth, e.target.value)}
                            placeholder="0.0"
                            className={`w-full text-center bg-transparent outline-none font-semibold text-xs py-1 rounded transition-all ${
                              isHigh ? 'text-rose-900 dark:text-rose-200 font-bold' : 'text-text focus:bg-surface focus:ring-1 focus:ring-brand'
                            }`}
                          />
                        </td>
                      )
                    })}
                    <td className="p-2 font-semibold text-brand bg-brand-soft/20 text-center">
                      {BITE_ADJUSTMENTS[line]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ARCO INFERIOR (Lower Arc) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand flex items-center gap-2">
              Lower Arc (Arco Inferior)
            </h3>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-elevated text-muted border-b border-border">
                  <th className="p-2 border-r border-border font-bold w-12">Línea</th>
                  {LOWER_TEETH.map(t => (
                    <th key={t} className="p-2 border-r border-border font-bold min-w-[55px]">{t}</th>
                  ))}
                  <th className="p-2 font-bold min-w-[100px] text-brand">Ajuste Mordida</th>
                </tr>
              </thead>
              <tbody>
                {MOLD_LINES.map(line => (
                  <tr key={line} className="border-b border-border/60 hover:bg-elevated/30 transition-colors">
                    <td className="p-2 border-r border-border font-bold bg-elevated/50 text-text">{line}</td>
                    {LOWER_TEETH.map(tooth => {
                      const key = `lower-${line}-${tooth}`
                      const isHigh = !!highlights[key]
                      const val = lowerMatrix[line]?.[tooth] || ''
                      return (
                        <td
                          key={tooth}
                          onClick={() => toggleHighlight(key)}
                          className={`p-1 border-r border-border/60 cursor-pointer transition-colors ${
                            isHigh ? 'bg-rose-100 dark:bg-rose-950/60 ring-1 ring-rose-400' : ''
                          }`}
                        >
                          <input
                            type="text"
                            value={val}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleLowerChange(line, tooth, e.target.value)}
                            placeholder="0.0"
                            className={`w-full text-center bg-transparent outline-none font-semibold text-xs py-1 rounded transition-all ${
                              isHigh ? 'text-rose-900 dark:text-rose-200 font-bold' : 'text-text focus:bg-surface focus:ring-1 focus:ring-brand'
                            }`}
                          />
                        </td>
                      )
                    })}
                    <td className="p-2 font-semibold text-brand bg-brand-soft/20 text-center">
                      {BITE_ADJUSTMENTS[line]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NOTAS Y OBSERVACIONES */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-muted">Notas u Observaciones de Ortodoncia</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Se seleccionó línea D para arco superior y línea B para arco inferior según estudio de mordida."
            className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-xs focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-none"
          />
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Guardando...' : 'Guardar Ficha de Moldes'}
          </button>
        </div>

      </div>
    </div>
  )
}
