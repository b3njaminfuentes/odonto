'use client'

import React, { useState } from 'react'
import { KeyRound, Loader2, Copy, Check, X, ShieldCheck } from 'lucide-react'
import { generatePatientAccess } from '@/app/admin/pacientes/access-actions'

interface Props {
  patientId: string
  hasAccess: boolean
}

export function PatientAccessButton({ patientId, hasAccess }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creds, setCreds] = useState<{ email: string; password: string; regenerated: boolean } | null>(null)
  const [copied, setCopied] = useState(false)

  const run = async () => {
    setLoading(true)
    setError(null)
    const res = await generatePatientAccess(patientId)
    setLoading(false)
    if ('error' in res) setError(res.error)
    else setCreds({ email: res.email, password: res.password, regenerated: res.regenerated })
  }

  const openModal = () => {
    setOpen(true)
    setCreds(null)
    setError(null)
  }

  const copy = () => {
    if (!creds) return
    const text = `Acceso a tu portal — Clínica Villarroel\nUsuario: ${creds.email}\nContraseña: ${creds.password}\nIngresa en: /login`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 bg-surface border border-border text-muted font-medium rounded-xl hover:border-brand hover:text-brand transition-colors flex items-center gap-2 shadow-sm text-sm"
      >
        <KeyRound className="w-4 h-4" />
        {hasAccess ? 'Acceso del paciente' : 'Generar acceso'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => !loading && setOpen(false)} />
          <div className="relative bg-surface rounded-2xl shadow-lift border border-border w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 text-faint hover:text-text hover:bg-elevated rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand grid place-items-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-text mb-1">Acceso al portal del paciente</h3>
            <p className="text-sm text-muted mb-5">
              {hasAccess
                ? 'Este paciente ya tiene acceso. Puedes restablecer su contraseña y entregarle las nuevas credenciales.'
                : 'Genera un usuario y contraseña para que el paciente vea su caso clínico en el portal.'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-danger-soft border border-danger/30 rounded-xl text-danger text-sm">{error}</div>
            )}

            {creds ? (
              <div className="space-y-4">
                <div className="p-4 bg-elevated rounded-xl border border-border space-y-3">
                  <Field label="Usuario" value={creds.email} />
                  <Field label="Contraseña" value={creds.password} mono />
                </div>
                <div className="flex items-start gap-2 text-xs text-muted">
                  <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  Guarda estas credenciales ahora: la contraseña no se vuelve a mostrar. Compártelas solo con el paciente.
                </div>
                <button onClick={copy} className="btn-primary w-full py-2.5">
                  {copied ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar credenciales</>}
                </button>
              </div>
            ) : (
              <button onClick={run} disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</> : (hasAccess ? 'Restablecer contraseña' : 'Generar acceso')}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-faint mb-1">{label}</p>
      <p className={`text-sm text-text break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}
