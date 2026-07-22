'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { PatientCard, Patient } from './PatientCard'
import { Search, Plus, ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react'
import { CreatePatientModal } from './CreatePatientModal'

interface PatientLeaderboardProps {
  initialPatients: Patient[]
  totalCount: number
  currentPage: number
  currentSearch: string
  currentStatus: string
}

export function PatientLeaderboard({ 
  initialPatients, 
  totalCount, 
  currentPage, 
  currentSearch, 
  currentStatus 
}: PatientLeaderboardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(currentSearch)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Auto-hide toast
  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 3000)
      return () => clearTimeout(t)
    }
  }, [showToast])

  // Sincronizar el input de busqueda con URL y hacer debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        updateURL({ q: searchTerm, page: 1 })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, currentSearch])

  const updateURL = (updates: Record<string, string | number | null>) => {
    setIsPending(true)
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'ALL') {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })
    router.push(`${pathname}?${params.toString()}`)
    setIsPending(false)
  }

  const handleStatusChange = (status: string) => {
    updateURL({ status, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage })
  }

  const totalPages = Math.ceil(totalCount / 20) || 1
  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isPending ? <Loader2 className="h-5 w-5 text-slate-400 animate-spin" /> : <Search className="h-5 w-5 text-slate-400" />}
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all sm:text-sm"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <div className="flex gap-2">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'ACTIVE', label: 'Activos' },
              { id: 'INACTIVE', label: 'Inactivos' }
            ].map(status => (
              <button
                key={status.id}
                onClick={() => handleStatusChange(status.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  (currentStatus || 'ALL') === status.id 
                    ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="clinical-btn px-4 py-2 flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Paciente</span>
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas (Leaderboard) */}
      <div className="transition-opacity">
        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-8 bg-slate-100 rounded-lg w-full mt-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : initialPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 clinical-card bg-white">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No se encontraron pacientes</h3>
            <p className="mt-1 text-slate-500">Intenta ajustar tu búsqueda o agregar uno nuevo.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Mostrando <span className="font-semibold">{((currentPage - 1) * 20) + 1}</span> a <span className="font-semibold">{Math.min(currentPage * 20, totalCount)}</span> de <span className="font-semibold">{totalCount}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 focus:z-20 focus:outline-offset-0">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <CreatePatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccessClose={() => {
          setIsModalOpen(false)
          setShowToast(true)
          updateURL({ page: 1 }) // refresca la lista
        }}
      />
      
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 z-50">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          Paciente agregado correctamente
        </div>
      )}
    </div>
  )
}
