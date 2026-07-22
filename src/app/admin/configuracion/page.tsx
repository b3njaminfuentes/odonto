import React from 'react'
import { Settings, User, Building, Bell, Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-serif text-gray-900 tracking-tight">Configuración</h1>
        <p className="text-gray-500">
          Gestiona los ajustes de la clínica y tu perfil.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary font-medium rounded-xl transition-colors text-left">
            <Building className="w-5 h-5" />
            Datos de la Clínica
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-xl transition-colors text-left">
            <User className="w-5 h-5" />
            Perfil Profesional
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-xl transition-colors text-left">
            <Bell className="w-5 h-5" />
            Notificaciones
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-xl transition-colors text-left">
            <Shield className="w-5 h-5" />
            Seguridad
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Datos de la Clínica</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Clínica</label>
                  <input 
                    type="text" 
                    defaultValue="Clínica Odontológica Villarroel"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono de Contacto</label>
                  <input 
                    type="tel" 
                    defaultValue="+591 70000000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <input 
                    type="text" 
                    defaultValue="Av. Principal, Edificio Central, Piso 2, Cons. 201"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Moneda Principal</label>
                  <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                    <option value="BOB">Bolivianos (Bs)</option>
                    <option value="USD">Dólares ($)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button type="button" className="px-6 py-2.5 bg-primary text-white font-medium hover:bg-primary/90 rounded-xl transition-colors shadow-sm">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
