import React from 'react'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/auth/actions'
import { AdminShell } from '@/components/admin/AdminShell'
import { getClinicSettings } from './configuracion/actions'
import { getAuthProfile } from '@/utils/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await getAuthProfile()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'doctor')) {
    redirect('/auth/login')
  }

  const settings = await getClinicSettings()
  
  // Si es un doctor secundario, usar su nombre. Si es admin, usar la configuración general.
  const isDoctor = profile.role === 'doctor'
  const doctorName = isDoctor && profile.firstName 
    ? `${profile.firstName} ${profile.lastName || ''}`.trim() 
    : (settings.doctorName || 'Dra. Villarroel')
    
  const specialty = isDoctor && profile.specialty
    ? profile.specialty
    : (settings.specialty || 'Administradora')

  const initials = doctorName
    .replace(/^Dra?\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'DV'

  return (
    <AdminShell
      doctorName={doctorName}
      initials={initials}
      specialty={specialty}
      userRole={profile.role}
      signOutAction={signOut}
    >
      {children}
    </AdminShell>
  )
}
