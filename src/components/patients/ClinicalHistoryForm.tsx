'use client'

import React, { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { getClinicalHistory, saveClinicalHistory } from '@/app/admin/pacientes/history-actions'

interface ClinicalHistoryFormProps {
  patientId: string
}

export function ClinicalHistoryForm({ patientId }: ClinicalHistoryFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [formData, setFormData] = useState({
    medicalBackground: '',
    dentalBackground: '',
    allergies: '',
    observations: ''
  })

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getClinicalHistory(patientId)
      if (history) {
        setFormData({
          medicalBackground: history.medicalBackground || '',
          dentalBackground: history.dentalBackground || '',
          allergies: history.allergies || '',
          observations: history.observations || ''
        })
      }
      setIsLoading(false)
    }
    fetchHistory()
  }, [patientId])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMsg('')

    const formDataObj = new FormData()
    formDataObj.append('patientId', patientId)
    formDataObj.append('medicalBackground', formData.medicalBackground)
    formDataObj.append('dentalBackground', formData.dentalBackground)
    formDataObj.append('allergies', formData.allergies)
    formDataObj.append('observations', formData.observations)

    const result = await saveClinicalHistory(formDataObj)
    setIsSaving(false)

    if (result.error) {
      alert(result.error)
    } else {
      setSuccessMsg('Historial guardado exitosamente.')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif text-gray-900">Historial Clínico General</h2>
        {successMsg && (
          <span className="text-sm text-success font-medium bg-success/10 px-3 py-1 rounded-full">
            {successMsg}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Antecedentes Médicos</label>
          <textarea 
            name="medicalBackground"
            value={formData.medicalBackground}
            onChange={handleChange}
            placeholder="Enfermedades sistémicas, medicamentos actuales..."
            className="w-full border border-gray-200 rounded-xl p-3 min-h-[120px] focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Alergias</label>
          <textarea 
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            placeholder="Alergias a medicamentos, látex, etc."
            className="w-full border border-gray-200 rounded-xl p-3 min-h-[120px] focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Antecedentes Dentales</label>
          <textarea 
            name="dentalBackground"
            value={formData.dentalBackground}
            onChange={handleChange}
            placeholder="Tratamientos previos, cirugías dentales, hábitos..."
            className="w-full border border-gray-200 rounded-xl p-3 min-h-[120px] focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Observaciones</label>
          <textarea 
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Comentarios adicionales o alertas para la consulta..."
            className="w-full border border-gray-200 rounded-xl p-3 min-h-[120px] focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Historial
        </button>
      </div>
    </form>
  )
}
