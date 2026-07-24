'use server'

import { createClient } from '@/utils/supabase/server'

export async function changeAdminPassword(newPassword: string): Promise<{ success: true } | { error: string }> {
  if (!newPassword || newPassword.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: `No se pudo cambiar la contraseña: ${error.message}` }
  return { success: true }
}
