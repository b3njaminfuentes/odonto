'use client'

import React, { useState } from 'react'
import { FileText, Smile, ImageIcon, Stethoscope, Activity } from 'lucide-react'
import { Odontogram } from './Odontogram'
import { GalleryViewer } from './GalleryViewer'
import { ClinicalHistoryForm } from './ClinicalHistoryForm'
import { PatientTreatments } from './PatientTreatments'
import { PatientSummaryTab } from './PatientSummaryTab'
import { PatientPayments } from './PatientPayments'
import { PatientAppointments } from './PatientAppointments'

interface PatientTabsProps {
  patientId: string
  summaryData: any
}

export function PatientTabs({ patientId, summaryData }: PatientTabsProps) {
  const [activeTab, setActiveTab] = useState<'resumen' | 'historial' | 'odontograma' | 'tratamientos' | 'galeria' | 'pagos' | 'citas'>('resumen')

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col h-[700px]">
      
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-border overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'resumen' 
            ? 'border-brand text-brand bg-brand-soft/50' 
            : 'border-transparent text-muted hover:text-muted hover:bg-elevated'
          }`}
        >
          <Activity className="w-4 h-4" />
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'historial' 
            ? 'border-brand text-brand bg-brand-soft/50' 
            : 'border-transparent text-muted hover:text-muted hover:bg-elevated'
          }`}
        >
          <FileText className="w-4 h-4" />
          Historial Clínico
        </button>
        <button
          onClick={() => setActiveTab('odontograma')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'odontograma' 
            ? 'border-brand text-brand bg-brand-soft/50' 
            : 'border-transparent text-muted hover:text-muted hover:bg-elevated'
          }`}
        >
          <Smile className="w-4 h-4" />
          Odontograma
        </button>
        <button
          onClick={() => setActiveTab('tratamientos')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'tratamientos' 
            ? 'border-brand text-brand bg-brand-soft/50' 
            : 'border-transparent text-muted hover:text-muted hover:bg-elevated'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Tratamientos
        </button>
        <button
          onClick={() => setActiveTab('galeria')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'galeria' 
            ? 'border-brand text-brand bg-brand-soft/50' 
            : 'border-transparent text-muted hover:text-muted hover:bg-elevated'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Documentos y Fotos
        </button>
        {/* Placeholder for Pagos & Citas tabs to be built in later phases */}
        <button
          onClick={() => setActiveTab('pagos')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'pagos' 
            ? 'border-brand text-brand bg-brand-soft/50' 
            : 'border-transparent text-muted hover:text-muted hover:bg-elevated'
          }`}
        >
          Pagos
        </button>
        <button
          onClick={() => setActiveTab('citas')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'citas' 
            ? 'border-brand text-brand bg-brand-soft/50' 
            : 'border-transparent text-muted hover:text-muted hover:bg-elevated'
          }`}
        >
          Citas
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-elevated/50 relative">
        
        {activeTab === 'resumen' && (
          <PatientSummaryTab summaryData={summaryData} />
        )}

        {activeTab === 'historial' && (
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6 md:p-8">
            <ClinicalHistoryForm patientId={patientId} />
          </div>
        )}

        {activeTab === 'odontograma' && (
          <Odontogram patientId={patientId} />
        )}

        {activeTab === 'tratamientos' && (
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6 md:p-8">
            <PatientTreatments patientId={patientId} />
          </div>
        )}

        {activeTab === 'galeria' && (
          <GalleryViewer patientId={patientId} />
        )}

        {activeTab === 'pagos' && (
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <PatientPayments patientId={patientId} />
          </div>
        )}

        {activeTab === 'citas' && (
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <PatientAppointments patientId={patientId} />
          </div>
        )}
      </div>
    </div>
  )
}
