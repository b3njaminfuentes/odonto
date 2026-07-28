import React from 'react'
import { signOut } from '@/app/auth/actions'
import { AdminShell } from '@/components/admin/AdminShell'
import { getClinicSettings } from './configuracion/actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getClinicSettings()
  const doctorName = settings.doctorName || 'Dra. Villarroel'
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
      specialty={settings.specialty || 'Administradora'}
      signOutAction={signOut}
    >
      {children}
    </AdminShell>
  )
}
