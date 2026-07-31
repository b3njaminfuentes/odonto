import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getCaseById } from '@/lib/cephalometry/actions'
import { CephOrchestratorClient } from './CephOrchestratorClient'

export const dynamic = 'force-dynamic'

export default async function CephalometryPage({ params }: { params: { id: string, caseId: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verificar rol
  const { data: profile } = await supabase
    .from('Profile')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role === 'patient') {
    redirect('/portal')
  }

  // Cargar caso si no es 'new'
  let cephCase = null
  if (params.caseId !== 'new') {
    cephCase = await getCaseById(params.caseId)
    if (!cephCase) {
      redirect(`/admin/pacientes/${params.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-bg p-4 md:p-6 lg:p-8 flex flex-col h-screen">
      <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col">
        <CephOrchestratorClient 
          patientId={params.id} 
          initialCase={cephCase} 
          currentUserId={session.user.id} 
        />
      </div>
    </div>
  )
}
