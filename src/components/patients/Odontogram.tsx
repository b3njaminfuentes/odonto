'use client'

import React, { useState, useEffect } from 'react'
import { Info, Loader2, Check, X } from 'lucide-react'
import { getOdontogram, saveOdontogram } from '@/app/admin/pacientes/odontogram-actions'

interface OdontogramProps {
  patientId: string
  readOnly?: boolean
}

type ToothState = 'normal' | 'caries' | 'obturación' | 'incrustación' | 'corona' | 'puente' | 'endodoncia' | 'implante' | 'extracción' | 'resto_radicular'

const STATES: { key: ToothState; label: string; dot: string }[] = [
  { key: 'normal', label: 'Sano', dot: 'bg-[#dfe7e2]' },
  { key: 'caries', label: 'Caries', dot: 'bg-danger' },
  { key: 'obturación', label: 'Obturación', dot: 'bg-info' },
  { key: 'incrustación', label: 'Incrustación', dot: 'bg-[#c9922e]' },
  { key: 'corona', label: 'Corona', dot: 'bg-[#e0a92e]' },
  { key: 'puente', label: 'Puente', dot: 'bg-[#6b7d87]' },
  { key: 'endodoncia', label: 'Endodoncia', dot: 'bg-accent' },
  { key: 'implante', label: 'Implante', dot: 'bg-brand' },
  { key: 'resto_radicular', label: 'Resto Radicular', dot: 'bg-[#8a5a3a]' },
  { key: 'extracción', label: 'Ausente', dot: 'bg-faint' },
]

// Silueta según tipo de pieza (último dígito FDI).
function toothType(fdi: number): 'incisor' | 'molar' {
  const d = fdi % 10
  return d >= 6 ? 'molar' : 'incisor'
}

const CROWN = {
  incisor: 'M9 16 C9 6 16 3 22 3 C28 3 35 6 35 16 L34 30 C34 35 30 37 26 37 L18 37 C14 37 10 35 10 30 Z',
  molar: 'M6 16 C6 6 14 3 22 3 C30 3 38 6 38 16 L37 31 C37 36 33 39 28 39 L16 39 C11 39 7 36 7 31 Z',
}
const ROOTS = {
  incisor: ['M18 35 L20 57 C21 61 23 61 24 57 L26 35 Z'],
  molar: ['M13 37 L12 57 C12 61 15 61 16 57 L18 37 Z', 'M26 37 L28 57 C29 61 32 61 32 57 L31 37 Z'],
}

// Colores de esmalte por estado (claro, oscuro) para el degradado 3D.
const ENAMEL: Record<ToothState, [string, string]> = {
  normal: ['#ffffff', '#d9e2dc'],
  caries: ['#ffffff', '#d9e2dc'],
  obturación: ['#ffffff', '#d9e2dc'],
  incrustación: ['#ffffff', '#d9e2dc'],
  corona: ['#fff2c9', '#d99a1f'],
  puente: ['#eef2f4', '#7d8a91'],
  endodoncia: ['#ffffff', '#d9e2dc'],
  implante: ['#eef2f4', '#9fb0b8'],
  extracción: ['#eef1f0', '#cdd6d1'],
  resto_radicular: ['#c9a48a', '#8a5a3a'],
}

