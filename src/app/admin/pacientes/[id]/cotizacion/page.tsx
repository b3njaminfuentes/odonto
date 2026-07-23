import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { getAccountStatement } from '@/app/admin/pacientes/payment-actions'
import { getClinicSettings } from '@/app/admin/configuracion/actions'
import { PrintButton } from '@/components/patients/PrintButton'

export const dynamic = 'force-dynamic'

const money = (n: number) => `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default async function CotizacionPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: patient } = await supabase
    .from('Patient')
    .select('id, firstName, lastName, patientCode, dni, phone, email')
    .eq('id', params.id)
    .single()

  if (!patient) return notFound()

  const [statement, clinic] = await Promise.all([
    getAccountStatement(params.id),
    getClinicSettings(),
  ])

  const today = new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen">
      {/* Barra de acciones (no se imprime) */}
      <div className="no-print flex items-center justify-between mb-6">
        <Link href={`/admin/pacientes/${patient.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-text">
          <ArrowLeft className="w-4 h-4" /> Volver al perfil
        </Link>
        <PrintButton />
      </div>

      {/* Documento */}
      <div className="print-doc mx-auto max-w-3xl bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12">
        {/* Encabezado clínica */}
        <div className="flex items-start justify-between border-b border-gray-200 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
              {clinic.clinicName}
            </h1>
            <div className="text-sm text-gray-500 mt-1 space-y-0.5">
              {clinic.address && <p>{clinic.address}</p>}
              {clinic.phone && <p>Tel: {clinic.phone}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Cotización</p>
            <p className="text-sm text-gray-500 mt-1">{today}</p>
            <p className="text-xs text-gray-400 mt-1">N.º {patient.patientCode}</p>
          </div>
        </div>

        {/* Paciente */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Paciente</p>
          <p className="text-lg font-semibold text-gray-900">{patient.firstName} {patient.lastName}</p>
          <div className="text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-1 mt-1">
            {patient.dni && <span>DNI/CI: {patient.dni}</span>}
            {patient.phone && <span>Tel: {patient.phone}</span>}
            {patient.email && <span>{patient.email}</span>}
          </div>
        </div>

        {/* Tabla de tratamientos */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200 text-gray-500">
              <th className="text-left font-semibold py-2">Tratamiento</th>
              <th className="text-right font-semibold py-2">Presupuesto</th>
              <th className="text-right font-semibold py-2">Pagado</th>
              <th className="text-right font-semibold py-2">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {statement.treatments.length === 0 ? (
              <tr><td colSpan={4} className="py-6 text-center text-gray-400">Sin tratamientos presupuestados.</td></tr>
            ) : statement.treatments.map((t) => (
              <tr key={t.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-900 font-medium">
                  {t.name}{t.toothNumber ? <span className="text-gray-400 font-normal"> · Pieza {t.toothNumber}</span> : ''}
                </td>
                <td className="py-3 text-right text-gray-700 tabular-nums">{money(t.cost)}</td>
                <td className="py-3 text-right text-gray-700 tabular-nums">{money(t.paid)}</td>
                <td className="py-3 text-right font-semibold text-gray-900 tabular-nums">{money(t.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Presupuesto total</span><span className="tabular-nums">{money(statement.totalCost)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Pagado</span><span className="tabular-nums">{money(statement.totalPaid)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Saldo pendiente</span><span className="tabular-nums">{money(statement.balance)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-10 border-t border-gray-100 pt-4 leading-relaxed">
          Este documento es una cotización referencial de los tratamientos registrados. Los montos pueden variar según la evolución
          clínica. Consulta con la clínica los métodos de pago disponibles. Moneda: {clinic.currency}.
        </p>
      </div>
    </div>
  )
}
