import React from 'react'
import { createAdminClient, getAuthProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Plus, ShieldCheck, Mail, CheckCircle, XCircle } from 'lucide-react'
import { NewTeamMemberModal } from '@/components/admin/NewTeamMemberModal'
import { StatusBadge } from '@/components/ui/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function EquipoPage() {
  const supabase = createAdminClient()
  const { profile } = await getAuthProfile()

  if (profile?.role === 'doctor') {
    redirect('/admin')
  }

  const { data: teamMembers } = await supabase
    .from('Profile')
    .select('*')
    .in('role', ['admin', 'doctor'])
    .order('createdAt', { ascending: true })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-serif text-text tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-brand" />
            Equipo Médico
          </h1>
          <p className="text-muted">
            Gestiona los accesos de los doctores y especialistas de la clínica.
          </p>
        </div>
        <NewTeamMemberModal />
      </div>

      <div className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-elevated text-muted font-medium border-b border-border">
              <tr>
                <th className="py-4 px-6 font-semibold">Doctor / Especialista</th>
                <th className="py-4 px-6 font-semibold">Rol / Acceso</th>
                <th className="py-4 px-6 font-semibold">Especialidad</th>
                <th className="py-4 px-6 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teamMembers?.map((member) => (
                <tr key={member.id} className="hover:bg-elevated/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center font-bold text-brand shrink-0">
                        {member.firstName?.[0] || 'U'}
                        {member.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-bold text-text">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-muted flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {member.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-brand-soft text-brand">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Administrador
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-elevated text-muted">
                        <Users className="w-3.5 h-3.5" />
                        Doctor
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-muted font-medium">
                    {member.specialty || '—'}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge 
                      status={member.isActive ? 'success' : 'default'} 
                      text={member.isActive ? 'Activo' : 'Inactivo'} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
