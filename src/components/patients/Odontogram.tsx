'use client'

import React, { useState } from 'react'
import { Info } from 'lucide-react'

interface OdontogramProps {
  patientId: string
  readOnly?: boolean
}

type ToothState = 'normal' | 'caries' | 'extracción' | 'corona'

export function Odontogram({ patientId, readOnly = false }: OdontogramProps) {
  // Estado local para el estado de los dientes (se guardaría en Supabase en la fase de backend)
  const [teethData, setTeethData] = useState<Record<number, ToothState>>({})
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)

  const upperTeeth = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28]
  const lowerTeeth = [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38]

  const handleToothClick = (toothId: number) => {
    if (readOnly) return
    setSelectedTooth(toothId)
  }

  const updateTooth = (state: ToothState) => {
    if (selectedTooth) {
      setTeethData(prev => ({ ...prev, [selectedTooth]: state }))
      setSelectedTooth(null)
    }
  }

  const getToothColor = (state?: ToothState) => {
    switch (state) {
      case 'caries': return 'bg-danger text-white border-danger'
      case 'extracción': return 'bg-gray-800 text-white border-gray-800 line-through'
      case 'corona': return 'bg-accent text-white border-accent'
      default: return 'bg-white hover:bg-primary/10 border-gray-200 text-gray-700'
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
            <span className="text-xs font-semibold text-gray-400">{t}</span>
            <button
              onClick={() => handleToothClick(t)}
              className={`w-8 h-10 sm:w-10 sm:h-12 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all
                ${getToothColor(state)}
                ${isSelected ? 'ring-4 ring-primary/30 scale-110' : ''}
                ${readOnly ? 'cursor-default' : 'cursor-pointer'}
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
        <h2 className="text-xl font-serif text-gray-900">Odontograma Inicial</h2>
        <div className="flex gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-danger"></div> Caries</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-800"></div> Extracción</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-accent"></div> Corona</span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-100 p-8 flex flex-col items-center justify-center shadow-inner relative">
        
        {selectedTooth && (
          <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200 z-10 animate-in zoom-in-95 w-64">
            <h4 className="font-bold text-gray-900 mb-2">Diente {selectedTooth}</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => updateTooth('normal')} className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg">Sano</button>
              <button onClick={() => updateTooth('caries')} className="px-3 py-1.5 text-xs bg-danger/10 text-danger hover:bg-danger/20 rounded-lg">Caries</button>
              <button onClick={() => updateTooth('extracción')} className="px-3 py-1.5 text-xs bg-gray-800 text-white hover:bg-gray-900 rounded-lg">Extraer</button>
              <button onClick={() => updateTooth('corona')} className="px-3 py-1.5 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded-lg">Corona</button>
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto pb-4">
          <ToothRow teeth={upperTeeth} />
          <div className="w-full h-px bg-gray-200 my-8 relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Línea Media
            </div>
          </div>
          <ToothRow teeth={lowerTeeth} />
        </div>

      </div>
      
      {!readOnly && (
        <div className="mt-4 p-4 bg-infoLight/30 rounded-xl border border-info/20 flex gap-3 text-info">
          <Info className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            Este es un odontograma interactivo preliminar. Haz click en cualquier diente para marcar su estado. 
            En la versión de backend los datos se guardarán automáticamente en la tabla <code>Odontogram</code>.
          </p>
        </div>
      )}
    </div>
  )
}
