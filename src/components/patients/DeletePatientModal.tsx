'use client'

import React, { useState } from 'react'
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react'
import { deletePatient } from '@/app/admin/pacientes/actions'
import { useRouter } from 'next/navigation'

interface DeletePatientModalProps {
  patientId: string
  patientName: string
  redirectToIndex?: boolean
  onSuccess?: () => void
  triggerButton?: React.ReactNode
}

export function DeletePatientModal({
  patientId,
  patientName,
  redirectToIndex = false,
  onSuccess,
  triggerButton,
}: DeletePatientModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    const result = await deletePatient(patientId)
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      setIsOpen(false)
      if (onSuccess) onSuccess()
      if (redirectToIndex) {
        router.push('/admin/pacientes')
      } else {
        router.refresh()
      }
    }
  }

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)}>{triggerButton}</div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-danger-soft border border-danger/30 text-danger font-medium rounded-xl hover:bg-danger hover:text-white transition-all flex items-center gap-2 shadow-sm text-sm"
          title="Eliminar paciente de forma permanente"
        >
          <Trash2 className="w-4 h-4" />
          <span>Eliminar Paciente</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

          <div data-lenis-prevent className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden animate-in zoom-in-95 border border-border">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted hover:text-text hover:bg-elevated rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-danger-soft text-danger flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-text">Eliminar Paciente</h3>
                <p className="text-xs text-muted">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-danger-soft text-danger text-sm rounded-xl border border-danger/30">
                {error}
              </div>
            )}

            <p className="text-sm text-muted leading-relaxed mb-6">
              ¿Estás seguro de eliminar a <strong className="text-text">{patientName}</strong>? Se borrará permanentemente todo su historial clínico, tratamientos, citas, pagos y archivos asociados.
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-5 py-2.5 text-muted font-medium hover:bg-elevated rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-5 py-2.5 bg-danger text-white font-medium hover:bg-danger/90 rounded-xl transition-all shadow-sm text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {loading ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
