'use client'

import React from 'react'
import { Activity, AlertCircle } from 'lucide-react'
import { AnalysisDefinition } from '@/lib/cephalometry/analyses/types'
import { classifySeverity } from '@/lib/cephalometry/severity'

interface MeasurementPanelProps {
  analysisDef: AnalysisDefinition
  liveResults: Record<string, number> | null // Si es null, faltan landmarks
  pixelsPerMm: number | null
}

export function MeasurementPanel({ analysisDef, liveResults, pixelsPerMm }: MeasurementPanelProps) {
  return (
    <div className="bg-surface/80 backdrop-blur-md border border-border rounded-xl p-4 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h4 className="font-bold text-sm text-text flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand" /> 
          Resultados en vivo
        </h4>
        <span className="px-2 py-0.5 bg-brand-soft text-brand rounded-md text-[10px] font-bold uppercase tracking-wider">
          {analysisDef.label}
        </span>
      </div>

      {!pixelsPerMm && (
        <div className="mb-4 p-3 bg-warning-soft/50 border border-warning/30 rounded-lg flex items-start gap-2 text-xs text-warning-fg">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Falta calibrar (regla) para obtener valores en mm. Los ángulos sí son válidos.</p>
        </div>
      )}

      {!liveResults ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-muted p-4">
          <div className="w-12 h-12 bg-elevated rounded-full flex items-center justify-center mb-3 opacity-50">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium">Esperando puntos...</p>
          <p className="text-xs mt-1">Coloca todos los puntos anatómicos requeridos para ver el análisis.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {analysisDef.measurements.map(m => {
            const rawVal = liveResults[m.key]
            
            // Si es mm y no hay calibración, mostramos "---"
            const val = (m.unit === 'mm' && !pixelsPerMm) ? null : rawVal
            
            const isInvalid = val === null || isNaN(val)
            const severity = isInvalid ? 'normal' : classifySeverity(val, m.norm, m.sd)

            const severityColors = {
              normal: 'text-success bg-success-soft border-success/20',
              leve: 'text-warning-fg bg-warning-soft border-warning/30',
              severo: 'text-danger bg-danger-soft border-danger/30'
            }

            return (
              <div key={m.key} className="flex flex-col p-2.5 rounded-lg border border-border bg-elevated/50 hover:bg-elevated transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-text" title={m.label}>{m.key}</span>
                  <div className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${isInvalid ? 'text-muted bg-surface' : severityColors[severity]}`}>
                    {isInvalid ? '---' : val.toFixed(1)}{m.unit === 'deg' ? '°' : ' mm'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-muted">
                  <span className="truncate pr-2">{m.label}</span>
                  <span className="shrink-0 font-medium whitespace-nowrap">Norma: {m.norm}{m.unit === 'deg' ? '°' : ' mm'}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
