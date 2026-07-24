'use client'

import React, { useState } from 'react'
import { X, Loader2, Save, Pencil } from 'lucide-react'
import { updatePatient } from '@/app/admin/pacientes/actions'

export interface EditablePatient {
  id: string
  firstName: string
  lastName: string
  dob: string
  dni: string | null
  email: string | null
  phone: string | null
  status: string
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  referralSource: string | null
}

export function EditPatientModal({ patient }: { patient: EditablePatient }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await updatePatient(patient.id, new FormData(e.currentTarget))
      if (res.error) { setError(res.error); return }
      setOpen(false)
    } catch (err) {
      console.error(err)
      setError('Error de conexión con el servidor. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-surface border border-border text-muted font-medium rounded-xl hover:border-brand hover:text-brand transition-colors flex items-center gap-2 shadow-sm text-sm"
      >
        <Pencil className="w-4 h-4" />
        Editar
      </button>

      {open && (
        <div className="fixed inset-0 bg-bg/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={!loading ? () => setOpen(false) : undefined} />
          <div data-lenis-prevent className="relative bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 mx-4">
            <div className="sticky top-0 bg-surface/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-text">Editar Paciente</h2>
              <button onClick={() => setOpen(false)} disabled={loading} className="p-2 text-faint hover:bg-elevated hover:text-muted rounded-xl transition-colors disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && <div className="p-4 bg-danger-soft border border-danger/30 rounded-xl text-danger text-sm font-medium">{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Nombres *</label>
                  <input name="firstName" required disabled={loading} defaultValue={patient.firstName} className="input w-full px-4 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Apellidos *</label>
                  <input name="lastName" required disabled={loading} defaultValue={patient.lastName} className="input w-full px-4 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Fecha de Nacimiento *</label>
                  <input type="date" name="dob" required disabled={loading} max={new Date().toISOString().slice(0, 10)} defaultValue={patient.dob?.slice(0, 10)} className="input w-full px-4 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">DNI o Cédula</label>
                  <input name="dni" disabled={loading} defaultValue={patient.dni ?? ''} className="input w-full px-4 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Teléfono</label>
                  <input type="tel" name="phone" disabled={loading} defaultValue={patient.phone ?? ''} placeholder="Ej: +591 700 00000" className="input w-full px-4 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
                  <input type="email" name="email" disabled={loading} defaultValue={patient.email ?? ''} className="input w-full px-4 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Estado</label>
                  <select name="status" disabled={loading} defaultValue={patient.status} className="input w-full px-4 py-2.5">
                    <option value="ACTIVE">Activo</option>
                    <option value="IN_TREATMENT">En tratamiento</option>
                    <option value="CONTROL">Control</option>
                    <option value="INACTIVE">Inactivo</option>
                    <option value="ARCHIVED">Archivado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">¿Cómo nos conoció?</label>
                  <select name="referralSource" disabled={loading} defaultValue={patient.referralSource ?? ''} className="input w-full px-4 py-2.5">
                    <option value="">Sin especificar</option>
                    <option value="Recomendado">Recomendado (conocido)</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Google Maps">Google Maps</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <p className="text-sm font-bold text-text uppercase tracking-wider mb-4">Contacto de emergencia</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1.5">Nombre Contacto</label>
                    <input name="emergencyContactName" disabled={loading} defaultValue={patient.emergencyContactName ?? ''} className="input w-full px-4 py-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1.5">Teléfono Contacto</label>
                    <input type="tel" name="emergencyContactPhone" disabled={loading} defaultValue={patient.emergencyContactPhone ?? ''} className="input w-full px-4 py-2.5" />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-surface pt-4 pb-2 flex justify-end gap-3 border-t border-border">
                <button type="button" onClick={() => setOpen(false)} disabled={loading} className="px-5 py-2.5 text-sm font-medium text-muted hover:text-text hover:bg-elevated rounded-xl transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar cambios</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
