'use client'

import React, { useRef, useState, MouseEvent } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Point } from '@/lib/cephalometry/geometry'
import { LandmarkKey } from '@/lib/cephalometry/landmarks'

interface CephImageCanvasProps {
  imageUrl: string
  imageWidth: number
  imageHeight: number
  landmarks: Partial<Record<LandmarkKey, Point>>
  onLandmarksChange: (newLandmarks: Partial<Record<LandmarkKey, Point>>) => void
  activeLandmarkToPlace?: LandmarkKey | null // Si hay un landmark seleccionado en la UI para colocar
}

export function CephImageCanvas({ 
  imageUrl, 
  imageWidth, 
  imageHeight, 
  landmarks, 
  onLandmarksChange,
  activeLandmarkToPlace
}: CephImageCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  // Estado para manejar el drag de puntos existentes
  const [draggingKey, setDraggingKey] = useState<LandmarkKey | null>(null)

  // Convierte un evento de mouse a coordenadas relativas normalizadas (0 a 1) sobre el SVG
  const getNormalizedPoint = (e: MouseEvent | React.PointerEvent): Point | null => {
    if (!svgRef.current) return null
    const CTM = svgRef.current.getScreenCTM()
    if (!CTM) return null

    // e.clientX/Y son coordenadas de pantalla
    // Aplicar transformación inversa del SVG para obtener coordenadas locales (viewBox)
    const svgP = svgRef.current.createSVGPoint()
    svgP.x = e.clientX
    svgP.y = e.clientY
    const localP = svgP.matrixTransform(CTM.inverse())

    // El viewBox es de 0 0 imageWidth imageHeight, así que normalizamos dividiendo
    return {
      x: localP.x / imageWidth,
      y: localP.y / imageHeight
    }
  }

  const handlePointerDownSVG = (e: React.PointerEvent) => {
    if (draggingKey) return // Ya estamos arrastrando algo
    if (!activeLandmarkToPlace) return // No hay nada para colocar

    const p = getNormalizedPoint(e)
    if (p) {
      onLandmarksChange({ ...landmarks, [activeLandmarkToPlace]: p })
    }
  }

  const handlePointerDownPoint = (e: React.PointerEvent, key: LandmarkKey) => {
    e.stopPropagation() // Evitar que el SVG registre un clic nuevo
    setDraggingKey(key)
    
    // Al empezar el drag, capturamos el puntero para que no se pierda si sale rápido
    const target = e.target as Element
    target.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingKey) return
    const p = getNormalizedPoint(e)
    if (p) {
      onLandmarksChange({ ...landmarks, [draggingKey]: p })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingKey) {
      const target = e.target as Element
      target.releasePointerCapture(e.pointerId)
      setDraggingKey(null)
    }
  }

  return (
    <div className="w-full h-full bg-elevated rounded-2xl overflow-hidden border border-border relative select-none">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        centerOnInit
        wheel={{ step: 0.1 }}
        // Desactivar panning si estamos arrastrando un punto
        panning={{ disabled: draggingKey !== null }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${imageWidth} ${imageHeight}`}
            className="w-full h-full cursor-crosshair touch-none"
            onPointerDown={handlePointerDownSVG}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Imagen de fondo */}
            <image href={imageUrl} width={imageWidth} height={imageHeight} />

            {/* Trazado Automático de Líneas (Plano de Frankfort, Mandibular, etc.) */}
            <g stroke="rgba(56, 189, 248, 0.6)" strokeWidth={Math.max(imageWidth * 0.002, 2)} strokeDasharray="5,5" fill="none">
              {landmarks.S && landmarks.N && <line x1={landmarks.S.x * imageWidth} y1={landmarks.S.y * imageHeight} x2={landmarks.N.x * imageWidth} y2={landmarks.N.y * imageHeight} />}
              {landmarks.N && landmarks.A && <line x1={landmarks.N.x * imageWidth} y1={landmarks.N.y * imageHeight} x2={landmarks.A.x * imageWidth} y2={landmarks.A.y * imageHeight} />}
              {landmarks.N && landmarks.B && <line x1={landmarks.N.x * imageWidth} y1={landmarks.N.y * imageHeight} x2={landmarks.B.x * imageWidth} y2={landmarks.B.y * imageHeight} />}
              {landmarks.N && landmarks.Pog && <line x1={landmarks.N.x * imageWidth} y1={landmarks.N.y * imageHeight} x2={landmarks.Pog.x * imageWidth} y2={landmarks.Pog.y * imageHeight} stroke="rgba(167, 139, 250, 0.5)" />}
              {landmarks.Po && landmarks.Or && <line x1={landmarks.Po.x * imageWidth} y1={landmarks.Po.y * imageHeight} x2={landmarks.Or.x * imageWidth} y2={landmarks.Or.y * imageHeight} stroke="rgba(250, 204, 21, 0.6)" />}
              {landmarks.Go && landmarks.Me && <line x1={landmarks.Go.x * imageWidth} y1={landmarks.Go.y * imageHeight} x2={landmarks.Me.x * imageWidth} y2={landmarks.Me.y * imageHeight} stroke="rgba(250, 204, 21, 0.6)" />}
              {landmarks.U1 && landmarks.U1a && <line x1={landmarks.U1.x * imageWidth} y1={landmarks.U1.y * imageHeight} x2={landmarks.U1a.x * imageWidth} y2={landmarks.U1a.y * imageHeight} stroke="rgba(248, 113, 113, 0.7)" />}
              {landmarks.L1 && landmarks.L1a && <line x1={landmarks.L1.x * imageWidth} y1={landmarks.L1.y * imageHeight} x2={landmarks.L1a.x * imageWidth} y2={landmarks.L1a.y * imageHeight} stroke="rgba(96, 165, 250, 0.7)" />}
            </g>

            {/* Renderizar puntos guardados */}
            {Object.entries(landmarks).map(([key, point]) => {
              if (!point) return null;
              
              // El radio y ancho del trazo se pueden hacer relativos a la imagen
              // para que no sean invisibles en imagenes de 4000px ni gigantes en 500px
              const r = Math.max(imageWidth * 0.005, 5) 
              const strokeWidth = Math.max(imageWidth * 0.001, 1)

              return (
                <g key={key}>
                  <circle
                    cx={point.x * imageWidth}
                    cy={point.y * imageHeight}
                    r={r}
                    className={`cursor-grab active:cursor-grabbing transition-colors ${
                      draggingKey === key ? 'fill-accent' : 'fill-brand'
                    }`}
                    stroke="white"
                    strokeWidth={strokeWidth}
                    onPointerDown={(e) => handlePointerDownPoint(e, key as LandmarkKey)}
                  />
                  {/* Etiqueta del punto */}
                  <text
                    x={point.x * imageWidth + r * 1.5}
                    y={point.y * imageHeight + r * 1.5}
                    fill="white"
                    fontSize={r * 2}
                    fontWeight="bold"
                    className="pointer-events-none drop-shadow-md"
                  >
                    {key}
                  </text>
                </g>
              )
            })}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}
