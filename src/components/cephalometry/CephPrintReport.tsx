'use client'

import React from 'react'
import { Point } from '@/lib/cephalometry/geometry'
import { LandmarkKey } from '@/lib/cephalometry/landmarks'
import { AnalysisDefinition } from '@/lib/cephalometry/analyses/types'
import { classifySeverity } from '@/lib/cephalometry/severity'
import { intlBO, toBO } from '@/lib/datetime'

interface CephPrintReportProps {
  patientId: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  landmarks: Partial<Record<LandmarkKey, Point>>
  analysisDef: AnalysisDefinition
  liveResults: Record<string, number>
  doctorName: string
  signatureUrl: string | null
  signedAt: Date | null
}

export function CephPrintReport({
  patientId,
  imageUrl,
  imageWidth,
  imageHeight,
  landmarks,
  analysisDef,
  liveResults,
  doctorName,
  signatureUrl,
  signedAt
}: CephPrintReportProps) {
  
  // Para el print necesitamos la imagen con sus lineas
  return (
    <div className="hidden print:block print:bg-white print:text-black w-[210mm] min-h-[297mm] mx-auto p-8 font-sans">
      
      {/* Encabezado del reporte */}
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">Reporte Cefalométrico</h1>
          <h2 className="text-lg font-medium text-gray-700">Análisis de {analysisDef.label}</h2>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p><strong>Paciente:</strong> {patientId}</p>
          <p><strong>Fecha:</strong> {signedAt ? intlBO({ dateStyle: 'medium' }).format(toBO(signedAt)) : 'Borrador'}</p>
        </div>
      </div>

      {/* Area de Imagen (SVG replica) */}
      <div className="w-full mb-8 flex justify-center border border-gray-300 rounded-lg overflow-hidden p-2" style={{ maxHeight: '120mm' }}>
        <svg viewBox={`0 0 ${imageWidth} ${imageHeight}`} className="w-full h-full object-contain">
          <image href={imageUrl} width={imageWidth} height={imageHeight} />
          
          <g stroke="rgba(56, 189, 248, 0.8)" strokeWidth={Math.max(imageWidth * 0.003, 3)} strokeDasharray="10,10" fill="none">
            {landmarks.S && landmarks.N && <line x1={landmarks.S.x * imageWidth} y1={landmarks.S.y * imageHeight} x2={landmarks.N.x * imageWidth} y2={landmarks.N.y * imageHeight} />}
            {landmarks.N && landmarks.A && <line x1={landmarks.N.x * imageWidth} y1={landmarks.N.y * imageHeight} x2={landmarks.A.x * imageWidth} y2={landmarks.A.y * imageHeight} />}
            {landmarks.N && landmarks.B && <line x1={landmarks.N.x * imageWidth} y1={landmarks.N.y * imageHeight} x2={landmarks.B.x * imageWidth} y2={landmarks.B.y * imageHeight} />}
            {landmarks.N && landmarks.Pog && <line x1={landmarks.N.x * imageWidth} y1={landmarks.N.y * imageHeight} x2={landmarks.Pog.x * imageWidth} y2={landmarks.Pog.y * imageHeight} stroke="rgba(167, 139, 250, 0.8)" />}
            {landmarks.Po && landmarks.Or && <line x1={landmarks.Po.x * imageWidth} y1={landmarks.Po.y * imageHeight} x2={landmarks.Or.x * imageWidth} y2={landmarks.Or.y * imageHeight} stroke="rgba(250, 204, 21, 0.8)" />}
            {landmarks.Go && landmarks.Me && <line x1={landmarks.Go.x * imageWidth} y1={landmarks.Go.y * imageHeight} x2={landmarks.Me.x * imageWidth} y2={landmarks.Me.y * imageHeight} stroke="rgba(250, 204, 21, 0.8)" />}
            {landmarks.U1 && landmarks.U1a && <line x1={landmarks.U1.x * imageWidth} y1={landmarks.U1.y * imageHeight} x2={landmarks.U1a.x * imageWidth} y2={landmarks.U1a.y * imageHeight} stroke="rgba(248, 113, 113, 0.8)" />}
            {landmarks.L1 && landmarks.L1a && <line x1={landmarks.L1.x * imageWidth} y1={landmarks.L1.y * imageHeight} x2={landmarks.L1a.x * imageWidth} y2={landmarks.L1a.y * imageHeight} stroke="rgba(96, 165, 250, 0.8)" />}
          </g>

          {Object.entries(landmarks).map(([key, point]) => {
            if (!point) return null
            const r = Math.max(imageWidth * 0.006, 6)
            return (
              <g key={key}>
                <circle cx={point.x * imageWidth} cy={point.y * imageHeight} r={r} fill="#14b8a6" stroke="white" strokeWidth={r*0.2} />
                <text x={point.x * imageWidth + r * 1.5} y={point.y * imageHeight + r * 1.5} fill="white" stroke="black" strokeWidth={r*0.1} fontSize={r * 2.5} fontWeight="bold">
                  {key}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Tabla de Medidas */}
      <h3 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">Resultados Matemáticos</h3>
      <table className="w-full text-left text-sm border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border border-gray-300 font-bold w-1/3">Medida</th>
            <th className="p-2 border border-gray-300 font-bold text-center">Norma Clínica</th>
            <th className="p-2 border border-gray-300 font-bold text-center">Valor Paciente</th>
            <th className="p-2 border border-gray-300 font-bold text-center">Diagnóstico</th>
          </tr>
        </thead>
        <tbody>
          {analysisDef.measurements.map(m => {
            const val = liveResults[m.key]
            const isInvalid = val === null || isNaN(val)
            const severity = isInvalid ? 'normal' : classifySeverity(val, m.norm, m.sd)
            
            let diagText = "Normal"
            if (severity === 'leve') diagText = "Desviación Leve"
            if (severity === 'severo') diagText = "Desviación Severa"

            return (
              <tr key={m.key}>
                <td className="p-2 border border-gray-300 font-medium">
                  {m.key} <span className="text-gray-500 text-xs font-normal block">{m.label}</span>
                </td>
                <td className="p-2 border border-gray-300 text-center font-mono">
                  {m.norm}{m.unit === 'deg' ? '°' : ' mm'} (±{m.sd})
                </td>
                <td className={`p-2 border border-gray-300 text-center font-bold font-mono ${severity === 'severo' ? 'text-red-700 bg-red-50' : severity === 'leve' ? 'text-orange-600 bg-orange-50' : ''}`}>
                  {isInvalid ? 'N/A' : val.toFixed(1)}{m.unit === 'deg' ? '°' : ' mm'}
                </td>
                <td className="p-2 border border-gray-300 text-center font-semibold text-xs uppercase tracking-wider">
                  {diagText}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Firmas */}
      <div className="mt-16 flex justify-end">
        <div className="text-center w-64 border-t border-black pt-2">
          {signatureUrl ? (
            <div className="h-16 flex justify-center items-end mb-2">
              <img src={signatureUrl} alt="Firma del Especialista" className="max-h-16 object-contain" />
            </div>
          ) : (
            <div className="h-16 mb-2"></div>
          )}
          <p className="font-bold text-sm">Dr(a). {doctorName}</p>
          <p className="text-xs text-gray-500">Especialista Tratante</p>
          {signedAt && <p className="text-[10px] text-gray-400 mt-1">Firmado el: {intlBO({ dateStyle: 'long', timeStyle: 'short' }).format(toBO(signedAt))}</p>}
        </div>
      </div>
    </div>
  )
}
