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
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const run = async () => {
    setLoading(true)
    setError(null)
    const res = await generatePatientAccess(patientId)
    setLoading(false)
    if ('error' in res) setError(res.error)
    else setCode(res.code)
  }

  const openModal = () => {
    setOpen(true)
    setCode(null)
    setError(null)
  }

  const copy = () => {
    if (!code) return
    const text = `Hola! Este es tu código de acceso al portal de Clínica Villarroel: ${code}\nIngresá en la web, elegí "Soy paciente" y escribilo ahí para ver tu tratamiento.`
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
            <h3 className="text-lg font-serif text-text mb-1">Código de acceso del paciente</h3>
            <p className="text-sm text-muted mb-5">
              {hasAccess
                ? 'Este paciente ya tiene acceso. Podés generar un código nuevo (el anterior deja de funcionar).'
                : 'Generá un código para que el paciente vea su caso clínico en el portal. Solo necesita este código para entrar.'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-danger-soft border border-danger/30 rounded-xl text-danger text-sm">{error}</div>
            )}

            {code ? (
              <div className="space-y-4">
                <div className="p-5 bg-elevated rounded-xl border border-border text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-faint mb-2">Código de acceso</p>
                  <p className="text-3xl font-mono font-bold text-brand tracking-[0.2em]">{code}</p>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted">
                  <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  Guardá este código ahora: no se vuelve a mostrar. Pasáselo al paciente por WhatsApp — es lo único que necesita para entrar en /login.
                </div>
                <button onClick={copy} className="btn-primary w-full py-2.5">
                  {copied ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar mensaje para WhatsApp</>}
                </button>
              </div>
            ) : (
              <button onClick={run} disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</> : (hasAccess ? 'Generar nuevo código' : 'Generar código de acceso')}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
