'use client'

import React, { useMemo, useState, useRef } from 'react'
import { Printer, Download, FileWarning, Share2, Loader2, FileCheck } from 'lucide-react'

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
  specialty?: string | null
}

const isSurgery = (name: string) => /cirug|extracc|quirurg|implante/i.test(name)

export function CotizacionDoc({ patient, treatments, clinic, today }: {
  patient: Patient
  treatments: TreatmentRow[]
  clinic: Clinic
  today: string
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(treatments.map((t) => [t.id, true]))
  )
  const [showPaymentsBreakdown, setShowPaymentsBreakdown] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const printAreaRef = useRef<HTMLDivElement>(null)

  const currencySymbol = clinic.currency === 'USD' ? '$' : 'Bs.'
  const money = (n: number) => `${currencySymbol} ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }))
  const toggleAll = () => {
    const allSelected = treatments.every((t) => selected[t.id])
    setSelected(Object.fromEntries(treatments.map((t) => [t.id, !allSelected])))
  }

  const chosen = treatments.filter((t) => selected[t.id])
  const totals = useMemo(() => ({
    cost: chosen.reduce((s, t) => s + t.cost, 0),
    paid: chosen.reduce((s, t) => s + t.paid, 0),
    balance: chosen.reduce((s, t) => s + t.balance, 0),
  }), [chosen])

  const surgeryTreatments = chosen.filter((t) => isSurgery(t.name))
  const hasSurgery = surgeryTreatments.length > 0

  // Generador de PDF oficial y descarga directa en 1 página A4 limpia
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return
    setIsGeneratingPdf(true)

    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const element = printAreaRef.current

      // Ocultar controles interactivos temporalmente para el PDF
      const noPrintElements = element.querySelectorAll('.no-print-in-pdf')
      noPrintElements.forEach(el => ((el as HTMLElement).style.display = 'none'))

      const canvas = await html2canvas(element, {
        scale: 2.2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
      })

      // Restaurar controles
      noPrintElements.forEach(el => ((el as HTMLElement).style.display = ''))

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (!hasSurgery) {
        // Garantizar que la cotización estándar entre 100% en 1 sola hoja A4
        const renderH = Math.min(imgHeight, 287)
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, renderH, undefined, 'FAST')
      } else {
        let heightLeft = imgHeight
        let position = 0
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
        heightLeft -= pageHeight

        while (heightLeft > 10) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
          heightLeft -= pageHeight
        }
      }

      const fileName = `Cotizacion_${patient.firstName}_${patient.lastName}_${patient.patientCode || 'Doc'}.pdf`
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_.-]/g, '')

      pdf.save(fileName)
    } catch (err) {
      console.error('Error generando PDF:', err)
      window.print()
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Enviar resumen por WhatsApp
  const handleShareWhatsApp = () => {
    const treatmentsSummary = chosen
      .map(t => `• ${t.name}${t.toothNumber ? ` (Pieza ${t.toothNumber})` : ''}: ${money(t.cost)}`)
      .join('\n')

    const paymentLine = showPaymentsBreakdown 
      ? `💰 *Presupuesto Total:* ${money(totals.cost)}\n💳 *Saldo Pendiente:* ${money(totals.balance)}`
      : `💰 *Presupuesto Total:* ${money(totals.cost)}`

    const message = `📋 *Cotización Dental - ${clinic.clinicName || 'Clínica Odontológica Villarroel'}*\n` +
      `👤 Paciente: *${patient.firstName} ${patient.lastName}*\n` +
      `📅 Fecha: ${today}\n\n` +
      `*Tratamientos incluidos:*\n${treatmentsSummary || 'Sin tratamientos seleccionados'}\n\n` +
      `${paymentLine}\n\n` +
      `📍 ${clinic.address || ''}\n` +
      `📞 ${clinic.phone || ''}\n` +
      `✉️ villarroelodontologia@hotmail.com`

    const encoded = encodeURIComponent(message)
    const phoneClean = (patient.phone || '').replace(/\D/g, '')
    const url = phoneClean 
      ? `https://wa.me/${phoneClean.startsWith('591') ? phoneClean : `591${phoneClean}`}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`

    window.open(url, '_blank')
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      {/* ── BARRA DE HERRAMIENTAS (PANTALLA - OCULTA EN IMPRESIÓN) ── */}
      <div className="no-print bg-surface border border-border rounded-2xl p-4 sm:p-5 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand shrink-0" />
            Cotización y Presupuesto
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Seleccioná tratamientos y exportá el documento oficial listo para el paciente.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-muted hover:text-text">
              <input
                type="checkbox"
                checked={showPaymentsBreakdown}
                onChange={(e) => setShowPaymentsBreakdown(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-brand cursor-pointer"
              />
              <span>Incluir desglose de pagos y saldo pendiente</span>
            </label>
          </div>
        </div>

        {/* Botones de acción responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
          <button
            onClick={handleShareWhatsApp}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 active:scale-[0.98] text-emerald-500 font-medium px-4 py-2.5 text-xs transition-all border border-emerald-600/20 shadow-sm"
            title="Enviar cotización vía WhatsApp"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || chosen.length === 0}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-brand-fg font-semibold px-4 py-2.5 text-xs shadow-soft hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 shrink-0" />
                <span>Descargar PDF</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-elevated hover:bg-border active:scale-[0.98] text-text font-medium px-4 py-2.5 text-xs transition-all border border-border shadow-sm"
          >
            <Printer className="w-4 h-4 text-muted shrink-0" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {hasSurgery && (
        <div className="no-print mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex gap-3 text-amber-600 dark:text-amber-400 text-sm">
          <FileWarning className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-xs uppercase tracking-wider mb-0.5">Protocolo Quirúrgico Detectado</p>
            <p className="text-xs opacity-90">
              Se incluye hoja de <strong>consentimiento informado para cirugía</strong> como página 2 para la firma del paciente.
            </p>
          </div>
        </div>
      )}

      {/* ── ÁREA DE DOCUMENTO (IMPRIMIBLE / PDF) ── */}
      <div ref={printAreaRef} id="cotizacion-print-area" className="w-full">
        
        {/* DOCUMENTO: COTIZACIÓN (PÁGINA 1) */}
        <div className="print-doc mx-auto w-full bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 md:p-10 mb-6">
          
          {/* Encabezado Clínica Limpio y Elegante */}
          <div className="flex flex-col sm:flex-row items-start justify-between border-b-2 border-gray-200 pb-4 sm:pb-5 mb-5 gap-3">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif tracking-tight">
                {clinic.clinicName || 'Clínica Odontológica Villarroel'}
              </h1>
              <div className="text-[11px] sm:text-xs text-gray-500 mt-1.5 space-y-0.5">
                {clinic.address && <p>📍 {clinic.address}</p>}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {clinic.phone && <p>📞 {clinic.phone}</p>}
                  <p>✉️ villarroelodontologia@hotmail.com</p>
                </div>
              </div>
            </div>
            
            <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
              <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1">
                Cotización
              </span>
              <div className="text-right">
                <p className="text-xs text-gray-600 font-medium">{today}</p>
                <p className="text-xs font-mono text-gray-400 mt-0.5">#{patient.patientCode}</p>
              </div>
            </div>
          </div>

          {/* Datos del Paciente */}
          <div className="mb-5 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Datos del Paciente</p>
            <p className="text-base font-bold text-gray-900">{patient.firstName} {patient.lastName}</p>
            <div className="text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {patient.dni && <span><strong>DNI/CI:</strong> {patient.dni}</span>}
              {patient.phone && <span><strong>Tel:</strong> {patient.phone}</span>}
              {patient.email && <span><strong>Email:</strong> {patient.email}</span>}
            </div>
          </div>

          {/* Tabla de Tratamientos con soporte responsive */}
          <div className="mb-5 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border-collapse min-w-[320px]">
              <thead>
                <tr className="border-b-2 border-gray-300 text-gray-600 text-[11px] uppercase tracking-wider">
                  <th className="no-print-in-pdf no-print text-left font-semibold py-2 w-7">
                    <input
                      type="checkbox"
                      checked={treatments.length > 0 && chosen.length === treatments.length}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                      title="Seleccionar todos"
                    />
                  </th>
                  <th className="text-left font-semibold py-2">Tratamiento</th>
                  <th className="text-right font-semibold py-2">Presupuesto</th>
                  {showPaymentsBreakdown && (
                    <th className="text-right font-semibold py-2">Saldo</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {treatments.length === 0 ? (
                  <tr>
                    <td colSpan={showPaymentsBreakdown ? 4 : 3} className="py-6 text-center text-gray-400 text-xs">
                      No hay tratamientos registrados para este paciente.
                    </td>
                  </tr>
                ) : treatments.map((t) => (
                  <tr 
                    key={t.id} 
                    className={`transition-colors ${selected[t.id] ? 'bg-white' : 'opacity-40 no-print-in-pdf no-print'}`}
                  >
                    <td className="no-print-in-pdf no-print py-2.5 align-middle">
                      <input 
                        type="checkbox" 
                        checked={!!selected[t.id]} 
                        onChange={() => toggle(t.id)} 
                        className="w-4 h-4 rounded text-emerald-600 cursor-pointer" 
                      />
                    </td>
                    <td className="py-2.5 text-gray-900 font-medium align-middle pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{t.name}</span>
                        {t.toothNumber && (
                          <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded border border-gray-200">
                            Pza {t.toothNumber}
                          </span>
                        )}
                        {isSurgery(t.name) && (
                          <span className="text-[9px] uppercase tracking-wide bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                            Cirugía
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-gray-900 font-medium tabular-nums align-middle whitespace-nowrap">
                      {money(t.cost)}
                    </td>
                    {showPaymentsBreakdown && (
                      <td className="py-2.5 text-right font-bold text-gray-900 tabular-nums align-middle whitespace-nowrap">
                        {money(t.balance)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen Financiero y Totales */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t-2 border-gray-200 pt-4 mb-6">
            <div className="text-[11px] text-gray-500 max-w-xs space-y-0.5">
              <p>💳 <strong>Formas de Pago:</strong> Efectivo, Transferencia bancaria o QR.</p>
            </div>

            <div className="w-full sm:w-64 bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Presupuesto Total:</span>
                <span className="tabular-nums font-semibold">{money(totals.cost)}</span>
              </div>
              {showPaymentsBreakdown && (
                <>
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Total Pagado:</span>
                    <span className="tabular-nums font-semibold">-{money(totals.paid)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-gray-900 border-t border-gray-300 pt-1.5">
                    <span>Saldo Pendiente:</span>
                    <span className="tabular-nums text-emerald-800">{money(totals.balance)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Firmas de Autorización */}
          <div className="avoid-break mt-8 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 sm:gap-8 text-center">
            <div>
              <div className="h-12 flex items-end justify-center">
                <div className="w-32 sm:w-40 border-b border-gray-400" />
              </div>
              <p className="text-xs font-semibold text-gray-800 mt-1.5">
                {clinic.doctorName || 'Dra. Marisol Villarroel'}
              </p>
              <p className="text-[10px] text-gray-500">
                Directora · Clínica Villarroel
              </p>
            </div>

            <div>
              <div className="h-12 flex items-end justify-center">
                <div className="w-32 sm:w-40 border-b border-gray-400" />
              </div>
              <p className="text-xs font-semibold text-gray-800 mt-1.5">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="text-[10px] text-gray-500">Firma Paciente / Tutor</p>
            </div>
          </div>

          {/* Pie de página institucional */}
          <div className="text-[10px] text-gray-400 text-center mt-6 pt-3 border-t border-gray-100">
            {clinic.clinicName || 'Clínica Odontológica Villarroel'} · Documento oficial · {clinic.phone ? `Consultas: ${clinic.phone}` : ''}
          </div>
        </div>

        {/* DOCUMENTO: CONSENTIMIENTO INFORMADO (PÁGINA 2 - SOLO SI HAY CIRUGÍA) */}
        {hasSurgery && (
          <div className="print-doc consent-doc page-break-before mx-auto w-full bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 md:p-10">
            
            <div className="border-b-2 border-gray-200 pb-4 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 font-serif">
                    {clinic.clinicName || 'Clínica Odontológica Villarroel'}
                  </h2>
                  <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-700 mt-0.5">
                    Consentimiento Informado Quirúrgico
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>{today}</p>
                </div>
              </div>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-0.5">
              <p><strong>Paciente:</strong> {patient.firstName} {patient.lastName} &nbsp;|&nbsp; <strong>DNI/CI:</strong> {patient.dni || 'Sin registrar'}</p>
              <p><strong>Profesional Tratante:</strong> {clinic.doctorName || 'Dra. Marisol Villarroel'}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Procedimientos Quirúrgicos Presupuestados:</p>
              <ul className="list-disc list-inside text-xs text-gray-800 space-y-0.5 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                {surgeryTreatments.map((t) => (
                  <li key={t.id} className="font-medium">
                    {t.name}{t.toothNumber ? ` · Pieza dental: ${t.toothNumber}` : ''}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-gray-700 leading-relaxed space-y-2.5 text-justify">
              <p>
                1. <strong>Declaración de Información:</strong> Declaro que el/la profesional tratante me ha explicado en detalle el diagnóstico, la naturaleza del procedimiento, los beneficios esperados y las alternativas de tratamiento disponibles.
              </p>
              <p>
                2. <strong>Riesgos y Complicaciones:</strong> Comprendo que todo acto quirúrgico conlleva riesgos inherentes tales como dolor postoperatorio, inflamación, hemorragia, infección, daño temporal o permanente de estructuras anatómicas adyacentes o reacciones adversas a anestésicos locales.
              </p>
              <p>
                3. <strong>Compromiso Postoperatorio:</strong> Me comprometo a seguir estrictamente las indicaciones postoperatorias, tomar la medicación prescrita y asistir a los controles pautados por la clínica.
              </p>
              <p>
                4. <strong>Autorización:</strong> Estando en pleno uso de mis facultades, otorgo mi consentimiento libre y voluntario para la realización del procedimiento quirúrgico mencionado.
              </p>
            </div>

            {/* Firmas Consentimiento */}
            <div className="avoid-break mt-10 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 sm:gap-8 text-center">
              <div>
                <div className="h-12 flex items-end justify-center">
                  <div className="w-32 sm:w-40 border-b border-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-800 mt-1.5">
                  Firma Paciente / Tutor
                </p>
                <p className="text-[10px] text-gray-500">DNI: {patient.dni || '.....................'}</p>
              </div>

              <div>
                <div className="h-12 flex items-end justify-center">
                  <div className="w-32 sm:w-40 border-b border-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-800 mt-1.5">
                  Firma y Sello Profesional
                </p>
                <p className="text-[10px] text-gray-500">{clinic.doctorName || 'Dra. Marisol Villarroel'}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
