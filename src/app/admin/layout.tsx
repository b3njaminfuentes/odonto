import React from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  CreditCard,
  FolderOpen,
  Settings,
  Bot,
  LogOut
} from 'lucide-react'
import { signOut } from '@/app/auth/actions'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/admin/pacientes', icon: Users },
  { name: 'Calendario', href: '/admin/calendario', icon: Calendar },
  { name: 'Tratamientos', href: '/admin/tratamientos', icon: Stethoscope },
  { name: 'Pagos', href: '/admin/finanzas', icon: CreditCard },
  { name: 'Documentos', href: '/admin/documentos', icon: FolderOpen },
  { name: 'Muelita AI', href: '/admin/muelita', icon: Bot },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark flex min-h-screen bg-bg text-text">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col fixed inset-y-0 z-20">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link href="/admin" className="font-serif text-xl text-text tracking-tight leading-tight">
            Clínica <span className="text-brand font-semibold">Villarroel</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-muted hover:text-brand hover:bg-brand-soft"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center font-semibold text-brand">
              MV
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text truncate">Dra. Villarroel</p>
              <p className="text-xs text-muted">Administradora</p>
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
