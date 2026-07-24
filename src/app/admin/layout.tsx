import React from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { SidebarNav } from '@/components/admin/SidebarNav'
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
    <div className="dark flex min-h-screen bg-bg text-text">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col fixed inset-y-0 z-20">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link href="/admin" className="font-serif text-xl text-text tracking-tight leading-tight">
            Clínica <span className="text-brand font-semibold">Villarroel</span>
          </Link>
        </div>

        <SidebarNav />

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center font-semibold text-brand">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text truncate">{doctorName}</p>
              <p className="text-xs text-muted">{settings.specialty || 'Administradora'}</p>
            </div>
            <form action={signOut} className="ml-auto">
              <button type="submit" className="p-2 text-faint hover:text-danger hover:bg-danger-soft rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto ml-64">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
