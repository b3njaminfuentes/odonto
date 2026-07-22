'use client'

import React, { useState } from 'react'
import { FileText, Smile, ImageIcon } from 'lucide-react'
import { Odontogram } from './Odontogram'
import { GalleryViewer } from './GalleryViewer'
import { ClinicalHistoryForm } from './ClinicalHistoryForm'

interface PatientTabsProps {
  patientId: string
}

export function PatientTabs({ patientId }: PatientTabsProps) {
  const [activeTab, setActiveTab] = useState<'historial' | 'odontograma' | 'galeria'>('odontograma')

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
      
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-gray-100 overflow-x-auto">
        <button
          onClick={() => setActiveTab('historial')}
          className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'historial' 
            ? 'border-primary text-primary bg-primary/5' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Historial Clínico
        </button>
        <button
          onClick={() => setActiveTab('odontograma')}
          className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'odontograma' 
            ? 'border-primary text-primary bg-primary/5' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Smile className="w-4 h-4" />
          Odontograma
        </button>
        <button
          onClick={() => setActiveTab('galeria')}
          className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'galeria' 
            ? 'border-primary text-primary bg-primary/5' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Galería (Imágenes y Radiografías)
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        
        {activeTab === 'historial' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <ClinicalHistoryForm patientId={patientId} />
          </div>
        )}

        {activeTab === 'odontograma' && (
          <Odontogram patientId={patientId} />
        )}

        {activeTab === 'galeria' && (
          <GalleryViewer patientId={patientId} />
        )}

      </div>
    </div>
  )
}
