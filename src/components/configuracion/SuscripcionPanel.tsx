'use client'

import React, { useState } from 'react'
import { 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  DollarSign, 
  Clock, 
  RefreshCw,
  ExternalLink
} from 'lucide-react'

const CHECKOUT_URLS: Record<string, string> = {
  starter: 'https://clinicos.lemonsqueezy.com/checkout/buy/STARTER_ID',
  profesional: 'https://clinicos.lemonsqueezy.com/checkout/buy/PRO_ID', 
  enterprise: 'https://clinicos.lemonsqueezy.com/checkout/buy/ENTERPRISE_ID',
}
// TODO: Replace with real Lemon Squeezy product URLs after creating your store

export function SuscripcionPanel() {
  const [isSimulatingCheckout, setIsSimulatingCheckout] = useState(false)
  const [paymentDone, setPaymentDone] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'profesional' | 'enterprise'>('profesional')
  const [loading, setLoading] = useState(false)
  const [realMode, setRealMode] = useState(false)

  const handleCheckoutClick = () => {
    if (realMode) {
      window.location.href = CHECKOUT_URLS[selectedPlan]
    } else {
      setIsSimulatingCheckout(true)
    }
  }

  const handleSimulatePayment = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setPaymentDone(true)
    }, 1500)
  }

  return (
    <div className="space-y-8">
      {/* Resumen del Plan Actual */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-border text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Estado de Cuenta ClinicOS
          </div>
          <h3 className="text-xl font-bold">
            Plan {selectedPlan === 'starter' ? 'Starter ($49/mes)' : selectedPlan === 'profesional' ? 'Profesional ($99/mes)' : 'Enterprise'}
          </h3>
          <p className="text-sm text-slate-300">
            {paymentDone 
              ? 'Suscripción Activa y Pagada · Próxima renovación en 30 días.' 
              : 'Período de prueba gratuito activo (7 días restantes).'}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          {paymentDone ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Suscripción Activa
            </span>
          ) : (
            <>
              <button
                onClick={handleCheckoutClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
              >
                <CreditCard className="w-4 h-4" /> 
                {realMode ? 'Ir al Checkout Real' : 'Activar Pago (Simulador)'}
              </button>
              
              <div className="flex items-center gap-2 text-xs">
                <label className="text-slate-300">Simulador</label>
                <button
                  type="button"
                  className={`w-10 h-5 rounded-full p-1 transition-colors ${realMode ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  onClick={() => setRealMode(!realMode)}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${realMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <label className="text-emerald-400 font-bold">Checkout Real</label>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm flex gap-3">
        <Sparkles className="w-5 h-5 flex-shrink-0" />
        <p>
          <strong>Nota:</strong> Para activar pagos reales, configure las variables <code className="bg-blue-500/20 px-1 py-0.5 rounded text-xs">LEMONSQUEEZY_API_KEY</code> y <code className="bg-blue-500/20 px-1 py-0.5 rounded text-xs">LEMONSQUEEZY_WEBHOOK_SECRET</code> en .env.local
        </p>
      </div>

      {/* Explicación de la Ruta del Dinero */}
      <div className="bg-surface p-6 rounded-2xl border border-border space-y-4">
        <h4 className="font-bold text-text text-base flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand" />
          Ruta de Cobro y Liquidación Internacional (¿A qué cuenta llega?)
        </h4>
        <p className="text-sm text-muted">
          Este es el flujo transparente y automatizado con el que cobras a cualquier clínica del mundo:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-elevated border border-border space-y-2">
            <div className="text-xs font-bold text-brand uppercase">1. La Clínica Paga</div>
            <div className="text-sm font-bold text-text">Pasarela Lemon Squeezy / Stripe</div>
            <p className="text-xs text-muted">
              El cliente paga con su tarjeta de crédito/débito internacional en USD. Lemon Squeezy calcula y retiene los impuestos locales automáticamente.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-elevated border border-border space-y-2">
            <div className="text-xs font-bold text-emerald-500 uppercase">2. Depósito en USD</div>
            <div className="text-sm font-bold text-text">Cuenta Payoneer (Banco Virtual)</div>
            <p className="text-xs text-muted">
              Lemon Squeezy transfiere los fondos limpios a tu cuenta de Payoneer en dólares (sin intermediarios bancarios complejos).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-elevated border border-border space-y-2">
            <div className="text-xs font-bold text-teal-500 uppercase">3. Retiro a tu Mano</div>
            <div className="text-sm font-bold text-text">Tarjeta Mastercard / Banco</div>
            <p className="text-xs text-muted">
              Gastas con la tarjeta Payoneer en cualquier país, retiras por cajero, o transfieres a tu cuenta bancaria / crypto P2P.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL SIMULADOR DE CHECKOUT */}
      {isSimulatingCheckout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h4 className="font-bold text-base">Checkout Seguro ClinicOS</h4>
                  <p className="text-xs text-slate-400">Procesado por Lemon Squeezy</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSimulatingCheckout(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {paymentDone ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <h3 className="text-lg font-bold">¡Pago Simulado Exitoso!</h3>
                <p className="text-xs text-slate-300">
                  El webhook ha verificado la transacción: <br />
                  <span className="font-mono text-emerald-400">TX_99USD_SUCCESS_TRIAL_CONVERTED</span>
                </p>
                <div className="p-3 bg-slate-950 rounded-xl text-left text-xs font-mono text-slate-300 space-y-1">
                  <div>Monto: $99.00 USD</div>
                  <div>Destino: Payoneer Global Bank (USD)</div>
                  <div>Impuestos: Retenidos por MoR</div>
                </div>
                <button
                  onClick={() => setIsSimulatingCheckout(false)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm"
                >
                  Entendido y Cerrar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm">ClinicOS Plan Profesional</div>
                    <div className="text-xs text-slate-400">Mensual · Renovación automática</div>
                  </div>
                  <div className="text-lg font-black text-emerald-400 font-mono">$99.00 USD</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Número de Tarjeta (Modo Prueba)</label>
                    <input 
                      type="text" 
                      defaultValue="4242 •••• •••• 4242" 
                      disabled 
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Vencimiento</label>
                      <input 
                        type="text" 
                        defaultValue="12 / 28" 
                        disabled 
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">CVC</label>
                      <input 
                        type="text" 
                        defaultValue="888" 
                        disabled 
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSimulatePayment}
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Confirmar y Simular Cobro ($99 USD)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
