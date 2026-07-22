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
      case 'caries': return 'bg-red-500 text-white border-red-500'
      case 'extracción': return 'bg-slate-800 text-white border-slate-800 line-through'
      case 'corona': return 'bg-amber-500 text-white border-amber-500'
      default: return 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
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
            <span className="text-xs font-semibold text-slate-400">{t}</span>
            <button
              onClick={() => handleToothClick(t)}
              className={`w-8 h-10 sm:w-10 sm:h-12 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all
                ${getToothColor(state)}
                ${isSelected ? 'ring-4 ring-teal-500/30 scale-110' : ''}
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
        <h2 className="text-xl font-serif text-slate-900">Odontograma Inicial</h2>
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Caries</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-800"></div> Extracción</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Corona</span>
          </div>
          {isSaving && (
            <span className="text-teal-600 flex items-center gap-2 text-sm font-medium animate-in fade-in">
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-100 p-8 flex flex-col items-center justify-center shadow-inner relative min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center absolute inset-0 bg-white/50 z-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : null}
        
        {selectedTooth && (
          <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-lg border border-slate-200 z-10 animate-in zoom-in-95 w-64">
            <h4 className="font-bold text-slate-900 mb-2">Diente {selectedTooth}</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => updateTooth('normal')} className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg">Sano</button>
              <button onClick={() => updateTooth('caries')} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg">Caries</button>
              <button onClick={() => updateTooth('extracción')} className="px-3 py-1.5 text-xs bg-slate-800 text-white hover:bg-slate-900 rounded-lg">Extraer</button>
              <button onClick={() => updateTooth('corona')} className="px-3 py-1.5 text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg">Corona</button>
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto pb-4">
          <ToothRow teeth={upperTeeth} />
          <div className="w-full h-px bg-slate-200 my-8 relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Línea Media
            </div>
          </div>
          <ToothRow teeth={lowerTeeth} />
        </div>

      </div>
      
      {!readOnly && (
        <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-100 flex gap-3 text-teal-700">
          <Info className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            Haz click en cualquier diente para marcar su estado. Los cambios se guardarán automáticamente en la ficha del paciente.
          </p>
        </div>
      )}
    </div>
  )
}
