import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

export interface ResolvedClinic {
  id: string
  name: string
  slug: string
  plan: string
}

export const DEFAULT_CLINIC_ID = 'a0000000-0000-0000-0000-000000000001'

// In-memory cache for domain -> clinic mapping to keep middleware sub-millisecond fast
const domainCache = new Map<string, { clinic: ResolvedClinic | null; expiresAt: number }>()
const CACHE_TTL_MS = 60 * 1000 // 1 minute cache

export async function resolveClinicByHost(host: string): Promise<ResolvedClinic | null> {
  const cleanHost = host.toLowerCase().trim()
  const hostWithoutPort = cleanHost.split(':')[0]

  // Check cache
  const cached = domainCache.get(cleanHost) || domainCache.get(hostWithoutPort)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.clinic
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    // Fallback default for offline dev
    return {
      id: DEFAULT_CLINIC_ID,
      name: 'Clínica Odontológica Villarroel',
      slug: 'villarroel',
      plan: 'enterprise',
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })

  try {
    // 1. Check exact domain match in ClinicDomain
    const { data: domainData } = await supabase
      .from('ClinicDomain')
      .select('clinicId, Clinic(id, name, slug, plan)')
      .or(`domain.eq.${cleanHost},domain.eq.${hostWithoutPort}`)
      .limit(1)
      .maybeSingle()

    if (domainData && domainData.Clinic) {
      const clinic = domainData.Clinic as unknown as ResolvedClinic
      domainCache.set(cleanHost, { clinic, expiresAt: Date.now() + CACHE_TTL_MS })
      return clinic
    }

    // 2. Check subdomain/slug (e.g. villarroel.clinicos.app -> slug "villarroel")
    const parts = hostWithoutPort.split('.')
    if (parts.length >= 2) {
      const potentialSlug = parts[0]
      if (potentialSlug !== 'www' && potentialSlug !== 'app' && potentialSlug !== 'clinicos') {
        const { data: clinicData } = await supabase
          .from('Clinic')
          .select('id, name, slug, plan')
          .eq('slug', potentialSlug)
          .maybeSingle()

        if (clinicData) {
          const clinic = clinicData as ResolvedClinic
          domainCache.set(cleanHost, { clinic, expiresAt: Date.now() + CACHE_TTL_MS })
          return clinic
        }
      }
    }

    // 3. Fallback for localhost or development
    if (cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1') || cleanHost.includes('vercel.app')) {
      const { data: defaultClinic } = await supabase
        .from('Clinic')
        .select('id, name, slug, plan')
        .eq('slug', 'villarroel')
        .maybeSingle()

      if (defaultClinic) {
        const clinic = defaultClinic as ResolvedClinic
        domainCache.set(cleanHost, { clinic, expiresAt: Date.now() + CACHE_TTL_MS })
        return clinic
      }
    }

    // No clinic found
    domainCache.set(cleanHost, { clinic: null, expiresAt: Date.now() + CACHE_TTL_MS })
    return null
  } catch (error) {
    console.error('Error resolving clinic by host:', error)
    return {
      id: DEFAULT_CLINIC_ID,
      name: 'Clínica Odontológica Villarroel',
      slug: 'villarroel',
      plan: 'enterprise',
    }
  }
}

/**
 * Resolves current clinic ID from incoming request headers (set by middleware)
 * or falls back safely to default.
 */
export async function getCurrentClinicId(): Promise<string> {
  try {
    const headersList = headers()
    const headerClinicId = headersList.get('x-clinic-id')
    if (headerClinicId) return headerClinicId
  } catch {
    // Outside request context (e.g. background job / scripts)
  }
  return DEFAULT_CLINIC_ID
}

/**
 * Gets full tenant details including theme, settings, testimonials and gallery
 */
export async function getTenantConfig(clinicId?: string) {
  const targetId = clinicId || (await getCurrentClinicId())
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })

  const [clinicRes, themeRes, settingsRes, testimonialsRes, galleryRes] = await Promise.all([
    supabase.from('Clinic').select('*').eq('id', targetId).maybeSingle(),
    supabase.from('ClinicTheme').select('*').eq('clinicId', targetId).maybeSingle(),
    supabase.from('ClinicSettings').select('*').eq('clinicId', targetId).maybeSingle(),
    supabase.from('Testimonial').select('*').eq('clinicId', targetId).eq('visible', true).order('createdAt', { ascending: false }),
    supabase.from('GalleryItem').select('*').eq('clinicId', targetId).order('order', { ascending: true }),
  ])

  return {
    clinic: clinicRes.data || {
      id: targetId,
      name: 'Clínica Odontológica Villarroel',
      slug: 'villarroel',
      plan: 'enterprise',
    },
    theme: themeRes.data || {
      primaryColor: '#0F6E56',
      heroHeadline: 'Tu sonrisa en manos expertas',
      logoUrl: null,
      heroImageUrl: null,
    },
    settings: settingsRes.data || {
      phone: '+591 70000000',
      address: 'Cochabamba, Bolivia',
      currency: 'BOB',
      doctorName: 'Dra. Solange Villarroel',
      specialty: 'Ortodoncia y Estética Dental',
    },
    testimonials: testimonialsRes.data || [],
    galleryItems: galleryRes.data || [],
  }
}
