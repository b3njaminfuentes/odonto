import React from 'react'
import { FolderOpen, File, Plus, Download, MoreVertical } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function DocumentosPage() {
  const documents = [
    { id: 1, name: 'Consentimiento Informado - Ortodoncia.pdf', size: '2.4 MB', date: '21 Jul 2026', type: 'pdf' },
    { id: 2, name: 'Consentimiento Informado - Cirugía.pdf', size: '1.8 MB', date: '21 Jul 2026', type: 'pdf' },
    { id: 3, name: 'Instrucciones Post-Operatorias.pdf', size: '850 KB', date: '15 Jul 2026', type: 'pdf' },
    { id: 4, name: 'Logotipo_Clinica_AltaResolucion.png', size: '5.2 MB', date: '10 Jun 2026', type: 'image' },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-serif text-gray-900 tracking-tight">Documentos Globales</h1>
          <p className="text-gray-500">
            Plantillas, consentimientos y archivos generales de la clínica.
          </p>
        </div>
        
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          Subir Archivo
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex gap-4">
            <button className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-lg">Todos</button>
            <button className="text-sm font-medium text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">Plantillas</button>
            <button className="text-sm font-medium text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">Imágenes</button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {doc.type === 'pdf' ? <File className="w-6 h-6" /> : <FolderOpen className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors cursor-pointer">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {doc.size} • Subido el {doc.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
