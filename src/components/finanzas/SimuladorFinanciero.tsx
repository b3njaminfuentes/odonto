'use client'

import React, { useState } from 'react'
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Layers, 
  Sparkles, 
  ArrowRight,
  PieChart,
  Percent
} from 'lucide-react'

export function SimuladorFinanciero() {
  // Parámetros de la clínica
  const [sillones, setSillones] = useState<number>(2)
  const [horasPorDia, setHorasPorDia] = useState<number>(8)
  const [diasPorMes, setDiasPorMes] = useState<number>(24)
  const [duracionTurnoMin, setDuracionTurnoMin] = useState<number>(45)
  const [tasaOcupacion, setTasaOcupacion] = useState<number>(70) // 70% ocupado
  const [ticketPromedio, setTicketPromedio] = useState<number>(60) // $60 USD
  const [comisionDoctores, setComisionDoctores] = useState<number>(45) // 45% a especialistas
  const [costosFijos, setCostosFijos] = useState<number>(1200) // $1200 USD fijos

  // Cálculos de capacidad
  const turnosPorSillonDia = Math.floor((horasPorDia * 60) / duracionTurnoMin)
  const capacidadMaximaTurnosMes = sillones * turnosPorSillonDia * diasPorMes
  const turnosAtendidosMes = Math.round((capacidadMaximaTurnosMes * tasaOcupacion) / 100)
  const turnosDisponiblesMes = capacidadMaximaTurnosMes - turnosAtendidosMes

  // Cálculos financieros
  const facturacionBruta = turnosAtendidosMes * ticketPromedio
  const pagoDoctores = Math.round((facturacionBruta * comisionDoctores) / 100)
  const margenBrutoClinica = facturacionBruta - pagoDoctores
  const beneficioNetoMensual = margenBrutoClinica - costosFijos
  const beneficioNetoAnual = beneficioNetoMensual * 12

  // Potencial con 100% de ocupación
  const facturacionPotencialMax = capacidadMaximaTurnosMes * ticketPromedio
  const beneficioPotencialMax = facturacionPotencialMax - Math.round((facturacionPotencialMax * comisionDoctores) / 100) - costosFijos

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900/40 via-slate-900 to-teal-950/40 p-6 rounded-2xl border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Herramienta Estratégica
          </div>
          <h2 className="text-xl font-bold text-white">Simulador de Rentabilidad & Capacidad Operativa</h2>
          <p className="text-sm text-slate-300">
            Modela el impacto financiero de añadir sillones, ajustar comisiones o mejorar la tasa de ocupación de tu clínica.
          </p>
        </div>

        <div className="text-right bg-slate-950/60 px-5 py-3 rounded-xl border border-white/10">
          <div className="text-xs text-slate-400 font-medium">Margen Neto Estimado</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${beneficioNetoMensual.toLocaleString()} <span className="text-xs text-slate-400">USD/mes</span>
          </div>
        </div>
      </div>

      {/* Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL DE CONTROL (INPUTS) */}
        <div className="lg:col-span-6 bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-2 font-bold text-text border-b border-border pb-3">
            <Calculator className="w-5 h-5 text-brand" />
            Variables Operativas de la Clínica
          </div>

          {/* Sillones */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold text-text">
              <span>Sillones Dentales Activos:</span>
              <span className="text-brand font-mono font-bold">{sillones} {sillones === 1 ? 'sillón' : 'sillones'}</span>
            </div>
            <input 
              type="range" 
              min={1} 
              max={12} 
              value={sillones} 
              onChange={(e) => setSillones(Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
          </div>

          {/* Tasa de Ocupación */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold text-text">
              <span>Tasa de Ocupación Actual:</span>
              <span className="text-emerald-500 font-mono font-bold">{tasaOcupacion}%</span>
            </div>
            <input 
              type="range" 
              min={20} 
              max={100} 
              step={5}
              value={tasaOcupacion} 
              onChange={(e) => setTasaOcupacion(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>20% (Baja demanda)</span>
              <span>70% (Promedio)</span>
              <span>100% (Agenda llena)</span>
            </div>
          </div>

          {/* Ticket Promedio */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold text-text">
              <span>Ticket Promedio por Paciente:</span>
              <span className="text-text font-mono font-bold">${ticketPromedio} USD</span>
            </div>
            <input 
              type="range" 
              min={20} 
              max={300} 
              step={5}
              value={ticketPromedio} 
              onChange={(e) => setTicketPromedio(Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
          </div>

          {/* Comisión a Odontólogos */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold text-text">
              <span>Comisión Promedio a Especialistas:</span>
              <span className="text-amber-500 font-mono font-bold">{comisionDoctores}%</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={70} 
              step={5}
              value={comisionDoctores} 
              onChange={(e) => setComisionDoctores(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Costos Fijos */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold text-text">
              <span>Costos Fijos Operativos (Alquiler, Servicios, Software):</span>
              <span className="text-text font-mono font-bold">${costosFijos} USD/mes</span>
            </div>
            <input 
              type="range" 
              min={300} 
              max={5000} 
              step={100}
              value={costosFijos} 
              onChange={(e) => setCostosFijos(Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
          </div>
        </div>

        {/* PANEL DE RESULTADOS Y PROYECCIÓN */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Métricas Principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface p-5 rounded-2xl border border-border">
              <div className="text-xs text-muted font-medium mb-1">Capacidad Mensual</div>
              <div className="text-2xl font-black text-text font-mono">{capacidadMaximaTurnosMes} <span className="text-xs font-normal text-muted">citas</span></div>
              <div className="text-xs text-emerald-500 mt-2 font-medium">
                {turnosAtendidosMes} atendidas · {turnosDisponiblesMes} libres
              </div>
            </div>

            <div className="bg-surface p-5 rounded-2xl border border-border">
              <div className="text-xs text-muted font-medium mb-1">Facturación Bruta Mes</div>
              <div className="text-2xl font-black text-brand font-mono">${facturacionBruta.toLocaleString()} <span className="text-xs font-normal text-muted">USD</span></div>
              <div className="text-xs text-muted mt-2">
                Con {tasaOcupacion}% de ocupación
              </div>
            </div>
          </div>

          {/* Desglose en Cascada */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-bold text-text text-sm flex items-center justify-between">
              <span>Distribución de Ingresos</span>
              <PieChart className="w-4 h-4 text-muted" />
            </h3>

            <div className="space-y-3">
              {/* Facturación */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-text font-medium">Ingresos Totales (100%)</span>
                <span className="font-mono font-bold text-text">${facturacionBruta.toLocaleString()} USD</span>
              </div>

              {/* Pago Doctores */}
              <div className="flex justify-between items-center text-sm text-amber-500">
                <span>- Honorarios Médicos ({comisionDoctores}%)</span>
                <span className="font-mono font-bold">-${pagoDoctores.toLocaleString()} USD</span>
              </div>

              {/* Costos Fijos */}
              <div className="flex justify-between items-center text-sm text-rose-500">
                <span>- Gastos Fijos de la Clínica</span>
                <span className="font-mono font-bold">-${costosFijos.toLocaleString()} USD</span>
              </div>

              {/* Línea divisoria */}
              <div className="border-t border-border pt-3 flex justify-between items-center text-base font-bold">
                <span className="text-emerald-500">Ganancia Neta para la Clínica:</span>
                <span className="font-mono text-emerald-500 text-xl">${beneficioNetoMensual.toLocaleString()} USD/mes</span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div style={{ width: `${comisionDoctores}%` }} className="bg-amber-500" title="Honorarios Médicos" />
              <div style={{ width: `${Math.min(30, Math.round((costosFijos / (facturacionBruta || 1)) * 100))}%` }} className="bg-rose-500" title="Costos Fijos" />
              <div className="flex-1 bg-emerald-500" title="Margen Neto" />
            </div>
            <div className="flex justify-between text-[11px] text-muted">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Doctores</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Costos Fijos</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Margen Neto</span>
            </div>
          </div>

          {/* Oportunidad de Crecimiento */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              🚀 Potencial al 100% de Ocupación
            </div>
            <p className="text-xs text-text mb-3">
              Si llenas los <strong>{turnosDisponiblesMes} turnos libres</strong> restantes con la recepcionista de WhatsApp y recordatorios automáticos:
            </p>
            <div className="flex justify-between items-center text-sm font-bold text-text">
              <span>Beneficio Neto Máximo Posible:</span>
              <span className="text-emerald-500 font-mono text-lg">${beneficioPotencialMax.toLocaleString()} USD/mes</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
