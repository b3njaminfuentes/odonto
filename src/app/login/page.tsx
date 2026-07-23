import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import LoginForm from './login-form'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Si ya tiene sesión, redirigir según su rol
  if (session) {
    const { data: profile } = await supabase
      .from('Profile')
      .select('role')
      .eq('id', session.user.id)
      .single()
      
    if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/portal')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-elevated p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-xl shadow-lg border border-border">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text tracking-tight">Clínica Odontológica Villarroel</h1>
          <p className="text-muted mt-2 text-sm">Portal de acceso</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
