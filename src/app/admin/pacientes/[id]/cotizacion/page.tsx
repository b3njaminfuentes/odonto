import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { getAccountStatement } from '@/app/admin/pacientes/payment-actions'
import { getClinicSettings } from '@/app/admin/configuracion/actions'
import { CotizacionDoc } from '@/components/patients/CotizacionDoc'

export const dynamic = 'force-dynamic'

export default async function CotizacionPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: patient } = await supabase
    .from('Patient')
    .select('id, firstName, lastName, patientCode, dni, phone, email')
    .eq('id', params.id)
    .single()

  if (!patient) return notFound()

  const [statement, clinic] = await Promise.all([
    getAccountStatement(params.id),
    getClinicSettings(),
  ])

  const today = new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen">
      <div className="no-print mb-6">
        <Link href={`/admin/pacientes/${patient.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-text">
          <ArrowLeft className="w-4 h-4" /> Volver al perfil
        </Link>
      </div>

      <CotizacionDoc
        patient={patient}
        treatments={statement.treatments}
        clinic={clinic}
        today={today}
      />
    </div>
  )
}
