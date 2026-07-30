'use client'

import React, { useState, useRef } from 'react'
import { Plus, X, Loader2, ShieldCheck, Users } from 'lucide-react'
import { createTeamMember } from '@/app/admin/equipo/actions'

export function NewTeamMemberModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      await createTeamMember(formData)
      setIsOpen(false)
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" />
        Registrar Especialista
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-bg/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-lg mx-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-lg font-serif font-bold text-text">Nuevo Miembro del Equipo</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 text-muted hover:text-muted hover:bg-elevated rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-danger-soft border border-danger/20 text-danger text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">Nombre *</label>
                  <input type="text" name="firstName" required className="input w-full px-4 py-2.5" placeholder="Ej: Patricia" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">Apellido *</label>
                  <input type="text" name="lastName" required className="input w-full px-4 py-2.5" placeholder="Ej: Villarroel" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Especialidad</label>
                <input type="text" name="specialty" className="input w-full px-4 py-2.5" placeholder="Ej: Endodoncia, Odontopediatría..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Email (para iniciar sesión) *</label>
                <input type="email" name="email" required className="input w-full px-4 py-2.5" placeholder="doctor@clinica.com" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Contraseña Temporal *</label>
                <input type="text" name="password" required className="input w-full px-4 py-2.5 font-mono text-sm" placeholder="Mínimo 6 caracteres" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted">Rol en el sistema *</label>
                <select name="role" className="input w-full px-4 py-2.5 bg-surface" defaultValue="doctor">
                  <option value="doctor">Especialista (Sin acceso a finanzas)</option>
                  <option value="admin">Administrador (Acceso total)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 text-muted hover:bg-elevated font-medium rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
