import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  
  // Destruir la sesión
  await supabase.auth.signOut()

  // Redirigir a la landing page
  return NextResponse.redirect(new URL('/', request.url))
}
