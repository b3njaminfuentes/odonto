'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ClinicSettings {
  clinicName: string
  phone: string | null
  address: string | null
  currency: string
  doctorName: string
  specialty: string | null
  pendingAppointmentsAlert: boolean
}

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, error: 'No autorizado.' as const }
  const { data: caller } = await supabase.from('Profile').select('role').eq('id', user.id).single()
  if (caller?.role !== 'admin') return { supabase, user: null, error: 'Solo la administradora puede cambiar la configuración.' as const }
  return { supabase, user, error: null }
}

export async function getClinicSettings(): Promise<ClinicSettings> {
  const supabase = createClient()
  const { data } = await supabase.from('ClinicSettings').select('*').eq('id', 'main').single()
  return {
    clinicName: data?.clinicName ?? 'Clínica Odontológica Villarroel',
    phone: data?.phone ?? '',
    address: data?.address ?? '',
    currency: data?.currency ?? 'BOB',
    doctorName: data?.doctorName ?? 'Dra. Villarroel',
    specialty: data?.specialty ?? '',
    pendingAppointmentsAlert: data?.pendingAppointmentsAlert ?? true,
  }
}

export async function saveClinicSettings(formData: FormData): Promise<{ success: true } | { error: string }> {
  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { error: authErr }

  const clinicName = (formData.get('clinicName') as string)?.trim()
  if (!clinicName) return { error: 'El nombre de la clínica es obligatorio.' }

  const { error } = await supabase.from('ClinicSettings').update({
    clinicName,
    phone: (formData.get('phone') as string)?.trim() || null,
    address: (formData.get('address') as string)?.trim() || null,
    currency: (formData.get('currency') as string) || 'BOB',
    updatedAt: new Date().toISOString(),
  }).eq('id', 'main')

  if (error) return { error: `No se pudo guardar: ${error.message}` }
  revalidatePath('/admin/configuracion')
  return { success: true }
}

export async function saveProfessionalProfile(formData: FormData): Promise<{ success: true } | { error: string }> {
  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { error: authErr }

  const doctorName = (formData.get('doctorName') as string)?.trim()
  if (!doctorName) return { error: 'El nombre es obligatorio.' }

  const { error } = await supabase.from('ClinicSettings').update({
    doctorName,
    specialty: (formData.get('specialty') as string)?.trim() || null,
    updatedAt: new Date().toISOString(),
  }).eq('id', 'main')

  if (error) return { error: `No se pudo guardar: ${error.message}` }
  revalidatePath('/admin/configuracion')
  revalidatePath('/admin')
  return { success: true }
}

export async function saveNotificationPreference(enabled: boolean): Promise<{ success: true } | { error: string }> {
  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { error: authErr }

  const { error } = await supabase.from('ClinicSettings').update({
    pendingAppointmentsAlert: enabled,
    updatedAt: new Date().toISOString(),
  }).eq('id', 'main')

  if (error) return { error: `No se pudo guardar: ${error.message}` }
  revalidatePath('/admin/configuracion')
  revalidatePath('/admin')
  return { success: true }
}
