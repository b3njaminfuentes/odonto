import React from 'react'
import { getClinicSettings } from './actions'
import { ConfiguracionTabs } from './ConfiguracionTabs'

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

      <ConfiguracionTabs initial={settings} />
    </div>
  )
}
