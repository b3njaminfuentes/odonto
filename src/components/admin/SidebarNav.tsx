'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Calendar, Stethoscope, CreditCard, FolderOpen, Settings, Bot,
} from 'lucide-react'

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

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
      {navigation.map((item) => {
        const isActive = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href)
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
              isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:text-brand hover:bg-brand-soft/60'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
