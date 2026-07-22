import React from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { LogOut, Home, CreditCard, Activity, Calendar, FileText } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

const navItems = [
  { name: 'Mi Resumen', href: '/portal', icon: Home },
  { name: 'Mi Progreso', href: '/portal/progreso', icon: Activity },
  { name: 'Mis Pagos', href: '/portal/pagos', icon: CreditCard },
  { name: 'Mis Citas', href: '/portal/citas', icon: Calendar },
  { name: 'Mis Documentos', href: '/portal/documentos', icon: FileText },
]

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar datos básicos del paciente (si existen)
  let firstName = 'Paciente'
  if (user) {
    const { data } = await supabase.from('Patient').select('firstName').eq('profileId', user.id).single()
    if (data) firstName = data.firstName
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Top Navbar */}
      <header className="bg-primary text-white shadow-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-serif tracking-wide">Clínica Odontológica Villarroel</h1>
              <span className="hidden sm:inline text-primary/40">|</span>
              <span className="hidden sm:inline font-medium text-sm text-primary/80 bg-white/10 px-2 py-0.5 rounded-full">Portal de Paciente</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Hola, {firstName}</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {firstName[0]}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Mobile/Desktop Navigation */}
        <nav className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                  >
                    <item.icon className="w-5 h-5 opacity-70" />
                    {item.name}
                  </Link>
                </li>
              ))}
              <li className="pt-4 mt-4 border-t border-gray-100">
                <form action={signOut}>
                  <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-colors font-medium">
                    <LogOut className="w-5 h-5 opacity-70" />
                    Cerrar Sesión
                  </button>
                </form>
              </li>
            </ul>
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </main>
    </div>
  )
}
