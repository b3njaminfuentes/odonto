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
  { name: 'Pagos', href: '/admin/finanzas', icon: CreditCard },
  // Ocultos para el MVP hasta que se programen las páginas completas:
  // { name: 'Tratamientos', href: '/admin/tratamientos', icon: Stethoscope },
  // { name: 'Documentos', href: '/admin/documentos', icon: FolderOpen },
  // { name: 'Muelita AI', href: '/admin/muelita', icon: Bot },
  // { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-gray-100 flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <h1 className="text-xl font-bold tracking-tight text-primary">Clínica Odontológica Villarroel</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors font-medium text-sm group"
            >
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              MV
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Dra. Villarroel</p>
              <p className="text-xs text-gray-500">Administradora</p>
            </div>
          </div>
          <form action={signOut}>
            <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cerrar Sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
