'use client'

import React, { useState } from 'react'
import { Ruler, Check, X } from 'lucide-react'
import { Point, distance } from '@/lib/cephalometry/geometry'

interface CalibrationToolProps {
  imageWidth: number
  imageHeight: number
  p1: Point | null
  p2: Point | null
  onStart: () => void
  onCancel: () => void
  onConfirm: (pixelsPerMm: number) => void
}

export function CalibrationTool({ imageWidth, imageHeight, p1, p2, onStart, onCancel, onConfirm }: CalibrationToolProps) {
  const [realDistanceMm, setRealDistanceMm] = useState<string>('10')

  const handleConfirm = () => {
    if (!p1 || !p2) return
    const mm = parseFloat(realDistanceMm)
    if (isNaN(mm) || mm <= 0) {
      alert("Por favor ingresa una distancia válida en milímetros.")
      return
    }
    
    // La distancia en puntos normalizados (0-1) multiplicada por el ancho/alto nos da la distancia en píxeles reales de la imagen
    const px1 = { x: p1.x * imageWidth, y: p1.y * imageHeight }
    const px2 = { x: p2.x * imageWidth, y: p2.y * imageHeight }
    const distPx = distance(px1, px2)
    
    const pixelsPerMm = distPx / mm
    onConfirm(pixelsPerMm)
  }

  // Si no hay ningún punto, o la calibración ni siquiera ha empezado
  if (!p1 && !p2) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-text flex items-center gap-2">
            <Ruler className="w-4 h-4 text-brand" /> Calibración de Medida
          </h4>
          <p className="text-xs text-muted mt-0.5">Necesario para calcular distancias reales (mm).</p>
        </div>
        <button 
          onClick={onStart}
          className="btn-primary text-xs px-4 py-2"
        >
          Iniciar Calibración
        </button>
      </div>
    )
  }

  return (
    <div className="bg-brand-soft/20 border border-brand/30 rounded-xl p-4 shadow-sm animate-in fade-in zoom-in-95">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm text-brand flex items-center gap-2">
          <Ruler className="w-4 h-4" /> Modo Calibración
        </h4>
        <button onClick={onCancel} className="text-muted hover:text-danger transition-colors p-1 rounded-md">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className={`flex-1 text-center py-1.5 text-xs rounded-md border ${p1 ? 'bg-success-soft border-success/30 text-success font-semibold' : 'bg-surface border-border text-muted'}`}>
            1. Primer punto {p1 && '✓'}
          </div>
          <div className={`flex-1 text-center py-1.5 text-xs rounded-md border ${p2 ? 'bg-success-soft border-success/30 text-success font-semibold' : 'bg-surface border-border text-muted'}`}>
            2. Segundo punto {p2 && '✓'}
          </div>
        </div>

        {p1 && p2 && (
          <div className="flex items-end gap-3 pt-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-text mb-1 block">Distancia Real (mm)</label>
              <input 
                type="number" 
                value={realDistanceMm} 
                onChange={(e) => setRealDistanceMm(e.target.value)}
                className="input w-full px-3 py-1.5 text-sm"
                placeholder="Ej: 10"
              />
            </div>
            <button 
              onClick={handleConfirm}
              className="btn-accent px-4 py-1.5 text-sm h-[34px] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Aplicar
            </button>
          </div>
        )}
        
        {(!p1 || !p2) && (
          <p className="text-xs text-brand font-medium text-center animate-pulse">
            Haz clic en la radiografía para marcar los puntos de la regla.
          </p>
        )}
      </div>
    </div>
  )
}
