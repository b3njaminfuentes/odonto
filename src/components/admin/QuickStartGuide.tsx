'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, CheckCircle2, Circle, ChevronDown, ChevronUp, X, HelpCircle, ArrowRight, Calendar, UserPlus, Activity, Settings
} from 'lucide-react'
import { HelpCenterModal } from './HelpCenterModal'

export function QuickStartGuide() {
  const [minimized, setMinimized] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [selectedHelpTab, setSelectedHelpTab] = useState('agenda')
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('clinicos_completed_steps')
      if (saved) setCompletedSteps(JSON.parse(saved))
      const savedMin = localStorage.getItem('clinicos_guide_minimized')
      if (savedMin === 'true') setMinimized(true)
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }, [])

  const toggleStep = (id: string) => {
    const updated = completedSteps.includes(id)
      ? completedSteps.filter(s => s !== id)
      : [...completedSteps, id]
    setCompletedSteps(updated)
    try {
      localStorage.setItem('clinicos_completed_steps', JSON.stringify(updated))
    } catch (e) {}
  }

  const toggleMinimize = () => {
    const next = !minimized
    setMinimized(next)
    try {
      localStorage.setItem('clinicos_guide_minimized', next ? 'true' : 'false')
    } catch (e) {}
  }

  const steps = [
    {
      id: 'step_calendar',
      title: 'Agendar una cita de prueba',
      desc: 'Crea un turno en el calendario para familiarizarte con el flujo.',
      href: '/admin/calendario',
      helpTab: 'agenda',
      icon: Calendar
    },
    {
      id: 'step_patient',
      title: 'Registrar un paciente y odontograma',
      desc: 'Añade una ficha de paciente y prueba la marcación en el odontograma FDI.',
      href: '/admin/pacientes',
      helpTab: 'odontograma',
      icon: UserPlus
    },
    {
      id: 'step_ceph',
      title: 'Probar Cefalometría con IA',
      desc: 'Sube una telerradiografía para obtener trazados automáticos.',
      href: '/admin/documentos',
      helpTab: 'cefalometria',
      icon: Activity
    },
    {
      id: 'step_config',
      title: 'Personalizar datos de la clínica',
      desc: 'Configura el logo, dirección, teléfono y doctores secundarios.',
      href: '/admin/configuracion',
      helpTab: 'finanzas',
      icon: Settings
    }
  ]

  const progress = Math.round((completedSteps.length / steps.length) * 100)

  return (
    <>
      <div className="mb-8 rounded-2xl border border-brand/30 bg-surface-raised/60 backdrop-blur-md p-5 shadow-sm transition-all">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-text text-base">Guía de Inicio Rápido</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-soft text-brand font-semibold">
                  {completedSteps.length} de {steps.length} completados ({progress}%)
                </span>
              </div>
              <p className="text-xs text-muted">Configura tu consultorio paso a paso para comenzar a atender.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedHelpTab('agenda')
                setHelpOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-text hover:border-brand/40 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-brand" />
              <span>Ver Guías de Uso</span>
            </button>
            <button
              onClick={toggleMinimize}
              className="p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
              title={minimized ? 'Expandir guía' : 'Minimizar guía'}
            >
              {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-raised rounded-full h-1.5 mt-4 overflow-hidden">
          <div 
            className="bg-brand h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps List (Collapsible) */}
        {!minimized && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-2">
            {steps.map((step) => {
              const isDone = completedSteps.includes(step.id)
              const Icon = step.icon
              return (
                <div 
                  key={step.id} 
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isDone 
                      ? 'bg-brand-soft/20 border-brand/20 opacity-80' 
                      : 'bg-surface border-border hover:border-brand/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg bg-surface-raised text-brand">
                        <Icon className="w-4 h-4" />
                      </div>
                      <button 
                        onClick={() => toggleStep(step.id)}
                        className="text-muted hover:text-brand transition-colors"
                        title={isDone ? 'Marcar como pendiente' : 'Marcar como completado'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-brand" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted" />
                        )}
                      </button>
                    </div>
                    <h4 className={`text-xs font-bold leading-snug ${isDone ? 'line-through text-muted' : 'text-text'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed line-clamp-2">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                    <Link 
                      href={step.href} 
                      className="text-brand font-semibold hover:underline flex items-center gap-1"
                    >
                      Ir ahora <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button 
                      onClick={() => {
                        setSelectedHelpTab(step.helpTab)
                        setHelpOpen(true)
                      }}
                      className="text-muted hover:text-text text-[11px]"
                    >
                      Tutorial
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Permanente de Centro de Ayuda */}
      <HelpCenterModal 
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        initialTab={selectedHelpTab}
      />
    </>
  )
}
