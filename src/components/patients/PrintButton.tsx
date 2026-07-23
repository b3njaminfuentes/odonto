'use client'

import React from 'react'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-xl bg-brand text-brand-fg font-medium px-5 py-2.5 text-sm shadow-soft hover:bg-brand-hover transition-colors"
    >
      <Printer className="w-4 h-4" />
      Imprimir / Guardar PDF
    </button>
  )
}
