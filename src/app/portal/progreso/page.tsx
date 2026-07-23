import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { Odontogram } from '@/components/patients/Odontogram'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProgresoPage() {
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
        <p className="text-muted">
          Tu cuenta aún no ha sido vinculada a una ficha clínica para ver tu odontograma.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-text">Mi Odontograma</h2>
          <p className="text-muted text-sm">
            Estado actual de tu dentadura. Recuerda que este esquema es referencial y solo puede ser modificado por la doctora.
          </p>
        </div>
        
        {/* Aquí pasamos readOnly para bloquear la edición por parte del paciente */}
        <div className="h-[500px]">
          <Odontogram patientId={patient.id} readOnly={true} />
        </div>
      </div>
    </div>
  )
}
