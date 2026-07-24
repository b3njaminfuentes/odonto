'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, CheckCircle, Clock, Loader2, DollarSign, FileText, Activity, MoreVertical, X, Settings2, Save } from 'lucide-react'
import { getPatientTreatments, createTreatment, updateTreatment, updateTreatmentStatus } from '@/app/admin/pacientes/treatment-actions'

interface PatientTreatmentsProps {
  patientId: string
}

export function PatientTreatments({ patientId }: PatientTreatmentsProps) {
  const [treatments, setTreatments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<any | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const loadData = async () => {
    setIsLoading(true)
    const data = await getPatientTreatments(patientId)
    setTreatments(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [patientId])

  const openNewModal = () => {
    setEditingTreatment(null)
    setIsModalOpen(true)
  }

  const openEditModal = (t: any) => {
    setEditingTreatment(t)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTreatment(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    formData.append('patientId', patientId)
    
    if (editingTreatment) {
      await updateTreatment(editingTreatment.id, formData)
    } else {
      await createTreatment(formData)
    }
    
    await loadData()
    setIsSaving(false)
    closeModal()
  }

  const handleStatusChange = async (id: string, status: 'ACTIVO' | 'COMPLETADO' | 'CANCELADO') => {
    if (!confirm(`¿Cambiar estado a ${status}?`)) return
    await updateTreatmentStatus(id, status, patientId)
    await loadData()
  }

  const getStatusColor = (status: string) => {
    if (status === 'ACTIVO') return 'bg-brand-soft text-brand ring-brand/20'
    if (status === 'COMPLETADO') return 'bg-elevated text-muted ring-border/20'
    return 'bg-danger-soft text-danger ring-danger/20'
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="text-xl font-serif text-text flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-brand" />
          Tratamientos y Presupuestos
        </h2>
        <button 
          onClick={openNewModal}
          className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Tratamiento
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : treatments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted bg-surface rounded-2xl border border-dashed border-border">
          <FileText className="w-12 h-12 mb-3 text-muted" />
          <p className="text-sm">No hay tratamientos registrados para este paciente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {treatments.map((t) => (
            <div 
              key={t.id} 
              onClick={() => openEditModal(t)}
              className="card p-5 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ring-1 ring-inset ${getStatusColor(t.status)}`}>
                    {t.status}
                  </span>
                  {t.toothNumber && (
                    <span className="text-xs font-medium text-muted bg-elevated px-2 py-1 rounded-md">
                      Pieza: {t.toothNumber}
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-text text-lg leading-tight mb-2 group-hover:text-brand transition-colors">{t.name}</h3>
                
                {t.description && (
                  <p className="text-sm text-muted line-clamp-2 mb-4 leading-relaxed">{t.description}</p>
                )}
              </div>
              
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-medium text-muted">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(new Date(t.startDate))}
                </span>
                
                <div className="flex flex-col items-end">
                  {t.budget != null && (
                    <span className="text-muted">Presupuesto: Bs {Number(t.budget).toFixed(2)}</span>
                  )}
                  {t.finalCost != null && (
                    <span className="text-text font-bold">Costo Real: Bs {Number(t.finalCost).toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tratamiento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-bg/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={closeModal} />
          
          <div data-lenis-prevent className="relative bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-lg font-serif font-bold text-text">
                {editingTreatment ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
              </h3>
              <button onClick={closeModal} className="p-2 text-muted hover:text-muted hover:bg-elevated rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Nombre del Tratamiento *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  defaultValue={editingTreatment?.name}
                  placeholder="Ej: Ortodoncia Metálica, Endodoncia..."
                  className="input w-full px-4 py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">Diente Asociado (opcional)</label>
                  <input 
                    type="text" 
                    name="toothNumber" 
                    defaultValue={editingTreatment?.toothNumber}
                    placeholder="Ej: 48, 11-21"
                    className="input w-full px-4 py-2.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">Estado</label>
                  <select 
                    name="status"
                    defaultValue={editingTreatment?.status || 'ACTIVO'}
                    className="input w-full px-4 py-2.5 bg-surface"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="COMPLETADO">Completado</option>
                    <option value="PAUSADO">Pausado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">Presupuesto Inicial (Bs)</label>
                  <input 
                    type="number"
                    name="budget"
                    step="0.01"
                    min="0"
                    defaultValue={editingTreatment?.budget}
                    placeholder="0.00"
                    className="input w-full px-4 py-2.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">Costo Final Cobrado (Bs)</label>
                  <input 
                    type="number"
                    name="finalCost"
                    step="0.01"
                    min="0"
                    defaultValue={editingTreatment?.finalCost}
                    placeholder="0.00"
                    className="input w-full px-4 py-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Descripción / Notas</label>
                <textarea 
                  name="description" 
                  rows={3}
                  defaultValue={editingTreatment?.description}
                  placeholder="Detalles adicionales..."
                  className="input w-full px-4 py-2.5 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-5 py-2.5 text-muted hover:bg-elevated font-medium rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Tratamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
