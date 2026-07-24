import React from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { FileText, File, ImageIcon, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toBO } from '@/lib/datetime'

export const dynamic = 'force-dynamic'

export default async function DocumentosPage() {
  const supabase = createClient()

  const { data: media } = await supabase
    .from('CaseMedia')
    .select('id, bucket, fileUrl, description, category, mimeType, createdAt, patientId, Patient:patientId(firstName, lastName, patientCode)')
    .order('createdAt', { ascending: false })
    .limit(60)

  const withUrls = media ? await Promise.all(media.map(async (m: any) => {
    const { data } = await supabase.storage.from(m.bucket).createSignedUrl(m.fileUrl, 3600)
    return { ...m, signedUrl: data?.signedUrl }
  })) : []

  const isImage = (m: any) => (m.mimeType || '').startsWith('image') || m.bucket?.includes('image') || m.category === 'Antes' || m.category === 'Después'

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-3xl font-serif text-text tracking-tight">Documentos y Fotos</h1>
        <p className="text-muted">
          Archivos clínicos recientes de todos los pacientes. Para subir o gestionar, entrá al perfil de cada paciente.
        </p>
      </div>

      {withUrls.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-muted shadow-sm">
          <FileText className="w-12 h-12 mb-3 text-faint" />
          <p className="text-sm">Aún no hay documentos ni fotos cargadas.</p>
          <Link href="/admin/pacientes" className="mt-4 text-sm text-brand font-medium inline-flex items-center gap-1">
            Ir a pacientes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {withUrls.map((m: any) => (
            <div key={m.id} className="group card overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-elevated relative flex items-center justify-center overflow-hidden">
                {isImage(m) && m.signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.signedUrl} alt={m.description || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <File className="w-14 h-14 text-faint" />
                )}
                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-brand bg-brand-soft px-2 py-0.5 rounded-md">
                  {m.category || (isImage(m) ? 'Foto' : 'Doc')}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-text text-sm leading-snug truncate" title={m.description}>
                    {m.description || 'Sin título'}
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    {m.createdAt ? format(toBO(m.createdAt), "d 'de' MMM, yyyy", { locale: es }) : ''}
                  </p>
                </div>
                {m.Patient && (
                  <Link href={`/admin/pacientes/${m.patientId}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:gap-2 transition-all">
                    {m.Patient.firstName} {m.Patient.lastName} · {m.Patient.patientCode}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
