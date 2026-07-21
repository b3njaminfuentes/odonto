import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const supabaseAuth = createServerClient()
  
  // Obtener sesión actual
  const { data: { session } } = await supabaseAuth.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'No estás logueado. Inicia sesión primero.' }, { status: 401 })
  }

  // Bypass RLS usando Service Role Key
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Actualizar el rol a 'admin' asegurando que exista el perfil
  const { error } = await supabaseAdmin
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
