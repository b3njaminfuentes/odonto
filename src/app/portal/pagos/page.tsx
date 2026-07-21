import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { DollarSign, CheckCircle2, MessageCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PagosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Para el MVP simulamos los pagos
  const balances = {
    total: 450, // $450
    paid: 150,
    due: 300
  }

  const wppMessage = encodeURIComponent(`Hola Dra. Villarroel, mi email es ${user.email}. Quisiera hacer un pago por mi tratamiento, ¿me podría compartir los métodos de pago?`)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Resumen de Cuenta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Costo Total (Estimado)</p>
          <p className="text-2xl font-bold text-gray-900">${balances.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Pagado hasta la fecha</p>
          <p className="text-2xl font-bold text-success flex items-center gap-2">
            ${balances.paid}
            <CheckCircle2 className="w-5 h-5" />
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-danger/20 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-danger/5 group-hover:bg-danger/10 transition-colors"></div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-danger/80 mb-1">Saldo Pendiente</p>
            <p className="text-2xl font-bold text-danger">${balances.due}</p>
          </div>
        </div>
      </div>

      {/* Acciones de Pago */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Realizar un pago</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Para realizar el pago de tu saldo pendiente (${balances.due}), comunícate directamente con la clínica por WhatsApp para recibir las instrucciones de transferencia o métodos de pago disponibles.
        </p>

        <a 
          href={`https://wa.me/59112345678?text=${wppMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          <MessageCircle className="w-5 h-5" />
          Contactar por WhatsApp
        </a>
      </div>

    </div>
  )
}
