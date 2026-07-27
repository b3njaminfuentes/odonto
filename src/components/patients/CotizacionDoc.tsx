'use client'

import React, { useMemo, useState } from 'react'
import { Printer, FileWarning } from 'lucide-react'

const money = (n: number) => `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

interface TreatmentRow {
  id: string
  name: string
  toothNumber: string | null
  cost: number
  paid: number
  balance: number
}

interface Patient {
  id: string
  firstName: string
  lastName: string
  patientCode: string
  dni: string | null
  phone: string | null
  email: string | null
}

interface Clinic {
  clinicName: string
  address: string | null
  phone: string | null
  currency: string
  doctorName: string | null
}

const isSurgery = (name: string) => /cirug/i.test(name)

export function CotizacionDoc({ patient, treatments, clinic, today }: {
  patient: Patient
  treatments: TreatmentRow[]
  clinic: Clinic
  today: string
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(treatments.map((t) => [t.id, true]))
  )

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }))

  const chosen = treatments.filter((t) => selected[t.id])
  const totals = useMemo(() => ({
    cost: chosen.reduce((s, t) => s + t.cost, 0),
    paid: chosen.reduce((s, t) => s + t.paid, 0),
    balance: chosen.reduce((s, t) => s + t.balance, 0),
  }), [chosen])

  const surgeryTreatments = chosen.filter((t) => isSurgery(t.name))
  const hasSurgery = surgeryTreatments.length > 0

  return (
    <>
      {/* Barra de acciones (no se imprime) */}
      <div className="no-print flex items-center justify-between mb-6">
        <p className="text-sm text-muted">Elegí qué tratamientos entran en la cotización que vas a imprimir.</p>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand text-brand-fg font-medium px-5 py-2.5 text-sm shadow-soft hover:bg-brand-hover transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {hasSurgery && (
        <div className="no-print mb-6 p-4 bg-warning-soft border border-warning/30 rounded-xl flex gap-3 text-warning text-sm">
          <FileWarning className="w-5 h-5 flex-shrink-0" />
          <p>Incluiste un tratamiento de cirugía. Se agregó automáticamente una hoja de <strong>consentimiento informado</strong> lista para imprimir junto a la cotización.</p>
        </div>
      )}

      {/* Documento: Cotización */}
      <div className="print-doc mx-auto max-w-3xl bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12">
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

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Paciente</p>
          <p className="text-lg font-semibold text-gray-900">{patient.firstName} {patient.lastName}</p>
          <div className="text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-1 mt-1">
            {patient.dni && <span>DNI/CI: {patient.dni}</span>}
            {patient.phone && <span>Tel: {patient.phone}</span>}
            {patient.email && <span>{patient.email}</span>}
          </div>
        </div>

        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="border-b-2 border-gray-200 text-gray-500">
              <th className="no-print text-left font-semibold py-2 w-8"></th>
              <th className="text-left font-semibold py-2">Tratamiento</th>
              <th className="text-right font-semibold py-2">Presupuesto</th>
              <th className="text-right font-semibold py-2">Pagado</th>
              <th className="text-right font-semibold py-2">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {treatments.length === 0 ? (
              <tr><td colSpan={5} className="py-6 text-center text-gray-400">Sin tratamientos presupuestados.</td></tr>
            ) : treatments.map((t) => (
              <tr key={t.id} className={`border-b border-gray-100 ${selected[t.id] ? '' : 'no-print'}`}>
                <td className="no-print py-3 align-top">
                  <input type="checkbox" checked={!!selected[t.id]} onChange={() => toggle(t.id)} className="w-4 h-4" />
                </td>
                <td className="py-3 text-gray-900 font-medium">
                  {t.name}{t.toothNumber ? <span className="text-gray-400 font-normal"> · Pieza {t.toothNumber}</span> : ''}
                  {isSurgery(t.name) && <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-600 font-bold">Cirugía</span>}
                </td>
                <td className="py-3 text-right text-gray-700 tabular-nums">{money(t.cost)}</td>
                <td className="py-3 text-right text-gray-700 tabular-nums">{money(t.paid)}</td>
                <td className="py-3 text-right font-semibold text-gray-900 tabular-nums">{money(t.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-6">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Presupuesto total</span><span className="tabular-nums">{money(totals.cost)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Pagado</span><span className="tabular-nums">{money(totals.paid)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Saldo pendiente</span><span className="tabular-nums">{money(totals.balance)}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-10 border-t border-gray-100 pt-4 flex flex-col gap-1">
          <p className="font-semibold text-gray-700 text-sm">Dra. Marisol Villarroel</p>
          <p>Teléfono: +591 72212402</p>
          <p>Email: dra.villarroel@gmail.com</p>
        </div>

        {/* Firma */}
        <div className="mt-16 flex justify-between gap-8">
          <div className="flex-1 text-center">
            <div className="border-t border-gray-400 pt-2 mx-4">
              <p className="text-sm text-gray-600">Firma del paciente</p>
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="border-t border-gray-400 pt-2 mx-4">
              <p className="text-sm text-gray-600">Fecha</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documento: Consentimiento informado (solo si hay cirugía seleccionada) */}
      {hasSurgery && (
        <div className="print-doc consent-doc mx-auto max-w-3xl bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12 mt-8">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
              {clinic.clinicName}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">Consentimiento Informado para Cirugía</p>
            <p className="text-sm text-gray-500 mt-1">{today}</p>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Paciente</p>
            <p className="text-lg font-semibold text-gray-900">{patient.firstName} {patient.lastName}</p>
            <div className="text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-1 mt-1">
              {patient.dni && <span>DNI/CI: {patient.dni}</span>}
              {patient.phone && <span>Tel: {patient.phone}</span>}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Procedimiento(s) a realizar</p>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
              {surgeryTreatments.map((t) => (
                <li key={t.id}>{t.name}{t.toothNumber ? ` · Pieza ${t.toothNumber}` : ''}</li>
              ))}
            </ul>
          </div>

          <div className="text-sm text-gray-700 leading-relaxed space-y-3">
            <p>
              Declaro que {clinic.doctorName || 'la profesional tratante'} me ha explicado, en lenguaje claro y comprensible, la naturaleza,
              el propósito y los pasos del procedimiento quirúrgico detallado arriba, así como las alternativas de tratamiento disponibles.
            </p>
            <p>
              Entiendo que, como en todo procedimiento quirúrgico, existen riesgos inherentes que incluyen, entre otros: sangrado, infección,
              inflamación, dolor postoperatorio, reacciones alérgicas a la anestesia o medicación, y en casos excepcionales, complicaciones
              que requieran tratamiento adicional. He tenido la oportunidad de hacer preguntas y todas fueron respondidas a mi satisfacción.
            </p>
            <p>
              Me comprometo a seguir las indicaciones postoperatorias entregadas por la clínica. Entiendo que los resultados no están
              garantizados y pueden variar según la respuesta individual de mi organismo.
            </p>
            <p>
              Habiendo comprendido lo anterior, autorizo voluntariamente a {clinic.doctorName || 'la profesional tratante'} y su equipo a
              realizar el/los procedimiento(s) descrito(s).
            </p>
          </div>

          <div className="mt-16 flex justify-between gap-8">
            <div className="flex-1 text-center">
              <div className="border-t border-gray-400 pt-2 mx-4">
                <p className="text-sm text-gray-600">Firma del paciente (o tutor legal)</p>
              </div>
            </div>
            <div className="flex-1 text-center">
              <div className="border-t border-gray-400 pt-2 mx-4">
                <p className="text-sm text-gray-600">Firma de {clinic.doctorName || 'la profesional tratante'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
