import React from 'react'
import type { AccountStatement as Statement } from '@/app/admin/pacientes/payment-actions'

const money = (n: number) => `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function AccountStatement({ data, forPatient = false }: { data: Statement; forPatient?: boolean }) {
  if (data.treatments.length === 0 && data.totalPaid === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
        {forPatient ? 'Aún no hay presupuestos ni pagos registrados en tu cuenta.' : 'Sin tratamientos ni pagos para calcular el estado de cuenta.'}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Totales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">{forPatient ? 'Costo de tus tratamientos' : 'Presupuesto total'}</p>
          <p className="text-2xl font-bold text-text tabular-nums">{money(data.totalCost)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Pagado</p>
          <p className="text-2xl font-bold text-brand tabular-nums">{money(data.totalPaid)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Saldo pendiente</p>
          <p className={`text-2xl font-bold tabular-nums ${data.balance > 0 ? 'text-accent' : 'text-success'}`}>{money(data.balance)}</p>
        </div>
      </div>

      {/* Detalle por tratamiento */}
      {data.treatments.length > 0 && (
        <div className="card divide-y divide-border overflow-hidden">
          {data.treatments.map((t) => (
            <div key={t.id} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-text">{t.name}{t.toothNumber ? <span className="text-muted font-normal"> · Pieza {t.toothNumber}</span> : ''}</p>
                  <p className="text-xs text-muted mt-0.5 capitalize">{t.status.toLowerCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted">Saldo</p>
                  <p className={`font-bold tabular-nums ${t.balance > 0 ? 'text-accent' : 'text-success'}`}>{money(t.balance)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-elevated overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${t.percent}%` }} />
                </div>
                <span className="text-xs font-medium text-muted tabular-nums w-28 text-right">
                  {money(t.paid)} / {money(t.cost)}
                </span>
                <span className="text-xs font-bold text-brand w-10 text-right">{t.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.generalPaid > 0 && (
        <p className="text-xs text-muted px-1">
          Incluye {money(data.generalPaid)} en pagos generales no asignados a un tratamiento específico.
        </p>
      )}
    </div>
  )
}
