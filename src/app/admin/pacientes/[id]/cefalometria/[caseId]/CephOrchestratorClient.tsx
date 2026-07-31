'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Lock, ArrowLeft, Loader2, Printer } from 'lucide-react'
import { CephImageUploader } from '@/components/cephalometry/CephImageUploader'
import { CephImageCanvas } from '@/components/cephalometry/CephImageCanvas'
import { CalibrationTool } from '@/components/cephalometry/CalibrationTool'
import { LandmarkChecklist } from '@/components/cephalometry/LandmarkChecklist'
import { MeasurementPanel } from '@/components/cephalometry/MeasurementPanel'
import { saveCephalometricCase, signAndCompleteCase } from '@/lib/cephalometry/actions'
import { AnalysisEngine } from '@/lib/cephalometry/analyses'
import { Point } from '@/lib/cephalometry/geometry'
import { LandmarkKey } from '@/lib/cephalometry/landmarks'
import { SignaturePad } from '@/components/ui/SignaturePad'
import { CephPrintReport } from '@/components/cephalometry/CephPrintReport'

interface CephOrchestratorClientProps {
  patientId: string
  initialCase: any | null
  currentUserId: string
}

export function CephOrchestratorClient({ patientId, initialCase, currentUserId }: CephOrchestratorClientProps) {
  const router = useRouter()

  // State del caso
  const [caseId, setCaseId] = useState<string | null>(initialCase?.id || null)
  const [imageUrl, setImageUrl] = useState<string | null>(initialCase?.imageUrl || null)
  const [imageWidth, setImageWidth] = useState<number>(initialCase?.imageWidth || 0)
  const [imageHeight, setImageHeight] = useState<number>(initialCase?.imageHeight || 0)
  const [pixelsPerMm, setPixelsPerMm] = useState<number | null>(initialCase?.pixelsPerMm || null)
  const [landmarks, setLandmarks] = useState<Partial<Record<LandmarkKey, Point>>>(
    (initialCase?.landmarks as Partial<Record<LandmarkKey, Point>>) || {}
  )
  const [status, setStatus] = useState(initialCase?.status || 'draft')
  
  // State UI
  const [activeAnalysisKey] = useState(initialCase?.primaryAnalysis || 'steiner')
  const [activeLandmark, setActiveLandmark] = useState<LandmarkKey | null>(null)
  
  // State Calibración
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calP1, setCalP1] = useState<Point | null>(null)
  const [calP2, setCalP2] = useState<Point | null>(null)

  // State Firma
  const [showSignModal, setShowSignModal] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  
  // Carga
  const [isSaving, setIsSaving] = useState(false)

  const isCompleted = status === 'completed'
  
  // Derivados reactivos
  const analysisDef = useMemo(() => AnalysisEngine.list().find(a => a.key === activeAnalysisKey)!, [activeAnalysisKey])
  const missingLandmarks = useMemo(() => AnalysisEngine.missingLandmarks(activeAnalysisKey, landmarks), [landmarks, activeAnalysisKey])
  
  const liveResults = useMemo(() => {
    try {
      return AnalysisEngine.run(activeAnalysisKey, landmarks, pixelsPerMm || 1).measurements
    } catch (e) {
      return null // Faltan landmarks
    }
  }, [landmarks, activeAnalysisKey, pixelsPerMm])

  // Manejadores
  const handleUploadComplete = (url: string, w: number, h: number) => {
    setImageUrl(url)
    setImageWidth(w)
    setImageHeight(h)
  }

  const handleLandmarksChange = (newLandmarks: Partial<Record<LandmarkKey, Point>>) => {
    if (isCompleted) return

    if (isCalibrating) {
      // Usar los clicks para la calibracion
      const latestKey = Object.keys(newLandmarks).find(k => k === 'CAL_TEMP') || activeLandmark
      if (!latestKey) return
      
      const p = newLandmarks[latestKey as LandmarkKey]
      if (p) {
        if (!calP1) setCalP1(p)
        else if (!calP2) setCalP2(p)
      }
      return
    }

    setLandmarks(newLandmarks)
    
    // Auto-avanzar al siguiente landmark faltante
    if (activeLandmark) {
      const remaining = AnalysisEngine.missingLandmarks(activeAnalysisKey, newLandmarks)
      if (remaining.length > 0) {
        // Encontrar el siguiente en la lista requerida
        const currentIndex = analysisDef.requiredLandmarks.indexOf(activeLandmark)
        let nextIndex = (currentIndex + 1) % analysisDef.requiredLandmarks.length
        while (!remaining.includes(analysisDef.requiredLandmarks[nextIndex]) && nextIndex !== currentIndex) {
          nextIndex = (nextIndex + 1) % analysisDef.requiredLandmarks.length
        }
        setActiveLandmark(analysisDef.requiredLandmarks[nextIndex])
      } else {
        setActiveLandmark(null)
      }
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const saved = await saveCephalometricCase({
        id: caseId || 'new',
        patientId,
        doctorId: currentUserId,
        imageUrl,
        imageWidth,
        imageHeight,
        pixelsPerMm,
        landmarks,
        analysisResults: liveResults ? {
          [activeAnalysisKey]: {
            version: analysisDef.version,
            generatedAt: new Date().toISOString(),
            measurements: liveResults
          }
        } : null,
        primaryAnalysis: activeAnalysisKey,
        status,
        notes: ''
      })
      
      setCaseId(saved.id)
      if (!caseId) {
        // Si era nuevo, reemplazar url en history
        router.replace(`/admin/pacientes/${patientId}/cefalometria/${saved.id}`)
      }
    } catch (e: any) {
      alert("Error al guardar: " + e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSign = async () => {
    if (!signatureData || !caseId) return
    setIsSaving(true)
    try {
      await handleSave() // Asegurar que lo ultimo esta guardado
      
      const contentHash = btoa(JSON.stringify({ landmarks, liveResults, pixelsPerMm }))
      const updated = await signAndCompleteCase(caseId, signatureData, contentHash)
      setStatus(updated.status)
      setShowSignModal(false)
    } catch (e: any) {
      alert("Error al firmar: " + e.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 bg-surface px-6 py-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/admin/pacientes/${patientId}`)} className="p-2 hover:bg-elevated rounded-lg text-muted hover:text-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-serif font-bold text-text flex items-center gap-3">
              Estudio Cefalométrico 
              {isCompleted ? (
                <span className="px-2 py-1 bg-success-soft text-success text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Firmado y Cerrado
                </span>
              ) : (
                <span className="px-2 py-1 bg-warning-soft text-warning-fg text-[10px] font-bold uppercase tracking-wider rounded-md">
                  Borrador
                </span>
              )}
            </h1>
            <p className="text-xs text-muted mt-1">Análisis: {analysisDef.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isCompleted && imageUrl && (
            <>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="btn-secondary px-5 py-2.5 flex items-center gap-2 text-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar Borrador
              </button>
              <button 
                onClick={() => setShowSignModal(true)}
                disabled={isSaving || !liveResults || !pixelsPerMm}
                className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm"
              >
                <Lock className="w-4 h-4" /> Finalizar y Firmar
              </button>
            </>
          )}
          {isCompleted && (
            <button 
              onClick={() => window.print()}
              className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm"
            >
              <Printer className="w-4 h-4" /> Imprimir Reporte (PDF)
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area - Oculto durante la impresion */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 print:hidden">
        
        {/* Panel Izquierdo: Checklist y Resultados */}
        {imageUrl && (
          <div className="w-full md:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar">
            {!isCompleted && (
              <LandmarkChecklist 
                missingLandmarks={missingLandmarks}
                requiredLandmarks={analysisDef.requiredLandmarks}
                activeLandmark={isCalibrating ? null : activeLandmark}
                onSelectLandmark={(k) => {
                  if (isCalibrating) return
                  setActiveLandmark(k)
                }}
              />
            )}
            <MeasurementPanel 
              analysisDef={analysisDef}
              liveResults={liveResults}
              pixelsPerMm={pixelsPerMm}
            />
          </div>
        )}

        {/* Panel Central: Canvas o Uploader */}
        <div className="flex-1 bg-elevated rounded-2xl border border-border shadow-inner relative flex flex-col overflow-hidden">
          {!imageUrl ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-md w-full">
                <CephImageUploader patientId={patientId} onUploadComplete={handleUploadComplete} />
              </div>
            </div>
          ) : (
            <>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg px-4 pointer-events-none">
                <div className="pointer-events-auto">
                  <CalibrationTool 
                    imageWidth={imageWidth}
                    imageHeight={imageHeight}
                    p1={calP1}
                    p2={calP2}
                    onStart={() => {
                      setIsCalibrating(true)
                      setActiveLandmark('CAL_TEMP' as any)
                      setCalP1(null)
                      setCalP2(null)
                    }}
                    onCancel={() => {
                      setIsCalibrating(false)
                      setActiveLandmark(null)
                    }}
                    onConfirm={(pxMm) => {
                      setPixelsPerMm(pxMm)
                      setIsCalibrating(false)
                      setActiveLandmark(null)
                    }}
                  />
                </div>
              </div>
              <CephImageCanvas 
                imageUrl={imageUrl}
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                landmarks={isCalibrating ? { ...(calP1 ? { CAL_TEMP: calP1 } as any : {}), ...(calP2 ? { CAL_TEMP2: calP2 } as any : {}) } : landmarks}
                onLandmarksChange={handleLandmarksChange}
                activeLandmarkToPlace={isCalibrating ? (calP1 ? (calP2 ? null : 'CAL_TEMP2' as any) : 'CAL_TEMP' as any) : activeLandmark}
              />
            </>
          )}
        </div>
      </div>

      {/* Modal de Firma */}
      {showSignModal && (
        <div className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-xl rounded-3xl shadow-xl overflow-hidden border border-border">
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-serif font-bold text-text mb-2">Firma del Especialista</h3>
              <p className="text-muted text-sm mb-6">
                Al firmar este documento, se sella el análisis cefalométrico con los valores actuales. 
                El caso quedará inmutable en el expediente clínico del paciente.
              </p>
              
              <div className="bg-elevated rounded-2xl border border-border p-2">
                <SignaturePad onSave={setSignatureData} />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setShowSignModal(false)}
                  className="px-6 py-3 text-muted hover:bg-elevated font-medium rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSign}
                  disabled={!signatureData || isSaving}
                  className="btn-primary px-8 py-3 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Firmar y Cerrar Caso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reporte Oculto para Impresión */}
      {isCompleted && imageUrl && liveResults && (
        <CephPrintReport 
          patientId={patientId}
          imageUrl={imageUrl}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          landmarks={landmarks}
          analysisDef={analysisDef}
          liveResults={liveResults}
          doctorName={initialCase?.doctor?.firstName ? `${initialCase.doctor.firstName} ${initialCase.doctor.lastName}` : "Clínica"}
          signatureUrl={initialCase?.doctorSignatureUrl}
          signedAt={initialCase?.signedAt ? new Date(initialCase.signedAt) : null}
        />
      )}
    </div>
  )
}
