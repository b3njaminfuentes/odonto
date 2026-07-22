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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-20 shadow-sm">
        <div className="h-20 flex items-center px-6 border-b border-slate-100 bg-white">
          <h1 className="text-xl font-serif text-teal-800 tracking-tight leading-tight">
            Clínica<br/><span className="font-semibold">Villarroel</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navigation.map((item) => {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-slate-600 hover:text-teal-700 hover:bg-teal-50"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-semibold text-teal-700">
              MV
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Dra. Villarroel</p>
              <p className="text-xs text-slate-500">Administradora</p>
            </div>
            <form action={signOut} className="ml-auto">
              <button type="submit" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