function Tooth({ fdi, state, upper, selected, onClick, readOnly }: {
  fdi: number; state: ToothState; upper: boolean; selected: boolean; onClick: () => void; readOnly: boolean
}) {
  const type = toothType(fdi)
  const [c0, c1] = ENAMEL[state]
  const rootTint = state === 'endodoncia' ? '#f0876f' : (state === 'implante' || state === 'puente' ? '#8fa3ab' : (state === 'resto_radicular' ? '#8a5a3a' : c1))
  const gid = `en-${fdi}`
  const rid = `rt-${fdi}`
  const absent = state === 'extracción'
  const rootRemnant = state === 'resto_radicular'

  return (
    <button
      onClick={onClick}
      disabled={readOnly}
      title={`Diente ${fdi} · ${STATES.find(s => s.key === state)?.label ?? 'Sano'}`}
      className={`group relative outline-none transition-transform duration-200 ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${selected ? 'scale-110 -translate-y-1 z-10' : 'hover:-translate-y-0.5'}`}
      style={{ filter: selected ? 'drop-shadow(0 6px 10px rgba(16,32,25,.28))' : 'drop-shadow(0 3px 4px rgba(16,32,25,.16))' }}
    >
      <svg width="40" height="56" viewBox="0 0 44 62" style={{ transform: upper ? 'scaleY(-1)' : undefined, opacity: absent ? 0.35 : 1 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c0} />
            <stop offset="1" stopColor={c1} />
          </linearGradient>
          <linearGradient id={rid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={rootTint} />
            <stop offset="1" stopColor="#c7d1cb" />
          </linearGradient>
        </defs>
        {/* raíces */}
        {ROOTS[type].map((d, i) => (
          <path key={i} d={d} fill={`url(#${rid})`} stroke="#b9c4bd" strokeWidth="0.6" />
        ))}
        {/* corona: ausente en resto radicular (solo queda la raíz, con un borde fracturado) */}
        {rootRemnant ? (
          <path d="M11 33 L17 30 L22 34 L27 30 L33 33 L33 36 C33 38 30 40 22 40 C14 40 11 38 11 36 Z"
            fill={`url(#${gid})`} stroke="#6b4327" strokeWidth="1" />
        ) : (
          <path d={CROWN[type]} fill={`url(#${gid})`} stroke={selected ? 'hsl(150 26% 40%)' : '#b9c4bd'} strokeWidth={selected ? 1.6 : 0.8} />
        )}
        {/* brillo especular */}
        {!rootRemnant && <ellipse cx="16" cy="13" rx="6.5" ry="4" fill="#ffffff" opacity="0.55" />}
        {/* marcadores por estado */}
        {state === 'caries' && (<><circle cx="27" cy="22" r="4.2" fill="#7f1d1d" /><circle cx="21" cy="27" r="2.4" fill="#991b1b" /></>)}
        {state === 'obturación' && (<rect x="16" y="14" width="12" height="9" rx="3" fill="#2563eb" opacity="0.9" />)}
        {state === 'incrustación' && (<rect x="18" y="16" width="8" height="8" rx="1.5" transform="rotate(45 22 20)" fill="#c9922e" opacity="0.9" />)}
        {state === 'puente' && (<rect x="1" y="0" width="42" height="4" rx="2" fill="#5b6b72" opacity="0.9" />)}
        {state === 'implante' && (<>
          <line x1="18" y1="44" x2="26" y2="44" stroke="#5b6b72" strokeWidth="1.4" />
          <line x1="18" y1="49" x2="26" y2="49" stroke="#5b6b72" strokeWidth="1.4" />
          <line x1="19" y1="54" x2="25" y2="54" stroke="#5b6b72" strokeWidth="1.4" />
        </>)}
        {state === 'endodoncia' && (<line x1="22" y1="10" x2="22" y2="56" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" />)}
      </svg>
      {absent && (
        <span className="absolute inset-0 flex items-center justify-center">
          <X className="w-5 h-5 text-danger" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

export function Odontogram({ patientId, readOnly = false }: OdontogramProps) {
  const [teeth, setTeeth] = useState<Record<number, ToothState>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    getOdontogram(patientId).then(d => { setTeeth(d || {}); setLoading(false) })
  }, [patientId])

  const upper = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
  const lower = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

  // Curva de arco: desplazamiento vertical parabólico por columna (16 piezas).
  const archOffset = (i: number, dome: boolean) => {
    const t = (i - 7.5) / 7.5
    const off = 26 * t * t
    return dome ? off : -off
  }

  const setState = async (state: ToothState) => {
    if (selected == null) return
    const next = { ...teeth, [selected]: state }
    if (state === 'normal') delete next[selected]
    setTeeth(next)
    setSelected(null)
    setSaving(true)
    await saveOdontogram(patientId, next)
    setSaving(false)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1800)
  }

  const Arch = ({ ids, dome }: { ids: number[]; dome: boolean }) => (
    <div className="flex justify-center items-end gap-[3px] sm:gap-1.5">
      {ids.map((fdi, i) => {
        const st = (teeth[fdi] as ToothState) || 'normal'
        return (
          <div key={fdi} className="flex flex-col items-center" style={{ transform: `translateY(${archOffset(i, dome)}px)` }}>
            {dome && <span className="text-[9px] sm:text-[10px] font-semibold text-faint mb-1 tabular-nums">{fdi}</span>}
            <Tooth fdi={fdi} state={st} upper={dome} selected={selected === fdi} readOnly={readOnly} onClick={() => !readOnly && setSelected(selected === fdi ? null : fdi)} />
            {!dome && <span className="text-[9px] sm:text-[10px] font-semibold text-faint mt-1 tabular-nums">{fdi}</span>}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h2 className="text-xl font-serif text-text">Odontograma</h2>
        <div className="flex items-center gap-4">
          {saving && <span className="text-brand flex items-center gap-1.5 text-sm font-medium"><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</span>}
          {savedFlash && !saving && <span className="text-success flex items-center gap-1.5 text-sm font-medium animate-in fade-in"><Check className="w-4 h-4" /> Guardado</span>}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
        {STATES.map(s => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted">
            <span className={`w-3 h-3 rounded-full ring-1 ring-black/5 ${s.dot}`} /> {s.label}
          </span>
        ))}
      </div>

      {/* Boca */}
      <div className="flex-1 rounded-2xl border border-border p-6 sm:p-10 relative min-h-[340px] overflow-hidden"
        style={{ background: 'radial-gradient(120% 90% at 50% 50%, hsl(var(--brand) / 0.06), hsl(var(--elevated)) 70%)' }}>
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-surface/40 z-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[640px] flex flex-col gap-8 py-4">
            <Arch ids={upper} dome />
            <div className="relative h-px bg-border/70">
              <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-elevated px-3 text-[10px] font-semibold text-faint uppercase tracking-[0.2em]">Maxilar · Mandíbula</span>
            </div>
            <Arch ids={lower} dome={false} />
          </div>
        </div>

        {/* Selector de estado */}
        {selected != null && !readOnly && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-lift p-3 z-10 animate-in slide-in-from-bottom-2 fade-in">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-sm font-semibold text-text">Diente {selected}</span>
              <button onClick={() => setSelected(null)} className="text-faint hover:text-text"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-w-xs">
              {STATES.map(s => (
                <button key={s.key} onClick={() => setState(s.key)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border hover:border-brand hover:bg-brand-soft transition-colors">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} /> {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="mt-4 p-4 bg-brand-soft rounded-xl border border-brand/15 flex gap-3 text-brand">
          <Info className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Toca un diente y elige su estado. Los cambios se guardan solos en la ficha del paciente.</p>
        </div>
      )}
    </div>
  )
}
