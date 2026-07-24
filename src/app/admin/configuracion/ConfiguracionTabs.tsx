'use client'

import React, { useState } from 'react'
import { User, Building, Bell, Shield, Loader2, Check } from 'lucide-react'
import { SettingsForm } from './SettingsForm'
import { saveProfessionalProfile, saveNotificationPreference, type ClinicSettings } from './actions'
import { changeAdminPassword } from './security-actions'

const TABS = [
  { key: 'clinica', label: 'Datos de la Clínica', icon: Building },
  { key: 'perfil', label: 'Perfil Profesional', icon: User },
  { key: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { key: 'seguridad', label: 'Seguridad', icon: Shield },
] as const

type TabKey = typeof TABS[number]['key']

export function ConfiguracionTabs({ initial }: { initial: ClinicSettings }) {
  const [tab, setTab] = useState<TabKey>('clinica')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="flex flex-col gap-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors text-left ${
              tab === key ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-elevated'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>

      <div className="lg:col-span-3 space-y-6">
        {tab === 'clinica' && (
          <Panel title="Datos de la Clínica">
            <SettingsForm initial={initial} />
          </Panel>
        )}
        {tab === 'perfil' && <ProfessionalPanel initial={initial} />}
        {tab === 'notificaciones' && <NotificationsPanel initial={initial.pendingAppointmentsAlert} />}
        {tab === 'seguridad' && <SecurityPanel />}
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
      <h2 className="text-xl font-bold text-text mb-6 border-b border-border pb-4">{title}</h2>
      {children}
    </div>
  )
}

function ProfessionalPanel({ initial }: { initial: ClinicSettings }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true); setError(null); setSaved(false)
    const res = await saveProfessionalProfile(new FormData(e.currentTarget))
    setSaving(false)
    if ('error' in res) setError(res.error)
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  }

  return (
    <Panel title="Perfil Profesional">
      <form onSubmit={onSubmit} className="space-y-6">
        {error && <div className="p-3 bg-danger-soft border border-danger/30 rounded-xl text-danger text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Nombre a mostrar</label>
            <input name="doctorName" type="text" defaultValue={initial.doctorName} className="input" placeholder="Dra. Villarroel" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Especialidad</label>
            <input name="specialty" type="text" defaultValue={initial.specialty ?? ''} className="input" placeholder="Odontología estética e implantes" />
          </div>
        </div>
        <p className="text-xs text-muted">Este nombre aparece en el panel admin y como firma del asistente Muelita.</p>
        <div className="pt-4 flex justify-end items-center gap-3 border-t border-border">
          {saved && <span className="text-sm text-success flex items-center gap-1"><Check className="w-4 h-4" /> Guardado</span>}
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</> : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Panel>
  )
}

function NotificationsPanel({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial)
  const [saving, setSaving] = useState(false)

  const toggle = async () => {
    const next = !enabled
    setEnabled(next)
    setSaving(true)
    await saveNotificationPreference(next)
    setSaving(false)
  }

  return (
    <Panel title="Notificaciones">
      <div className="flex items-start justify-between gap-6 p-5 border border-border rounded-xl">
        <div>
          <p className="font-semibold text-text mb-1">Avisos de citas por confirmar</p>
          <p className="text-sm text-muted leading-relaxed">
            Cuando está activo, el Dashboard te muestra las solicitudes de cita hechas desde la web que aún
            no confirmaste, para que no se te pasen.
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={saving}
          className={`shrink-0 w-12 h-7 rounded-full transition-colors relative ${enabled ? 'bg-brand' : 'bg-border'}`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </Panel>
  )
}

function SecurityPanel() {
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null); setSaved(false)
    if (pw !== confirm) { setError('Las contraseñas no coinciden.'); return }
    setSaving(true)
    const res = await changeAdminPassword(pw)
    setSaving(false)
    if ('error' in res) setError(res.error)
    else { setSaved(true); setPw(''); setConfirm(''); setTimeout(() => setSaved(false), 2500) }
  }

  return (
    <Panel title="Seguridad">
      <form onSubmit={onSubmit} className="space-y-6 max-w-md">
        {error && <div className="p-3 bg-danger-soft border border-danger/30 rounded-xl text-danger text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Nueva contraseña</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="input" placeholder="Mínimo 8 caracteres" minLength={8} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Confirmar contraseña</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" required />
        </div>
        <div className="pt-4 flex justify-end items-center gap-3 border-t border-border">
          {saved && <span className="text-sm text-success flex items-center gap-1"><Check className="w-4 h-4" /> Contraseña actualizada</span>}
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</> : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </Panel>
  )
}
