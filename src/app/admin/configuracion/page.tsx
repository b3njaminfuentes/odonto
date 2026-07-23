import React from 'react'
import { User, Building, Bell, Shield } from 'lucide-react'
import { getClinicSettings } from './actions'
import { SettingsForm } from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const settings = await getClinicSettings()
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-serif text-text tracking-tight">Configuración</h1>
        <p className="text-muted">
          Gestiona los ajustes de la clínica y tu perfil.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 bg-brand/5 text-brand font-medium rounded-xl transition-colors text-left">
            <Building className="w-5 h-5" />
            Datos de la Clínica
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-muted hover:bg-elevated font-medium rounded-xl transition-colors text-left">
            <User className="w-5 h-5" />
            Perfil Profesional
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-muted hover:bg-elevated font-medium rounded-xl transition-colors text-left">
            <Bell className="w-5 h-5" />
            Notificaciones
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-muted hover:bg-elevated font-medium rounded-xl transition-colors text-left">
            <Shield className="w-5 h-5" />
            Seguridad
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-xl font-bold text-text mb-6 border-b border-border pb-4">Datos de la Clínica</h2>

            <SettingsForm initial={settings} />
          </div>
        </div>

      </div>
    </div>
  )
}
