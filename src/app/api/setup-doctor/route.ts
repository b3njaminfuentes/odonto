import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  
  // 1. Crear el usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: '2001@paciente.clinica.com',
    password: 'marisol tequila',
  })

  if (authError && authError.message !== 'User already registered') {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // Si el usuario se creó (o ya existía y pudimos hacer signIn, pero signUp falla si ya existe),
  // necesitamos asegurarnos de que el rol es admin.
  // Vamos a intentar hacer signIn si ya existía.
  let userId = authData.user?.id

  if (!userId && authError?.message === 'User already registered') {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: '2001@paciente.clinica.com',
      password: 'marisol tequila',
    })
    if (signInError) {
      return NextResponse.json({ error: signInError.message }, { status: 500 })
    }
    userId = signInData.user?.id
  }

  if (userId) {
    // 2. Hacerla admin
    await supabase
      .from('Profile')
      .update({ role: 'admin' })
      .eq('id', userId)

    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.json({ error: 'Failed to setup doctor' }, { status: 500 })
}
