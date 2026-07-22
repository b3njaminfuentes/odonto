import { createClient } from '@/utils/supabase/server'

export async function logAuditAction({
  userId,
  action,
  entity,
  entityId,
  metadata = {}
}: {
  userId: string
  action: string
  entity: string
  entityId: string
  metadata?: any
}) {
  const supabase = createClient()

  const { error } = await supabase
    .from('AuditLog')
    .insert({
      userId,
      action,
      entity,
      entityId,
      metadata,
    })

  if (error) {
    console.error('Failed to log audit action:', error)
  }
}
