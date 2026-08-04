'use client'

import React, { useState } from 'react'
import { Plus, ArrowUpRight, ArrowDownRight, XCircle, Users, UserMinus, Receipt, Calculator } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NewPaymentModal } from '@/components/finanzas/NewPaymentModal'
import { DoctorPaymentModal } from '@/components/finanzas/DoctorPaymentModal'
import { SimuladorFinanciero } from '@/components/finanzas/SimuladorFinanciero'
import { toBO } from '@/lib/datetime'
import { updatePaymentStatus } from '@/app/admin/pacientes/payment-actions'

interface FinanzasWrapperProps {
  patients: { id: string, name: string, code: string }[]
  payments: {
    id: string
    amount: number
    date: string
    method: string
    concept: string
    status: string
    patientId: string
    patient: {
      firstName: string
      lastName: string
    }
  }[]
  doctors: { id: string, firstName: string, lastName: string }[]
  doctorPayments: {
    id: string
    amount: number
    date: string
    description: string
    signatureUrl: string
    doctorId: string
    doctor: {
      firstName: string
      lastName: string
      color: string
    }
  }[]
}

export default function FinanzasInteractivityWrapper({ patients, payments: initialPayments, doctors, doctorPayments }: FinanzasWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false)
  const [payments, setPayments] = useState(initialPayments)
  const [activeTab, setActiveTab] = useState<'ingresos' | 'egresos' | 'simulador'>('ingresos')

  const cancelPayment = async (id: string, patientId: string) => {
    if (!confirm('¿Anular este pago? Dejará de contar en los ingresos.')) return
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'CANCELADO' } : p)))
    await updatePaymentStatus(id, 'CANCELADO', patientId)
  }

  return (
    <>
      <div className="flex items-center gap-4 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('ingresos')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'ingresos' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Ingresos de Pacientes
          </div>
        </button>
        <button
          onClick={() => setActiveTab('egresos')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'egresos' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <UserMinus className="w-4 h-4" />
            Pagos a Doctores
          </div>
        </button>
        <button
          onClick={() => setActiveTab('simulador')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'simulador' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Simulador de Rentabilidad
          </div>
        </button>
      </div>

      {activeTab === 'simulador' ? (
        <SimuladorFinanciero />
      ) : activeTab === 'ingresos' ? (
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-text">Últimos Ingresos</h2>
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
                  <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-elevated/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted capitalize">
                      {format(toBO(p.date), "d MMM, yyyy", { locale: es })}
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
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${p.status === 'CANCELADO' ? 'text-faint line-through' : 'text-success'}`}>
                      <span className="inline-flex items-center gap-1">
                        + Bs {Number(p.amount).toFixed(2)}
                        {p.status !== 'CANCELADO' && <ArrowUpRight className="w-4 h-4 opacity-50" />}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {p.status !== 'CANCELADO' && (
                        <button
                          onClick={() => cancelPayment(p.id, p.patientId)}
                          className="text-danger hover:text-danger transition-colors"
                          title="Anular Pago"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-text">Pagos a Doctores</h2>
            <button 
              onClick={() => setIsDoctorModalOpen(true)}
              className="flex items-center gap-2 bg-warning hover:bg-warning/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Registrar Pago a Doctor
            </button>
          </div>

          {doctorPayments.length === 0 ? (
            <div className="p-12 text-center text-muted">
              Aún no hay pagos registrados a doctores.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-elevated/50 border-b border-border">
                    <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider text-right">Monto</th>
                    <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wider text-center">Firma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {doctorPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-elevated/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted capitalize">
                        {format(toBO(p.date), "d MMM, yyyy - HH:mm", { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${p.doctor.color}`} />
                          <span className="text-sm font-bold text-text">Dra. {p.doctor.firstName} {p.doctor.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {p.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-warning">
                        <span className="inline-flex items-center gap-1">
                          - Bs {Number(p.amount).toFixed(2)}
                          <ArrowDownRight className="w-4 h-4 opacity-50" />
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {p.signatureUrl ? (
                          <div className="inline-flex flex-col items-center">
                            <img src={p.signatureUrl} alt="Firma" className="h-10 object-contain mix-blend-multiply dark:invert" />
                            <span className="text-[10px] text-muted flex items-center gap-1"><Receipt className="w-3 h-3"/> Firmado</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">Sin firma</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <NewPaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
      />

      <DoctorPaymentModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        doctors={doctors}
        onSuccess={() => window.location.reload()}
      />
    </>
  )
}
