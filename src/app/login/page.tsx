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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clinic OS</h1>
          <p className="text-gray-500 mt-2 text-sm">Portal de acceso - Clínica Villarroel</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
