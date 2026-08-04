'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClinicOnboarding } from './actions'
import { 
  Building2, 
  User, 
  Lock, 
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    clinicName: searchParams?.get('clinica') || '',
    doctorName: searchParams?.get('nombre') || '',
    specialty: 'Odontología General',
    phone: searchParams?.get('whatsapp') || '',
    email: searchParams?.get('email') || '',
    password: '',
    confirmPassword: '',
    plan: searchParams?.get('plan') || 'Profesional'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const validateStep1 = () => {
    if (!formData.clinicName.trim()) {
      setError('Por favor ingrese el nombre de la clínica.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.doctorName.trim()) {
      setError('Por favor ingrese el nombre del doctor/a.')
      return false
    }
    if (!formData.phone.trim()) {
      setError('Por favor ingrese un teléfono o WhatsApp de contacto.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    setError(null)

    const form = new FormData()
    form.append('clinicName', formData.clinicName)
    form.append('doctorName', formData.doctorName)
    form.append('specialty', formData.specialty)
    form.append('phone', formData.phone)
    form.append('email', formData.email)
    form.append('password', formData.password)
    form.append('plan', formData.plan)

    const res = await createClinicOnboarding(form)

    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      // Éxito: Redirigir directamente al panel médico
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">
          <Sparkles className="w-4 h-4" /> Asistente de Activación
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-serif">ClinicOS</h1>
        <p className="text-sm text-slate-400 mt-1">Configura tu consultorio digital y comienza tu prueba de 7 días.</p>
      </div>

      {/* Stepper Indicator */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 z-10">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
          <div className={`p-2 rounded-lg border transition-all ${step === 1 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : step > 1 ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
            1. Clínica
          </div>
          <div className={`p-2 rounded-lg border transition-all ${step === 2 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : step > 2 ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
            2. Doctor/a
          </div>
          <div className={`p-2 rounded-lg border transition-all ${step === 3 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
            3. Acceso
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 z-10">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
            {/* PASO 1: DATOS DE LA CLÍNICA */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-2">
                  <Building2 className="w-5 h-5" /> Datos de tu Clínica
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                    Nombre de la Clínica o Consultorio *
                  </label>
                  <input
                    type="text"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleChange}
                    placeholder="Ej. Clínica Dental San Lucas"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                    Plan Seleccionado
                  </label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Profesional">Plan Profesional ($99/mes · 7 días gratis)</option>
                    <option value="Starter">Plan Starter ($49/mes · 7 días gratis)</option>
                    <option value="Enterprise">Plan Elite / Clinic (A medida)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) setStep(2)
                    }}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 text-sm"
                  >
                    Siguiente: Datos del Profesional <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: DATOS DEL DOCTOR */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-2">
                  <User className="w-5 h-5" /> Profesional Responsable
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                    Nombre Completo del Doctor/a *
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    placeholder="Ej. Dr. Carlos Villarroel"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                    Especialidad Principal
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    placeholder="Ej. Ortodoncia y Estética Dental"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                    WhatsApp / Teléfono de la Clínica *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ej. +591 79998877"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition text-sm flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) setStep(3)
                    }}
                    className="w-2/3 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 text-sm"
                  >
                    Siguiente: Credenciales <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: CREDENCIALES DE ACCESO */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-2">
                  <Lock className="w-5 h-5" /> Credenciales de Acceso
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                    Correo Electrónico (Tu usuario de ingreso) *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="doctor@tuclinica.com"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                    Contraseña Maestra *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite la contraseña"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Se te enviará una copia de tus accesos a tu correo electrónico.</span>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Activar y Entrar al Sistema
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando asistente...</div>}>
      <OnboardingContent />
    </Suspense>
  )
}
