'use client'

import { useState } from 'react'
import LoginForm from './login-form'
import PatientLoginForm from './patient-login-form'

export default function LoginTabs() {
  const [tab, setTab] = useState<'patient' | 'admin'>('patient')

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-elevated rounded-xl p-1">
        <button
          onClick={() => setTab('patient')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'patient' ? 'bg-surface text-brand shadow-sm' : 'text-muted hover:text-text'}`}
        >
          Soy paciente
        </button>
        <button
          onClick={() => setTab('admin')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'admin' ? 'bg-surface text-brand shadow-sm' : 'text-muted hover:text-text'}`}
        >
          Soy la doctora
        </button>
      </div>
      {tab === 'patient' ? <PatientLoginForm /> : <LoginForm />}
    </div>
  )
}
