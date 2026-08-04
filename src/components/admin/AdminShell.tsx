'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Calendar, Stethoscope, CreditCard, FolderOpen, Settings,
  Menu, X, LogOut, ChevronRight, HelpCircle, BookOpen
} from 'lucide-react'
import { HelpCenterModal } from './HelpCenterModal'

const navigation = [
  { name: 'Inicio', href: '/admin', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/admin/pacientes', icon: Users },
  { name: 'Calendario', href: '/admin/calendario', icon: Calendar },
  { name: 'Tratamientos', href: '/admin/tratamientos', icon: Stethoscope },
  { name: 'Pagos', href: '/admin/finanzas', icon: CreditCard },
  { name: 'Documentos', href: '/admin/documentos', icon: FolderOpen },
  { name: 'Equipo', href: '/admin/equipo', icon: Users },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

interface AdminShellProps {
  children: React.ReactNode
  doctorName: string
  initials: string
  specialty: string
  userRole: string
  signOutAction: () => Promise<void>
}

export function AdminShell({ children, doctorName, initials, specialty, userRole, signOutAction }: AdminShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const filteredNavigation = navigation.filter(item => {
    if (userRole === 'doctor') {
      return item.name !== 'Pagos' && item.name !== 'Configuración' && item.name !== 'Equipo'
    }
    return true
  })

  // Cerrar sidebar automáticamente al navegar en móvil
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Cerrar sidebar al hacer resize a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Bloquear scroll del body cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <div className="dark flex min-h-screen bg-bg text-text">

      {/* ── MOBILE: Top Bar ── */}
      <header className="no-print lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-border h-16 flex items-center justify-between px-4 shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-1 rounded-xl text-muted hover:text-brand hover:bg-brand-soft transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link href="/admin" className="font-serif text-lg text-text tracking-tight">
          Clínica <span className="text-brand font-semibold">Villarroel</span>
        </Link>

        <div className="w-9 h-9 rounded-full bg-brand-soft flex items-center justify-center text-xs font-bold text-brand">
          {initials}
        </div>
      </header>

      {/* ── MOBILE: Overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="no-print lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (Desktop: fijo, Mobile: drawer) ── */}
      <aside
        className={`
          no-print
          fixed inset-y-0 left-0 z-50
          w-72 lg:w-64
          bg-surface border-r border-border
          flex flex-col
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border shrink-0">
          <Link href="/admin" className="font-serif text-xl text-text tracking-tight leading-tight">
            Clínica <span className="text-brand font-semibold">Villarroel</span>
          </Link>

          {/* Close button: solo mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-muted hover:text-danger hover:bg-danger-soft transition-colors -mr-2"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname?.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 lg:py-2.5 rounded-xl transition-all font-medium text-sm group ${
                  isActive
                    ? 'bg-brand-soft text-brand shadow-sm'
                    : 'text-muted hover:text-brand hover:bg-brand-soft/60'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-brand/50 hidden lg:block" />
                )}
              </Link>
            )
          })}

          {/* Botón Permanente de Guías y Centro de Ayuda */}
          <div className="pt-4 mt-4 border-t border-border/60">
            <button
              onClick={() => setHelpOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 lg:py-2.5 rounded-xl transition-all font-medium text-sm text-brand bg-brand-soft/50 hover:bg-brand-soft border border-brand/20 shadow-sm"
            >
              <HelpCircle className="w-5 h-5 shrink-0 text-brand" />
              <span className="flex-1 text-left">Guías de Uso</span>
              <span className="text-[10px] uppercase font-bold bg-brand text-white px-1.5 py-0.5 rounded">Ayuda</span>
            </button>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center font-semibold text-brand shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text truncate">{doctorName}</p>
              <p className="text-xs text-muted truncate">{specialty}</p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="p-2 text-faint hover:text-danger hover:bg-danger-soft rounded-lg transition-colors shrink-0"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
          {children}
        </div>
      </main>

      {/* Modal Permanente de Centro de Ayuda */}
      <HelpCenterModal 
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </div>
  )
}
