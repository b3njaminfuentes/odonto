'use client'

import React from 'react'
import { CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react'
import { LandmarkKey, LANDMARK_REGISTRY } from '@/lib/cephalometry/landmarks'

interface LandmarkChecklistProps {
  missingLandmarks: LandmarkKey[]
  requiredLandmarks: LandmarkKey[]
  activeLandmark: LandmarkKey | null
  onSelectLandmark: (key: LandmarkKey | null) => void
}

export function LandmarkChecklist({ missingLandmarks, requiredLandmarks, activeLandmark, onSelectLandmark }: LandmarkChecklistProps) {
  const isComplete = missingLandmarks.length === 0
  const placedCount = requiredLandmarks.length - missingLandmarks.length

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col h-full max-h-[400px]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h4 className="font-bold text-sm text-text flex items-center gap-2">
          Puntos Anatómicos
        </h4>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isComplete ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning-fg'}`}>
          {placedCount} / {requiredLandmarks.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
        {requiredLandmarks.map(key => {
          const info = LANDMARK_REGISTRY.find(l => l.key === key)
          const isPlaced = !missingLandmarks.includes(key)
          const isActive = activeLandmark === key

          return (
            <button
              key={key}
              onClick={() => onSelectLandmark(isActive ? null : key)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-sm border ${
                isActive 
                  ? 'bg-brand-soft/20 border-brand/50 ring-1 ring-brand' 
                  : isPlaced
                    ? 'bg-success-soft/20 border-success/20 hover:border-success/40'
                    : 'bg-elevated border-transparent hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {isPlaced ? (
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand' : 'text-success'}`} />
                ) : (
                  <div className={`w-4 h-4 shrink-0 rounded-full border-2 ${isActive ? 'border-brand' : 'border-muted'}`} />
                )}
                <span className={`truncate ${isActive ? 'font-bold text-brand' : isPlaced ? 'font-medium text-text' : 'text-muted'}`}>
                  {key} <span className="opacity-60 font-normal text-xs">- {info?.label}</span>
                </span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-brand shrink-0" />}
            </button>
          )
        })}
      </div>

      {isComplete ? (
        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs font-semibold text-success shrink-0">
          <CheckCircle2 className="w-4 h-4" />
          Análisis listo para generar
        </div>
      ) : (
        <div className="mt-4 pt-3 border-t border-border flex items-start gap-2 text-xs text-muted shrink-0">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <span className="leading-snug">Selecciona los puntos faltantes y haz clic en la radiografía para colocarlos.</span>
        </div>
      )}
    </div>
  )
}
