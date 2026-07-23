'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DollarSign, Plus, Loader2, FileText, CheckCircle, XCircle } from 'lucide-react'
import { getPatientPayments, getPatientActiveTreatments, createPayment, updatePaymentStatus } from '@/app/admin/pacientes/payment-actions'

interface PatientPaymentsProps {
  patientId: string
}

export function PatientPayments({ patientId }: PatientPaymentsProps) {
  const [payments, setPayments] = useState<any[]>([])
  const [activeTreatments, setActiveTreatments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const loadData = async () => {
    setIsLoading(true)
    const [pData, tData] = await Promise.all([
      getPatientPayments(patientId),
      getPatientActiveTreatments(patientId)
    ])
    setPayments(pData || [])
    setActiveTreatments(tData || [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [patientId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    formData.append('patientId', patientId)
    
    await createPayment(formData)
    await loadData()
    
    setIsSaving(false)
    setIsAdding(false)
  }

  const handleStatus = async (id: string, status: string) => {
    if (!confirm(`¿Marcar como ${status}?`)) return
    await updatePaymentStatus(id, status, patientId)
    await loadData()
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="text-xl font-serif text-text flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-brand" />
          Historial de Pagos
        </h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Registrar Pago
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-elevated border border-border rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-text mb-4">Registrar Nuevo Pago</h3>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Monto (Bs) *</label>
                <input 
                  type="number" 
                  name="amount" 
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="input w-full px-4 py-2.5 bg-surface"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Método de Pago</label>
                <select name="method" className="input w-full px-4 py-2.5 bg-surface">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia / QR">Transferencia / QR</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted">Vincular a Tratamiento (Opcional)</label>
              <select name="treatmentId" className="input w-full px-4 py-2.5 bg-surface">
                <option value="">Ninguno (Pago General)</option>
                {activeTreatments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.toothNumber ? `(Pieza ${t.toothNumber})` : ''} - Costo Final: Bs {t.finalCost || t.budget || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted">Notas Adicionales</label>
              <input 
                type="text" 
                name="notes" 
                placeholder="Ej: Adelanto para ortodoncia"
                className="input w-full px-4 py-2.5 bg-surface"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-5 py-2.5 text-muted hover:bg-elevated font-medium rounded-xl transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Registrar Pago
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted bg-surface rounded-2xl border border-dashed border-border">
          <DollarSign className="w-12 h-12 mb-3 text-muted" />
          <p className="text-sm">No hay pagos registrados para este paciente.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-elevated text-muted font-medium">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4">Tratamiento Vinculado</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-elevated/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text">
                    {new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(p.date))}
                  </td>
                  <td className="px-6 py-4 font-bold text-brand">
                    Bs {Number(p.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {p.method || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {p.treatment ? (
                      <span className="text-xs bg-elevated px-2.5 py-1 rounded-md text-muted font-medium">
                        {p.treatment.name}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                    {p.notes && <p className="text-xs text-muted mt-1 truncate max-w-[200px]">{p.notes}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                      p.status === 'COMPLETADO' ? 'bg-brand-soft text-brand ring-1 ring-inset ring-brand/20' : 
                      p.status === 'CANCELADO' ? 'bg-danger-soft text-danger ring-1 ring-inset ring-danger/20' : 
                      'bg-warning-soft text-warning ring-1 ring-inset ring-warning/20'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.status !== 'CANCELADO' && (
                      <button 
                        onClick={() => handleStatus(p.id, 'CANCELADO')}
                        className="text-danger hover:text-danger transition-colors"
                        title="Anular Pago"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
