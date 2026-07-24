import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { DollarSign, MessageCircle, AlertCircle } from 'lucide-react'
import { getAccountStatement } from '@/app/admin/pacientes/payment-actions'
import { AccountStatement } from '@/components/patients/AccountStatement'
import { intlBO, toBO } from '@/lib/datetime'

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
      <div className="bg-surface rounded-2xl p-8 shadow-sm border border-border text-center">
        <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Ficha no vinculada</h2>
        <p className="text-muted">Tu cuenta aún no ha sido vinculada a una ficha clínica.</p>
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

  // Estado de cuenta (mismo cálculo que ve la doctora)
  const statement = await getAccountStatement(patient.id)

  const wppMessage = encodeURIComponent(`Hola Dra. Villarroel, soy ${patient.firstName}. Quisiera hacer un pago por mi tratamiento, ¿me podría compartir los métodos de pago?`)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div>
        <h2 className="text-xl font-serif font-bold text-text mb-1">Mi cuenta</h2>
        <p className="text-muted text-sm mb-5">El detalle de tus tratamientos, lo que llevas pagado y tu saldo pendiente.</p>
        <AccountStatement data={statement} forPatient />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Historial de Pagos */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand" />
            Historial de Pagos
          </h3>

          {(!payments || payments.length === 0) ? (
            <div className="bg-surface rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-12 text-muted">
              <DollarSign className="w-10 h-10 mb-2 text-muted" />
              <p className="text-sm">Aún no hay pagos registrados.</p>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-elevated text-muted font-medium">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-elevated/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-text">
                        {intlBO({ dateStyle: 'medium' }).format(toBO(p.date))}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${p.status === 'CANCELADO' ? 'text-muted line-through' : 'text-brand'}`}>
                          Bs {Number(p.amount).toFixed(2)}
                        </span>
                        {p.status === 'CANCELADO' && (
                          <span className="block text-[10px] text-danger font-bold uppercase mt-1">Anulado</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-text font-medium">{p.method || 'Efectivo'}</p>
                        {p.treatment?.name && <p className="text-xs text-muted mt-1">Tratamiento: {p.treatment.name}</p>}
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
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm text-center sticky top-24">
            <div className="w-14 h-14 bg-brand-soft text-brand rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-soft">
              <DollarSign className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-text mb-2">Realizar un abono</h2>
            <p className="text-muted text-sm mb-6 leading-relaxed">
              Para realizar el pago de tu saldo pendiente o hacer un abono a tu cuenta, comunícate directamente con la clínica por WhatsApp para recibir las instrucciones y QR bancario.
            </p>

            <a 
              href={`https://wa.me/59172212402?text=${wppMessage}`}
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
