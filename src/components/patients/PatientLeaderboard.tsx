'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { PatientCard, Patient } from './PatientCard'
import { Search, Plus, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Trash2, CheckSquare, Square, AlertTriangle, X, ArrowUpDown } from 'lucide-react'
import { CreatePatientModal } from './CreatePatientModal'
import { DeletePatientModal } from './DeletePatientModal'
import { deletePatients } from '@/app/admin/pacientes/actions'

interface PatientLeaderboardProps {
  initialPatients: Patient[]
  totalCount: number
  currentPage: number
  currentSearch: string
  currentStatus: string
  currentSort?: string
}

export function PatientLeaderboard({ 
  initialPatients, 
  totalCount, 
  currentPage, 
  currentSearch, 
  currentStatus,
  currentSort = 'alpha_asc'
}: PatientLeaderboardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(currentSearch)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Paciente agregado correctamente')

  // Selección masiva (Chunk Delete)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)
  const [bulkError, setBulkError] = useState<string | null>(null)

  // Eliminación individual
  const [singleDeletePatient, setSingleDeletePatient] = useState<Patient | null>(null)

  // Auto-hide toast
  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 3500)
      return () => clearTimeout(t)
    }
  }, [showToast])

  // Debounce búsqueda
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

  const handleSortChange = (sort: string) => {
    updateURL({ sort, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage })
  }

  const toggleSelectPatient = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const allCurrentIds = initialPatients.map(p => p.id)
    const allSelected = allCurrentIds.every(id => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !allCurrentIds.includes(id)))
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allCurrentIds])))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    setIsDeletingBulk(true)
    setBulkError(null)
    const res = await deletePatients(selectedIds)
    setIsDeletingBulk(false)

    if ('error' in res) {
      setBulkError(res.error)
    } else {
      setIsBulkDeleteModalOpen(false)
      setSelectedIds([])
      setSelectionMode(false)
      setToastMessage(`Se eliminaron ${res.deletedCount} pacientes correctamente.`)
      setShowToast(true)
      router.refresh()
    }
  }

  const totalPages = Math.ceil(totalCount / 20) || 1
  const allCurrentSelected = initialPatients.length > 0 && initialPatients.every(p => selectedIds.includes(p.id))

  return (
    <div className="space-y-6">

      {/* Header & Controls */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-4 sm:mx-0 sm:px-0 sm:py-0 sm:static mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center bg-surface/90 backdrop-blur-xl p-4 sm:rounded-2xl sm:border border-b sm:border-border shadow-sm">
          
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isPending ? <Loader2 className="h-5 w-5 text-faint animate-spin" /> : <Search className="h-5 w-5 text-faint" />}
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 bg-elevated border border-border rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all sm:text-sm"
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
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
                      ? 'bg-brand-soft text-brand ring-1 ring-brand/20' 
                      : 'bg-surface text-muted hover:bg-elevated border border-border'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-border hidden md:block" />

            {/* Selector de Orden Alfabético / Recientes */}
            <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-3 py-1.5 shrink-0 shadow-sm">
              <ArrowUpDown className="w-4 h-4 text-brand" />
              <span className="text-xs font-medium text-muted hidden sm:inline">Ordenar:</span>
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-text outline-none cursor-pointer"
              >
                <option value="alpha_asc">Nombre (A → Z)</option>
                <option value="alpha_desc">Nombre (Z → A)</option>
                <option value="recent">Más recientes</option>
              </select>
            </div>

            <div className="w-px h-6 bg-border hidden md:block" />

            {/* Toggle Selección Masiva (Chunk) */}
            <button
              onClick={() => {
                setSelectionMode(!selectionMode)
                if (selectionMode) setSelectedIds([])
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 border ${
                selectionMode
                  ? 'bg-brand/10 border-brand text-brand shadow-sm'
                  : 'bg-surface border-border text-muted hover:border-brand hover:text-brand'
              }`}
              title="Selección múltiple para borrado en lote (chunk)"
            >
              {selectionMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <span>{selectionMode ? 'Cancelar Selección' : 'Selección Masiva'}</span>
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary px-4 py-2 flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Paciente</span>
            </button>
          </div>
        </div>
      </div>

      {/* BARRA FLOTANTE DE ACCIONES MASIVAS (CHUNK DELETE) */}
      {selectionMode && (
        <div className="bg-elevated border border-brand/40 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-semibold text-text hover:border-brand transition-colors flex items-center gap-2"
            >
              {allCurrentSelected ? <CheckSquare className="w-4 h-4 text-brand" /> : <Square className="w-4 h-4 text-muted" />}
              {allCurrentSelected ? 'Deseleccionar Todos' : 'Seleccionar Todos en esta página'}
            </button>
            <span className="text-xs font-bold text-brand bg-brand-soft px-3 py-1.5 rounded-xl border border-brand/20">
              {selectedIds.length} {selectedIds.length === 1 ? 'paciente seleccionado' : 'pacientes seleccionados'}
            </span>
          </div>

          <button
            disabled={selectedIds.length === 0}
            onClick={() => setIsBulkDeleteModalOpen(true)}
            className="px-4 py-2 bg-danger text-white text-xs font-bold rounded-xl hover:bg-danger/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Seleccionados ({selectedIds.length})
          </button>
        </div>
      )}

      {/* Grid de Tarjetas (Leaderboard) */}
      <div className="transition-opacity">
        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-surface rounded-2xl border border-border p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-border" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-border rounded w-2/3" />
                    <div className="h-3 bg-elevated rounded w-1/3" />
                    <div className="h-8 bg-elevated rounded-lg w-full mt-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : initialPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                selectionMode={selectionMode}
                isSelected={selectedIds.includes(patient.id)}
                onToggleSelect={toggleSelectPatient}
                onSingleDelete={(p) => setSingleDeletePatient(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card bg-surface">
            <div className="mx-auto w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-faint" />
            </div>
            <h3 className="text-lg font-semibold text-text">No se encontraron pacientes</h3>
            <p className="mt-1 text-muted">Intenta ajustar tu búsqueda o agregar uno nuevo.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-3 sm:px-6 rounded-2xl shadow-sm">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted">
                Mostrando <span className="font-semibold">{((currentPage - 1) * 20) + 1}</span> a <span className="font-semibold">{Math.min(currentPage * 20, totalCount)}</span> de <span className="font-semibold">{totalCount}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-faint ring-1 ring-inset ring-border hover:bg-elevated focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-text ring-1 ring-inset ring-border focus:z-20 focus:outline-offset-0">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-faint ring-1 ring-inset ring-border hover:bg-elevated focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Paciente */}
      <CreatePatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccessClose={() => {
          setIsModalOpen(false)
          setToastMessage('Paciente agregado correctamente.')
          setShowToast(true)
          updateURL({ page: 1 })
        }}
      />

      {/* Modal Eliminar Individual */}
      {singleDeletePatient && (
        <DeletePatientModal
          patientId={singleDeletePatient.id}
          patientName={`${singleDeletePatient.firstName} ${singleDeletePatient.lastName}`}
          onSuccess={() => {
            setSingleDeletePatient(null)
            setToastMessage('Paciente eliminado correctamente.')
            setShowToast(true)
            router.refresh()
          }}
        />
      )}

      {/* Modal Confirmación Eliminación Masiva (Chunk) */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsBulkDeleteModalOpen(false)} />

          <div data-lenis-prevent className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md p-6 border border-border animate-in zoom-in-95">
            <button
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted hover:text-text hover:bg-elevated rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-danger-soft text-danger flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-text">Eliminación Masiva en Lote</h3>
                <p className="text-xs text-muted">Acción permanente e irreversible.</p>
              </div>
            </div>

            {bulkError && (
              <div className="mb-4 p-3 bg-danger-soft text-danger text-sm rounded-xl border border-danger/30">
                {bulkError}
              </div>
            )}

            <p className="text-sm text-muted leading-relaxed mb-6">
              ¿Estás seguro de eliminar permanentemente los <strong className="text-text font-bold">{selectedIds.length} pacientes seleccionados</strong>? Se borrarán sus historiales clínicos, tratamientos, citas, pagos y archivos asociados.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isDeletingBulk}
                className="px-5 py-2.5 text-muted font-medium hover:bg-elevated rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
                className="px-5 py-2.5 bg-danger text-white font-medium hover:bg-danger/90 rounded-xl transition-all shadow-sm text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isDeletingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeletingBulk ? 'Eliminando lote...' : `Eliminar ${selectedIds.length} Pacientes`}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-bg text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 z-50 border border-border">
          <CheckCircle2 className="w-4 h-4 text-brand" />
          {toastMessage}
        </div>
      )}
    </div>
  )
}
