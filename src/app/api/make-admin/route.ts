import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  
  // Obtener sesión actual
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'No estás logueado. Inicia sesión primero.' }, { status: 401 })
  }

  // Actualizar el rol a 'admin'
  const { error } = await supabase
    .from('Profile')
    .update({ role: 'admin' })
    .eq('id', session.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Redirigir al dashboard
  return NextResponse.redirect(new URL('/admin', request.url))
}
