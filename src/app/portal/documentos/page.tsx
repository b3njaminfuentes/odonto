import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { FileText, AlertCircle, File, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toBO } from '@/lib/datetime'

export const dynamic = 'force-dynamic'

export default async function DocumentosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Buscar el paciente
  const { data: patient } = await supabase
    .from('Patient')
    .select('id')
    .eq('profileId', user.id)
    .single()

  if (!patient) {
    return (
      <div className="bg-surface rounded-2xl p-8 shadow-sm border border-border text-center">
        <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Ficha no vinculada</h2>
        <p className="text-muted">Tu cuenta aún no ha sido vinculada a una ficha clínica.</p>
      </div>
    )
  }

  // Buscar solo documentos VISIBLES para el paciente
  const { data: documents } = await supabase
    .from('CaseMedia')
    .select('*')
    .eq('patientId', patient.id)
    .eq('visibleToPatient', true)
    .order('createdAt', { ascending: false })

  // Firmar URLs
  const docsWithUrls = documents ? await Promise.all(documents.map(async (doc) => {
    const { data: urlData } = await supabase
      .storage
      .from(doc.bucket)
      .createSignedUrl(doc.fileUrl, 3600) // 1 hora
    return { ...doc, signedUrl: urlData?.signedUrl }
  })) : []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="bg-surface rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
        <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-brand" />
          Mis Documentos y Fotos
        </h2>
        <p className="text-muted max-w-2xl">
          Aquí puedes visualizar las radiografías, estudios y documentos que tu doctora ha compartido contigo para el seguimiento de tu tratamiento.
        </p>
      </div>

      {(!docsWithUrls || docsWithUrls.length === 0) ? (
        <div className="bg-surface rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-muted shadow-sm">
          <FileText className="w-12 h-12 mb-3 text-muted" />
          <p className="text-sm">No tienes documentos o estudios compartidos en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {docsWithUrls.map((doc) => (
            <div key={doc.id} className="group bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="aspect-[4/3] bg-elevated relative flex items-center justify-center overflow-hidden">
                {doc.category === 'document' ? (
                  <File className="w-16 h-16 text-muted" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={doc.signedUrl} 
                    alt={doc.description}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-bold text-text text-sm leading-snug" title={doc.description}>
                      {doc.description}
                    </h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand-soft px-2 py-0.5 rounded-md flex-shrink-0">
                      {doc.category === 'document' ? 'PDF' : 'IMG'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted capitalize">
                    {format(toBO(doc.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
                
                <a 
                  href={doc.signedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-elevated hover:bg-elevated text-muted font-medium text-sm rounded-xl transition-colors"
                >
                  Abrir Archivo
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
