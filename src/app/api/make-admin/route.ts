import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  
  // Obtener sesión actual
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'No estás logueado. Inicia sesión primero.' }, { status: 401 })
  }

  // Actualizar el rol a 'admin' asegurando que exista el perfil
  const { error } = await supabase
    .from('Profile')
    .upsert({ 
      id: session.user.id, 
      role: 'admin',
      email: session.user.email!
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Redirigir al dashboard
  return NextResponse.redirect(new URL('/admin', request.url))
}
