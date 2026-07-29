'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { X, Loader2, Search, Check, ChevronDown } from 'lucide-react'
import { createAppointment } from '@/app/admin/calendario/actions'

interface PatientOption {
  id: string
  name: string
  code: string
}

interface NewAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  patients: PatientOption[]
}

export function NewAppointmentModal({ isOpen, onClose, patients }: NewAppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Combobox states
  const [search, setSearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  
  const formRef = useRef<HTMLFormElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients
    const s = search.toLowerCase()
    return patients.filter(p => 
      p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s)
    )
  }, [search, patients])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await createAppointment(formData)
      if (result.error) {
        setError(result.error)
      } else {
        formRef.current?.reset()
        setSearch('')
        setSelectedPatientId('')
        onClose()
      }
    } catch (err) {
      console.error('Error al agendar cita:', err)
      setError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  // Fecha mínima = hoy (no se pueden agendar días pasados)
  const now = new Date()
  const todayISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div data-lenis-prevent className="relative bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-surface/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-brand font-serif tracking-tight">Agendar Cita</h2>
          <button onClick={onClose} className="p-2 text-muted hover:text-muted hover:bg-elevated rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-danger-soft text-danger text-sm rounded-xl border border-danger">
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-muted mb-1">Paciente *</label>
              
              {/* Hidden input to pass the selected ID to FormData */}
              <input type="hidden" name="patientId" value={selectedPatientId} required />
              
              <div 
                className={`relative w-full bg-surface border rounded-xl flex items-center transition-all ${
                  isDropdownOpen ? 'border-brand ring-2 ring-brand/20' : 'border-border'
                } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => setIsDropdownOpen(true)}
              >
                <Search className="w-4 h-4 text-faint ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setIsDropdownOpen(true)
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-text outline-none"
                />
                <ChevronDown className="w-4 h-4 text-faint mr-4 shrink-0" />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-20 w-full mt-2 bg-surface border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {filteredPatients.length > 0 ? (
                    <div className="p-1">
                      {filteredPatients.map(p => {
                        const isSelected = selectedPatientId === p.id
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(p.id)
                              setSearch(p.name)
                              setIsDropdownOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors ${
                              isSelected ? 'bg-brand-soft text-brand font-semibold' : 'hover:bg-elevated text-text'
                            }`}
                          >
                            <span>{p.name} <span className="text-muted text-xs font-normal">({p.code})</span></span>
                            {isSelected && <Check className="w-4 h-4 text-brand" />}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted">
                      No se encontraron pacientes.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Fecha *</label>
                <input
                  type="date"
                  name="date"
                  required
                  min={todayISO}
                  defaultValue={todayISO}
                  disabled={loading}
                  className="input w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Hora *</label>
                <select name="time" required disabled={loading} defaultValue="" className="input w-full text-sm">
                  <option value="" disabled>Elegir…</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Duración *</label>
                <select name="duration" required disabled={loading} defaultValue="30" className="input w-full text-sm">
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hora</option>
                  <option value="90">1.5 horas</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Tipo de Cita *</label>
              <select name="type" required disabled={loading} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all disabled:bg-elevated disabled:text-muted text-sm">
                <option value="Consulta General">Consulta General</option>
                <option value="Limpieza">Limpieza Profunda</option>
                <option value="Curación">Curación</option>
                <option value="Extracción">Extracción</option>
                <option value="Control Ortodoncia">Control Ortodoncia</option>
                <option value="Implante">Cirugía / Implante</option>
                <option value="Emergencia">Emergencia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Notas (Opcional)</label>
              <textarea 
                name="notes" 
                rows={3} 
                disabled={loading}
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-none disabled:bg-elevated disabled:text-muted text-sm"
                placeholder="Detalles adicionales..."
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-muted font-medium hover:bg-elevated rounded-xl transition-colors disabled:opacity-50 text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Agendando...' : 'Agendar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
