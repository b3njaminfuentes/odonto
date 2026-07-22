'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { PatientCard, Patient } from './PatientCard'
import { Search, Filter, Plus, Loader2 } from 'lucide-react'
import { CreatePatientModal } from './CreatePatientModal'
import { getMorePatients } from '@/app/admin/pacientes/actions'

interface PatientLeaderboardProps {
  initialPatients: Patient[]
}

export function PatientLeaderboard({ initialPatients }: PatientLeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialPatients.length === 20)

  // Actualizar pacientes si cambia prop initialPatients (ej. despues de crear uno nuevo)
  useEffect(() => {
    setPatients(initialPatients)
    setHasMore(initialPatients.length === 20)
  }, [initialPatients])

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // Búsqueda por texto (nombre, dni, email, teléfono)
      const matchesSearch = 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.phone && p.phone.includes(searchTerm)) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filtro por estado
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [patients, searchTerm, statusFilter])

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    try {
      const morePatients = await getMorePatients(patients.length)
      if (morePatients.length > 0) {
        setPatients(prev => [...prev, ...morePatients])
      }
      if (morePatients.length < 20) {
        setHasMore(false)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-sm"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
              <option value="ARCHIVED">Archivados</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <Filter className="w-4 h-4" />
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Paciente</span>
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas (Leaderboard) */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No se encontraron pacientes</h3>
          <p className="mt-1 text-gray-500">Intenta ajustar tu búsqueda o agregar uno nuevo.</p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && filteredPatients.length > 0 && searchTerm === '' && statusFilter === 'ALL' && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cargar más pacientes'}
          </button>
        </div>
      )}

      <CreatePatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}
