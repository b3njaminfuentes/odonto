'use client'

import React, { useState } from 'react'
import { FileText, Smile, ImageIcon, Stethoscope, Activity } from 'lucide-react'
import { Odontogram } from './Odontogram'
import { GalleryViewer } from './GalleryViewer'
import { ClinicalHistoryForm } from './ClinicalHistoryForm'
import { PatientTreatments } from './PatientTreatments'
import { PatientSummaryTab } from './PatientSummaryTab'

interface PatientTabsProps {
  patientId: string
  summaryData: any
}

export function PatientTabs({ patientId, summaryData }: PatientTabsProps) {
  const [activeTab, setActiveTab] = useState<'resumen' | 'historial' | 'odontograma' | 'tratamientos' | 'galeria' | 'pagos' | 'citas'>('resumen')

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[700px]">
      
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-100 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'resumen' 
            ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'historial' 
            ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Historial Clínico
        </button>
        <button
          onClick={() => setActiveTab('odontograma')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'odontograma' 
            ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Smile className="w-4 h-4" />
          Odontograma
        </button>
        <button
          onClick={() => setActiveTab('tratamientos')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'tratamientos' 
            ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Tratamientos
        </button>
        <button
          onClick={() => setActiveTab('galeria')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'galeria' 
            ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
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
            ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Pagos
        </button>
        <button
          onClick={() => setActiveTab('citas')}
          className={`whitespace-nowrap py-4 px-6 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'citas' 
            ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Citas
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 relative">
        
        {activeTab === 'resumen' && (
          <PatientSummaryTab summaryData={summaryData} />
        )}

        {activeTab === 'historial' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
            <ClinicalHistoryForm patientId={patientId} />
          </div>
        )}

        {activeTab === 'odontograma' && (
          <Odontogram patientId={patientId} />
        )}

        {activeTab === 'tratamientos' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
            <PatientTreatments patientId={patientId} />
          </div>
        )}

        {activeTab === 'galeria' && (
          <GalleryViewer patientId={patientId} />
        )}

      </div>
    </div>
  )
}
