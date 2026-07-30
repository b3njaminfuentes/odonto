'use client'

import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Eraser } from 'lucide-react'

interface SignaturePadProps {
  onSave: (signatureData: string | null) => void
  disabled?: boolean
}

export function SignaturePad({ onSave, disabled = false }: SignaturePadProps) {
  const padRef = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const handleClear = () => {
    padRef.current?.clear()
    setIsEmpty(true)
    onSave(null)
  }

  const handleEnd = () => {
    if (padRef.current?.isEmpty()) {
      setIsEmpty(true)
      onSave(null)
    } else {
      setIsEmpty(false)
      // Save as base64 PNG
      const data = padRef.current?.getTrimmedCanvas().toDataURL('image/png')
      onSave(data || null)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className={`relative w-full border-2 border-dashed rounded-xl overflow-hidden bg-white/50 ${disabled ? 'opacity-50 pointer-events-none' : 'border-brand/40'}`}>
        <SignatureCanvas 
          ref={padRef}
          onEnd={handleEnd}
          penColor="#000000"
          canvasProps={{
            className: 'w-full h-[150px] sm:h-[200px] cursor-crosshair'
          }}
        />
        {isEmpty && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-muted/50 text-sm font-medium">
            Firme aquí
          </div>
        )}
      </div>
      
      <div className="flex justify-end w-full">
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled || isEmpty}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border text-muted hover:text-danger hover:border-danger-soft transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <Eraser className="w-3.5 h-3.5" />
          Borrar Firma
        </button>
      </div>
    </div>
  )
}
