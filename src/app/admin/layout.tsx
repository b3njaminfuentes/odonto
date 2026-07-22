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
      <aside className="w-64 bg-neoBg border-r-3 border-black flex flex-col fixed inset-y-0 z-20">
        <div className="h-20 flex items-center px-6 border-b-3 border-black bg-neoYellow">
          <h1 className="text-xl font-black uppercase text-black">
            Clínica<br/>Villarroel
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-3">
          {navigation.map((item) => {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold uppercase tracking-wider text-sm border-3 bg-white text-gray-700 border-transparent hover:border-black hover:shadow-neo hover:-translate-y-0.5 hover:-translate-x-0.5 hover:text-black hover:bg-neoYellow"
              >
                <item.icon className="w-5 h-5" strokeWidth={2.5} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t-3 border-black bg-neoGreen">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center font-bold text-black shadow-sm">
              MV
            </div>
            <div>
              <p className="text-sm font-bold text-black uppercase">Dra. Villarroel</p>
              <p className="text-xs text-black/80 font-medium">Administradora</p>
            </div>
            <form action={signOut} className="ml-auto">
              <button type="submit" className="p-2 text-black hover:bg-black hover:text-neoGreen rounded-xl transition-colors border-2 border-transparent hover:border-black">
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
