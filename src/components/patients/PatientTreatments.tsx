'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, CheckCircle, Clock, Loader2, DollarSign, FileText } from 'lucide-react'
import { getPatientTreatments, createTreatment, updateTreatmentStatus } from '@/app/admin/pacientes/treatment-actions'

interface PatientTreatmentsProps {
  patientId: string
}

export function PatientTreatments({ patientId }: PatientTreatmentsProps) {
  const [treatments, setTreatments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    formData.append('patientId', patientId)
    
    await createTreatment(formData)
    await loadData()
    
    setIsSaving(false)
    setIsAdding(false)
    formRef.current?.reset()
  }

  const handleComplete = async (id: string) => {
    if (!confirm('¿Marcar este tratamiento como completado?')) return
    await updateTreatmentStatus(id, 'COMPLETADO', patientId)
    await loadData()
  }

  const handleCancel = async (id: string) => {
    if (!confirm('¿Cancelar este tratamiento?')) return
    await updateTreatmentStatus(id, 'CANCELADO', patientId)
    await loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif text-gray-900">Tratamientos y Presupuestos</h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl font-medium transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Tratamiento
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold text-gray-900 mb-4">Registrar Nuevo Tratamiento</h3>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Tratamiento *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="Ej: Ortodoncia Metálica"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto (Bs)</label>
                <input 
                  type="number" 
                  name="budget" 
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Notas</label>
              <textarea 
                name="description" 
                rows={2}
                placeholder="Detalles adicionales sobre el tratamiento..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl transition-colors font-medium text-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : treatments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <FileText className="w-12 h-12 mb-3 text-gray-300" />
          <p>No hay tratamientos registrados para este paciente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {treatments.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{t.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    t.status === 'ACTIVO' ? 'bg-success/10 text-success' :
                    t.status === 'COMPLETADO' ? 'bg-info/10 text-info' :
                    'bg-danger/10 text-danger'
                  }`}>
                    {t.status}
                  </span>
                </div>
                {t.description && <p className="text-sm text-gray-500 mb-3">{t.description}</p>}
                
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(new Date(t.startDate))}
                  </span>
                  <span className="flex items-center gap-1 text-gray-700">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    Bs {Number(t.budget || 0).toFixed(2)} presupuestado
                  </span>
                </div>
              </div>

              {t.status === 'ACTIVO' && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleComplete(t.id)}
                    className="p-2 bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors"
                    title="Marcar como Completado"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleCancel(t.id)}
                    className="p-2 bg-danger/10 text-danger hover:bg-danger/20 rounded-lg transition-colors text-sm font-medium"
                    title="Cancelar Tratamiento"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
