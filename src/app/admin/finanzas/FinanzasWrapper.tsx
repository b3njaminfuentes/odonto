'use client'

import React, { useState } from 'react'
import { Plus, ArrowUpRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NewPaymentModal } from '@/components/finanzas/NewPaymentModal'

interface FinanzasWrapperProps {
  patients: { id: string, name: string, code: string }[]
  payments: {
    id: string
    amount: number
    date: string
    method: string
    concept: string
    status: string
    patient: {
      firstName: string
      lastName: string
    }
  }[]
}

export default function FinanzasInteractivityWrapper({ patients, payments }: FinanzasWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-text">Transacciones Recientes</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-success hover:bg-success/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Registrar Ingreso
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center text-muted">
            Aún no hay transacciones registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-elevated/50 border-b border-border">
                  <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider">Concepto</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider">Método</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-elevated/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted capitalize">
                      {format(new Date(p.date), "d MMM, yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-text">{p.patient.firstName} {p.patient.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                      {p.concept}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-elevated text-text">
                        {p.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'COMPLETADO' ? 'bg-success-soft text-success' :
                        p.status === 'CANCELADO' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right flex justify-end items-center gap-1 ${p.status === 'CANCELADO' ? 'text-faint line-through' : 'text-success'}`}>
                      + Bs {Number(p.amount).toFixed(2)}
                      {p.status !== 'CANCELADO' && <ArrowUpRight className="w-4 h-4 opacity-50" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewPaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
      />
    </>
  )
}
