import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { DollarSign, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PagosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Buscar el paciente
  const { data: patient } = await supabase
    .from('Patient')
    .select('id, firstName')
    .eq('profileId', user.id)
    .single()

  if (!patient) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ficha no vinculada</h2>
        <p className="text-gray-500">Tu cuenta aún no ha sido vinculada a una ficha clínica.</p>
      </div>
    )
  }

  // Buscar todos los pagos del paciente
  const { data: payments } = await supabase
    .from('Payment')
    .select(`
      id, amount, date, status, method, notes,
      treatment:Treatment(name)
    `)
    .eq('patientId', patient.id)
    .order('date', { ascending: false })

  // Buscar todos los tratamientos para sumar costos (budget o finalCost)
  const { data: treatments } = await supabase
    .from('Treatment')
    .select('id, budget, finalCost')
    .eq('patientId', patient.id)

  let totalCost = 0
  if (treatments) {
    treatments.forEach(t => {
      // Priorizar finalCost, si no budget
      const cost = Number(t.finalCost) || Number(t.budget) || 0
      totalCost += cost
    })
  }

  let totalPaid = 0
  if (payments) {
    payments.forEach(p => {
      if (p.status === 'COMPLETADO') {
        totalPaid += Number(p.amount)
      }
    })
  }

  const balances = {
    total: totalCost,
    paid: totalPaid,
    due: Math.max(0, totalCost - totalPaid)
  }

  const wppMessage = encodeURIComponent(`Hola Dra. Villarroel, soy ${patient.firstName}. Quisiera hacer un pago por mi tratamiento, ¿me podría compartir los métodos de pago?`)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Resumen de Cuenta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500 mb-1">Costo Total (Estimado)</p>
          <p className="text-2xl font-black text-slate-900">Bs {balances.total.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500 mb-1">Pagado hasta la fecha</p>
          <p className="text-2xl font-black text-teal-600 flex items-center gap-2">
            Bs {balances.paid.toFixed(2)}
            <CheckCircle2 className="w-5 h-5 text-teal-500" />
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-50/50 group-hover:bg-red-50 transition-colors"></div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-red-700/80 mb-1">Saldo Pendiente</p>
            <p className="text-2xl font-black text-red-600">Bs {balances.due.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Historial de Pagos */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-teal-600" />
            Historial de Pagos
          </h3>

          {(!payments || payments.length === 0) ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center py-12 text-slate-400">
              <DollarSign className="w-10 h-10 mb-2 text-slate-300" />
              <p className="text-sm">Aún no hay pagos registrados.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(new Date(p.date))}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${p.status === 'CANCELADO' ? 'text-slate-400 line-through' : 'text-teal-700'}`}>
                          Bs {Number(p.amount).toFixed(2)}
                        </span>
                        {p.status === 'CANCELADO' && (
                          <span className="block text-[10px] text-red-500 font-bold uppercase mt-1">Anulado</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900 font-medium">{p.method || 'Efectivo'}</p>
                        {p.treatment?.name && <p className="text-xs text-slate-500 mt-1">Tratamiento: {p.treatment.name}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Acciones de Pago */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center sticky top-24">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100">
              <DollarSign className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Realizar un abono</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Para realizar el pago de tu saldo pendiente o hacer un abono a tu cuenta, comunícate directamente con la clínica por WhatsApp para recibir las instrucciones y QR bancario.
            </p>

            <a 
              href={`https://wa.me/59112345678?text=${wppMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium rounded-xl transition-colors shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              Enviar WhatsApp
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
