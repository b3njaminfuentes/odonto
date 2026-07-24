import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { PatientLeaderboard } from '@/components/patients/PatientLeaderboard'
import { Patient } from '@/components/patients/PatientCard'
import { intlBO, toBO } from '@/lib/datetime'
import { createClient as createServiceClient } from '@supabase/supabase-js'

async function resolvePhotoUrls(profilePhotoIds: (string | null)[]): Promise<Record<string, string>> {
  const ids = profilePhotoIds.filter((id): id is string => !!id)
  if (ids.length === 0) return {}
  const svc = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const urls: Record<string, string> = {}
  await Promise.all(ids.map(async (path) => {
    const { data } = await svc.storage.from('patients-profile').createSignedUrl(path, 3600)
    if (data?.signedUrl) urls[path] = data.signedUrl
  }))
  return urls
}

export const dynamic = 'force-dynamic'

export default async function PacientesPage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string; status?: string }
}) {
  const supabase = createClient()
  
  const q = searchParams?.q || ''
  const page = Number(searchParams?.page || '1')
  const statusFilter = searchParams?.status || 'ALL'
  const limit = 20
  const offset = (page - 1) * limit

  // Traer los pacientes de la tabla de Supabase, con paginación y búsqueda real
  let query = supabase
    .from('Patient')
    .select(`
      id,
      firstName,
      lastName,
      dob,
      email,
      status,
      profilePhotoId,
      Treatment (
        name,
        status,
        createdAt
      ),
      Appointment (
        startsAt,
        status
      )
    `, { count: 'exact' })

  if (q) {
    query = query.or(`firstName.ilike.%${q}%,lastName.ilike.%${q}%,dni.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`)
  }

  if (statusFilter !== 'ALL') {
    query = query.eq('status', statusFilter)
  }

  const { data: rawPatients, count, error } = await query
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching patients:', error)
  }

  const now = new Date()
  const photoUrls = await resolvePhotoUrls((rawPatients || []).map((p: any) => p.profilePhotoId))

  // Mapear los datos reales para la UI
  const initialPatients: Patient[] = (rawPatients || []).map((p: any) => {
    // Tratamiento Principal (el ACTIVO más reciente, o el completado más reciente si no hay activo)
    let mainTreatment = 'Consulta General'
    if (p.Treatment && p.Treatment.length > 0) {
      const activeTreatments = p.Treatment.filter((t: any) => t.status === 'ACTIVO')
      if (activeTreatments.length > 0) {
        // Sort by newest
        activeTreatments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        mainTreatment = activeTreatments[0].name
      } else {
        // If no active, just grab the most recently created
        p.Treatment.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        mainTreatment = p.Treatment[0].name
      }
    }

    // Última visita y próxima cita
    let lastVisit = 'Sin visitas previas'
    let nextAppointment = 'No agendada'

    if (p.Appointment && p.Appointment.length > 0) {
      const pastAppointments = p.Appointment.filter((a: any) => new Date(a.startsAt) < now && a.status === 'CONFIRMADO')
      const futureAppointments = p.Appointment.filter((a: any) => new Date(a.startsAt) >= now && a.status !== 'CANCELADO')

      if (pastAppointments.length > 0) {
        pastAppointments.sort((a: any, b: any) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()) // Descending
        lastVisit = intlBO({ dateStyle: 'medium' }).format(toBO(pastAppointments[0].startsAt))
      }

      if (futureAppointments.length > 0) {
        futureAppointments.sort((a: any, b: any) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()) // Ascending
        nextAppointment = intlBO({ dateStyle: 'medium' }).format(toBO(futureAppointments[0].startsAt))
      }
    }

    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      dob: p.dob,
      phone: p.phone,
      email: p.email,
      status: p.status,
      avatarUrl: p.profilePhotoId ? (photoUrls[p.profilePhotoId] || null) : null,
      mainTreatment,
      lastVisit,
      nextAppointment
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-serif text-text tracking-tight">Pacientes</h1>
        <p className="text-muted">
          Gestiona tu lista de pacientes y accede a sus historiales clínicos.
        </p>
      </div>

      <PatientLeaderboard 
        initialPatients={initialPatients} 
        totalCount={count || 0}
        currentPage={page}
        currentSearch={q}
        currentStatus={statusFilter}
      />
    </div>
  )
}
