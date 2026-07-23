'use client'

import React, { useState, useEffect } from 'react'
import { Info, Loader2, Save } from 'lucide-react'
import { getOdontogram, saveOdontogram } from '@/app/admin/pacientes/odontogram-actions'

interface OdontogramProps {
  patientId: string
  readOnly?: boolean
}

type ToothState = 'normal' | 'caries' | 'extracción' | 'corona'

export function Odontogram({ patientId, readOnly = false }: OdontogramProps) {
  const [teethData, setTeethData] = useState<Record<number, ToothState>>({})
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const data = await getOdontogram(patientId)
      setTeethData(data || {})
      setIsLoading(false)
    }
    loadData()
  }, [patientId])

  const upperTeeth = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28]
  const lowerTeeth = [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38]

  const handleToothClick = (toothId: number) => {
    if (readOnly) return
    setSelectedTooth(toothId)
  }

  const updateTooth = async (state: ToothState) => {
    if (selectedTooth) {
      const newData = { ...teethData, [selectedTooth]: state }
      setTeethData(newData)
      setSelectedTooth(null)
      
      // Auto-guardado
      setIsSaving(true)
      await saveOdontogram(patientId, newData)
      setIsSaving(false)
    }
  }

  const getToothColor = (state?: ToothState) => {
    switch (state) {
      case 'caries': return 'bg-danger text-white border-danger'
      case 'extracción': return 'bg-elevated text-white border-border line-through'
      case 'corona': return 'bg-warning text-white border-warning'
      default: return 'bg-surface hover:bg-elevated border-border text-muted'
    }
  }

  // Pequeño componente para renderizar la fila de dientes
  const ToothRow = ({ teeth }: { teeth: number[] }) => (
    <div className="flex justify-center gap-1 sm:gap-2 mb-4 flex-wrap">
      {teeth.map(t => {
        const state = teethData[t]
        const isSelected = selectedTooth === t
        return (
          <div key={t} className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-muted">{t}</span>
            <button
              onClick={() => handleToothClick(t)}
              className={`w-8 h-10 sm:w-10 sm:h-12 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all
                ${getToothColor(state)}
                ${isSelected ? 'ring-4 ring-brand/30 scale-110' : ''}
                ${readOnly ? 'cursor-default' : 'cursor-pointer shadow-sm'}
              `}
            >
              {state === 'extracción' ? 'X' : ''}
            </button>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-text">Odontograma Inicial</h2>
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-sm text-muted">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-danger"></div> Caries</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-elevated"></div> Extracción</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-warning"></div> Corona</span>
          </div>
          {isSaving && (
            <span className="text-brand flex items-center gap-2 text-sm font-medium animate-in fade-in">
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 bg-surface rounded-xl border border-border p-8 flex flex-col items-center justify-center shadow-inner relative min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center absolute inset-0 bg-surface/50 z-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : null}
        
        {selectedTooth && (
          <div className="absolute top-4 right-4 bg-surface p-4 rounded-xl shadow-lg border border-border z-10 animate-in zoom-in-95 w-64">
            <h4 className="font-bold text-text mb-2">Diente {selectedTooth}</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => updateTooth('normal')} className="px-3 py-1.5 text-xs bg-elevated hover:bg-elevated rounded-lg">Sano</button>
              <button onClick={() => updateTooth('caries')} className="px-3 py-1.5 text-xs bg-danger-soft text-danger hover:bg-danger-soft rounded-lg">Caries</button>
              <button onClick={() => updateTooth('extracción')} className="px-3 py-1.5 text-xs bg-elevated text-white hover:bg-bg rounded-lg">Extraer</button>
              <button onClick={() => updateTooth('corona')} className="px-3 py-1.5 text-xs bg-warning-soft text-warning hover:bg-warning-soft rounded-lg">Corona</button>
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto pb-4">
          <ToothRow teeth={upperTeeth} />
          <div className="w-full h-px bg-elevated my-8 relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-surface px-4 text-xs font-semibold text-muted uppercase tracking-widest">
              Línea Media
            </div>
          </div>
          <ToothRow teeth={lowerTeeth} />
        </div>

      </div>
      
      {!readOnly && (
        <div className="mt-4 p-4 bg-brand-soft rounded-xl border border-brand-soft flex gap-3 text-brand">
          <Info className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            Haz click en cualquier diente para marcar su estado. Los cambios se guardarán automáticamente en la ficha del paciente.
          </p>
        </div>
      )}
    </div>
  )
}
