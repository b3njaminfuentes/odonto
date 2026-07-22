'use client'

import React, { useState, useEffect } from 'react'
import { Save, Loader2, Plus, Clock, User, AlertCircle } from 'lucide-react'
import { getClinicalHistory, updateGeneralHistory, saveEvolutionNote } from '@/app/admin/pacientes/history-actions'

interface ClinicalHistoryFormProps {
  patientId: string
}

export function ClinicalHistoryForm({ patientId }: ClinicalHistoryFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingGeneral, setIsSavingGeneral] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
  
  const [history, setHistory] = useState<any>(null)
  const [newNote, setNewNote] = useState('')

  const [generalData, setGeneralData] = useState({
    allergies: '',
    chronicDiseases: '',
    currentMedication: '',
    dentalBackground: ''
  })

  const loadHistory = async () => {
    setIsLoading(true)
    const data = await getClinicalHistory(patientId)
    setHistory(data)
    
    if (data) {
      let parsedMed = { allergies: [], chronicDiseases: [], currentMedication: [] }
      if (data.medicalHistory) {
        parsedMed = typeof data.medicalHistory === 'string' 
          ? JSON.parse(data.medicalHistory) 
          : data.medicalHistory
      }
      
      setGeneralData({
        allergies: parsedMed.allergies?.join(', ') || '',
        chronicDiseases: parsedMed.chronicDiseases?.join(', ') || '',
        currentMedication: parsedMed.currentMedication?.join(', ') || '',
        dentalBackground: data.dentalBackground || ''
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadHistory()
  }, [patientId])

  const handleGeneralChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setGeneralData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveGeneral = async () => {
    setIsSavingGeneral(true)
    
    const medicalHistoryObj = {
      allergies: generalData.allergies.split(',').map(s => s.trim()).filter(Boolean),
      chronicDiseases: generalData.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean),
      currentMedication: generalData.currentMedication.split(',').map(s => s.trim()).filter(Boolean)
    }

    await updateGeneralHistory(patientId, medicalHistoryObj, generalData.dentalBackground)
    await loadHistory()
    setIsSavingGeneral(false)
  }

  const handleSaveNote = async () => {
    if (!newNote.trim()) return
    setIsSavingNote(true)
    
    const medicalHistoryObj = {
      allergies: generalData.allergies.split(',').map(s => s.trim()).filter(Boolean),
      chronicDiseases: generalData.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean),
      currentMedication: generalData.currentMedication.split(',').map(s => s.trim()).filter(Boolean)
    }

    await saveEvolutionNote(patientId, newNote, medicalHistoryObj)
    setNewNote('')
    await loadHistory()
    setIsSavingNote(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* 1. Antecedentes Generales */}
      <section>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
          <AlertCircle className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-serif font-bold text-slate-900">Antecedentes Médicos Generales</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Alergias (separadas por coma)</label>
            <input 
              name="allergies"
              value={generalData.allergies}
              onChange={handleGeneralChange}
              placeholder="Ej: Penicilina, Látex..."
              className="clinical-input w-full px-4 py-2.5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Enfermedades Relevantes</label>
            <input 
              name="chronicDiseases"
              value={generalData.chronicDiseases}
              onChange={handleGeneralChange}
              placeholder="Ej: Diabetes, Hipertensión..."
              className="clinical-input w-full px-4 py-2.5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Medicación Actual</label>
            <input 
              name="currentMedication"
              value={generalData.currentMedication}
              onChange={handleGeneralChange}
              placeholder="Ej: Ibuprofeno 400mg, Losartán..."
              className="clinical-input w-full px-4 py-2.5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Antecedentes Dentales</label>
            <input 
              name="dentalBackground"
              value={generalData.dentalBackground}
              onChange={handleGeneralChange}
              placeholder="Tratamientos previos, cirugías..."
              className="clinical-input w-full px-4 py-2.5"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSaveGeneral}
            disabled={isSavingGeneral}
            className="clinical-btn px-6 py-2.5 flex items-center gap-2 text-sm"
          >
            {isSavingGeneral ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Antecedentes
          </button>
        </div>
      </section>

      {/* 2. Notas de Evolución */}
      <section>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
          <Clock className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-serif font-bold text-slate-900">Evolución y Notas Clínicas</h2>
        </div>

        {/* Formulario Nueva Nota */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
          <label className="text-sm font-medium text-slate-700 block mb-2">Nueva Nota de Evolución / Motivo de Consulta</label>
          <textarea 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Describe la consulta de hoy, hallazgos, diagnóstico o plan..."
            className="clinical-input w-full p-4 min-h-[120px] resize-y mb-4 bg-white"
          />
          <div className="flex justify-end">
            <button 
              onClick={handleSaveNote}
              disabled={isSavingNote || !newNote.trim()}
              className="clinical-btn px-6 py-2.5 flex items-center gap-2 text-sm disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isSavingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Agregar Nota
            </button>
          </div>
        </div>

        {/* Timeline de Notas */}
        <div className="space-y-6">
          {history?.versions && history.versions.length > 0 ? (
            history.versions.map((version: any, idx: number) => (
              <div key={version.id} className="relative pl-6 border-l-2 border-teal-100 pb-2 last:border-0 last:pb-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-teal-500 ring-4 ring-white" />
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Intl.DateTimeFormat('es-BO', { 
                        dateStyle: 'long', 
                        timeStyle: 'short' 
                      }).format(new Date(version.createdAt))}
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      Doctor
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                    {version.observations || 'Sin observaciones.'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-500 text-sm">No hay notas de evolución previas.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
