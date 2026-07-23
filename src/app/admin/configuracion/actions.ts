'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ClinicSettings {
  clinicName: string
  phone: string | null
  address: string | null
  currency: string
}

export async function getClinicSettings(): Promise<ClinicSettings> {
  const supabase = createClient()
  const { data } = await supabase.from('ClinicSettings').select('*').eq('id', 'main').single()
  return {
    clinicName: data?.clinicName ?? 'Clínica Odontológica Villarroel',
    phone: data?.phone ?? '',
    address: data?.address ?? '',
    currency: data?.currency ?? 'BOB',
  }
}

export async function saveClinicSettings(formData: FormData): Promise<{ success: true } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }
  const { data: caller } = await supabase.from('Profile').select('role').eq('id', user.id).single()
  if (caller?.role !== 'admin') return { error: 'Solo la administradora puede cambiar la configuración.' }

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
