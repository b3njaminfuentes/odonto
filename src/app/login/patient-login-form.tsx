'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Loader2 } from 'lucide-react'
import { patientLoginWithCode } from './patient-actions'

export default function PatientLoginForm() {
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await patientLoginWithCode(code, email)
      if ('error' in res) {
        setError(res.error)
        return
      }
      router.refresh()
    } catch {
      setError('Ocurrió un error inesperado. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted mb-1">Código de acceso</label>
        <div className="relative">
          <KeyRound className="w-4 h-4 text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            autoCapitalize="characters"
            className="input w-full pl-10 pr-4 py-2.5 tracking-widest font-mono uppercase"
            placeholder="Ej: X7K2P9QF"
          />
        </div>
        <p className="text-xs text-faint mt-1.5">Es el código que te compartió la Dra. Villarroel por WhatsApp.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-1">Tu email (opcional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input w-full px-4 py-2.5"
          placeholder="tu@email.com"
        />
        <p className="text-xs text-faint mt-1.5">Lo guardamos para avisarte novedades de tu tratamiento. No es obligatorio.</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-danger bg-danger-soft rounded-lg border border-danger/30">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="w-full py-2.5 px-4 bg-brand hover:bg-brand/90 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-brand/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</> : 'Ingresar con mi código'}
      </button>
    </form>
  )
}
