'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { unifiedLogin } from './unified-login-actions'

export default function UnifiedLoginForm() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await unifiedLogin(email, code)
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
        <label className="block text-sm font-medium text-muted mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input w-full px-4 py-2.5"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-1">Código de acceso</label>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="input w-full px-4 py-2.5"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="p-3 text-sm text-danger bg-danger-soft rounded-lg border border-danger/30">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-brand hover:bg-brand/90 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-brand/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando...</> : 'Ingresar'}
      </button>
    </form>
  )
}
