'use client'

import React, { useState } from 'react'
import { 
  X, HelpCircle, Calendar, Users, Activity, Banknote, Smartphone, ChevronRight, CheckCircle2, Sparkles, BookOpen
} from 'lucide-react'

interface HelpCenterModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: string
}

export function HelpCenterModal({ isOpen, onClose, initialTab = 'agenda' }: HelpCenterModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab)

  if (!isOpen) return null

  const modules = [
    {
      id: 'agenda',
      name: 'Agenda & Turnos',
      icon: Calendar,
      badge: 'Básico',
      title: 'Cómo Gestionar la Agenda Inteligente',
      description: 'ClinicOS organiza los turnos de todos los doctores y sucursales en una sola vista sincronizada.',
      steps: [
        {
          title: '1. Agendar una nueva cita',
          detail: 'Haz clic en el botón "+ Nueva Cita" o selecciona directamente cualquier celda horaria vacía en el calendario. Elige al paciente o regístralo al instante.'
        },
        {
          title: '2. Estados de Cita',
          detail: 'Las citas pasan por estados claros: PENDIENTE (amarillo), CONFIRMADA (verde), EN CONSULTA (azul), COMPLETADA (gris) o CANCELADA (rojo).'
        },
        {
          title: '3. Recordatorios por WhatsApp',
          detail: 'El sistema permite enviar la confirmación y recordatorio automático con 1 clic directo al WhatsApp del paciente.'
        },
        {
          title: '4. Bloqueos de Horario',
          detail: 'Para vacaciones, cursos o descansos, puedes bloquear franjas horarias completas para que nadie agende en ese periodo.'
        }
      ]
    },
    {
      id: 'odontograma',
      name: 'Ficha & Odontograma',
      icon: Users,
      badge: 'Clínico',
      title: 'Expediente Digital y Odontograma FDI',
      description: 'Registra el estado dental de cada paciente de forma visual e interactiva con notación internacional FDI.',
      steps: [
        {
          title: '1. Búsqueda y Creación de Pacientes',
          detail: 'Accede a la sección "Pacientes" para buscar por nombre, apellido o CI. Puedes ver su historial médico, alergias y evolución.'
        },
        {
          title: '2. Marcación en el Odontograma',
          detail: 'Haz clic en cualquier pieza dental (11 al 48 para adultos, 51 al 85 para niños) y selecciona el estado: Sano, Caries, Obturado, Ausente, Endodoncia o Corona.'
        },
        {
          title: '3. Presupuestos y Tratamientos',
          detail: 'Vincula los tratamientos diagnósticos a un plan de pagos para entregar presupuestos claros y transparentes al paciente.'
        }
      ]
    },
    {
      id: 'cefalometria',
      name: 'Cefalometría con IA',
      icon: Activity,
      badge: 'Inteligencia Artificial',
      title: 'Trazados Cefalométricos Automatizados',
      description: 'Analiza telerradiografías laterales de cráneo en segundos mediante visión computacional.',
      steps: [
        {
          title: '1. Subir la Radiografía Lateral',
          detail: 'En el perfil del paciente o módulo de Documentos, sube la imagen digital en alta resolución (JPG o PNG).'
        },
        {
          title: '2. Detección de Puntos Anatómicos',
          detail: 'El motor de IA detecta automáticamente los puntos de referencia: Sella (S), Nasion (N), Punto A, Punto B, Pogonion (Pog), Gnation (Gn), etc.'
        },
        {
          title: '3. Diagnóstico Esquelético y Dental',
          detail: 'Calcula instantáneamente los ángulos clave (SNA, SNB, ANB, Wits, Eje Facial de Ricketts, Plano Mandibular) y compara con la norma clínica.'
        },
        {
          title: '4. Exportación del Informe',
          detail: 'Genera un informe visual listo para imprimir o enviar al paciente y ortodoncista.'
        }
      ]
    },
    {
      id: 'finanzas',
      name: 'Finanzas & Doctores',
      icon: Banknote,
      badge: 'Administración',
      title: 'Control de Caja y Liquidación a Odontólogos',
      description: 'Monitorea ingresos reales, saldos pendientes y comisiones del equipo médico.',
      steps: [
        {
          title: '1. Registro de Cobros',
          detail: 'Registra pagos completos o parciales vinculados a tratamientos. Soporta Efectivo, Tarjeta, Transferencia o QR.'
        },
        {
          title: '2. Liquidación Automática de Comisiones',
          detail: 'Configura el porcentaje acordado con cada doctor (ej. 40% o 50%). El sistema calcula exactamente lo que corresponde pagarles por tratamiento realizado.'
        },
        {
          title: '3. Reportes de Caja Diaria',
          detail: 'Obtén el balance diario o mensual con un clic para controlar los ingresos netos de tu consultorio.'
        }
      ]
    },
    {
      id: 'portal',
      name: 'Portal del Paciente',
      icon: Smartphone,
      badge: 'Atención',
      title: 'Acceso Exclusivo para Pacientes',
      description: 'Brinda una experiencia moderna donde tus pacientes pueden consultar sus citas desde su teléfono.',
      steps: [
        {
          title: '1. Link del Portal',
          detail: 'Cada clínica tiene su portal web optimizado para móviles (ej: clinicos.app/portal).'
        },
        {
          title: '2. Ingreso Seguro',
          detail: 'El paciente ingresa con su número de documento o teléfono para ver sus próximas citas agendadas y recomendaciones post-operatorias.'
        }
      ]
    }
  ]

  const currentModule = modules.find(m => m.id === activeTab) || modules[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-raised/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">Centro de Ayuda & Guías de Uso</h2>
              <p className="text-xs text-muted">Aprende a dominar todos los módulos de tu sistema ClinicOS</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted hover:text-text hover:bg-surface-raised rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar + Detail */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Module Selector Sidebar */}
          <div className="w-full md:w-64 border-r border-border bg-surface-raised/30 p-3 space-y-1 overflow-y-auto">
            {modules.map((m) => {
              const Icon = m.icon
              const isActive = m.id === activeTab
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium ${
                    isActive 
                      ? 'bg-brand text-white shadow-sm' 
                      : 'text-text hover:bg-surface-raised text-muted hover:text-text'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-brand'}`} />
                  <span className="flex-1 truncate">{m.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-80" />}
                </button>
              )
            })}
          </div>

          {/* Module Details Pane */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-surface">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-soft text-brand">
                {currentModule.badge}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-text mb-2 font-serif">{currentModule.title}</h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">{currentModule.description}</p>

            <div className="space-y-4">
              {currentModule.steps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-surface-raised/40 hover:border-brand/30 transition-all">
                  <h4 className="font-semibold text-text text-sm flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed pl-6">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-brand-soft/40 border border-brand/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-brand" />
                <span className="text-xs text-text font-medium">¿Necesitas soporte prioritario o personalización?</span>
              </div>
              <a 
                href="https://wa.me/59179998877?text=Hola,%20necesito%20ayuda%20con%20ClinicOS" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-semibold text-brand hover:underline"
              >
                Hablar por WhatsApp →
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
