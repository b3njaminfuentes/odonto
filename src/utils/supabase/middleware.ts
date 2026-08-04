import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { resolveClinicByHost } from '@/lib/tenant'

export async function updateSession(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost'
  const clinic = await resolveClinicByHost(host)

  // Clone headers to pass to downstream Server Components and Server Actions
  const requestHeaders = new Headers(request.headers)
  if (clinic) {
    requestHeaders.set('x-clinic-id', clinic.id)
    requestHeaders.set('x-clinic-slug', clinic.slug)
    requestHeaders.set('x-clinic-plan', clinic.plan)
    requestHeaders.set('x-clinic-name', clinic.name)
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  if (clinic) {
    supabaseResponse.headers.set('x-clinic-id', clinic.id)
    supabaseResponse.headers.set('x-clinic-slug', clinic.slug)
    supabaseResponse.headers.set('x-clinic-plan', clinic.plan)
    supabaseResponse.headers.set('x-clinic-name', clinic.name)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          if (clinic) {
            supabaseResponse.headers.set('x-clinic-id', clinic.id)
            supabaseResponse.headers.set('x-clinic-slug', clinic.slug)
            supabaseResponse.headers.set('x-clinic-plan', clinic.plan)
            supabaseResponse.headers.set('x-clinic-name', clinic.name)
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  const isAdminRoute = path.startsWith('/admin')
  const isPortalRoute = path.startsWith('/portal')

  if (isAdminRoute || isPortalRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Comprobar rol en la tabla Profile
    const { data: profile } = await supabase
      .from('Profile')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'patient'

    if (isAdminRoute && role !== 'admin' && role !== 'doctor') {
      // Paciente intentando entrar al admin
      const url = request.nextUrl.clone()
      url.pathname = '/portal'
      return NextResponse.redirect(url)
    }

    if (isPortalRoute && (role === 'admin' || role === 'doctor')) {
      // Admin o Doctor intentando entrar al portal del paciente
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
