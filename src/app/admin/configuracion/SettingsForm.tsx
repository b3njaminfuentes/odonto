'use client'

import React, { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { saveClinicSettings, ClinicSettings } from './actions'

export function SettingsForm({ initial }: { initial: ClinicSettings }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    const res = await saveClinicSettings(new FormData(e.currentTarget))
    setSaving(false)
    if ('error' in res) setError(res.error)
    else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <div className="p-3 bg-danger-soft border border-danger/30 rounded-xl text-danger text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Nombre de la Clínica</label>
          <input name="clinicName" type="text" defaultValue={initial.clinicName} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Teléfono de Contacto</label>
          <input name="phone" type="tel" defaultValue={initial.phone ?? ''} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-muted mb-2">Dirección</label>
          <input name="address" type="text" defaultValue={initial.address ?? ''} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-muted mb-2">Moneda Principal</label>
          <select name="currency" defaultValue={initial.currency} className="input">
            <option value="BOB">Bolivianos (Bs)</option>
            <option value="USD">Dólares ($)</option>
          </select>
        </div>
      </div>
      <div className="pt-6 flex justify-end items-center gap-3">
        {saved && <span className="text-sm text-success flex items-center gap-1"><Check className="w-4 h-4" /> Guardado</span>}
        <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</> : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}
