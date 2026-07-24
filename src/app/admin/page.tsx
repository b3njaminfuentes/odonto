import React from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { KPICard } from '@/components/ui/KPICard'
import { getClinicSettings } from './configuracion/actions'
import { Users, Calendar, Banknote, Clock, ClipboardList, ArrowRight } from 'lucide-react'
import { intlBO, toBO } from '@/lib/datetime'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // 1. Obtener Pacientes Activos
  const { count: activePatients } = await supabase
    .from('Patient')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'ACTIVE')

  // 2. Obtener Citas de Hoy (Pendientes o Confirmadas)
  const today = new Date().toISOString().split('T')[0]
  const { count: todayAppointments } = await supabase
    .from('Appointment')
    .select('id', { count: 'exact', head: true })
    .gte('startsAt', `${today}T00:00:00Z`)
    .lte('startsAt', `${today}T23:59:59Z`)
    .in('status', ['PENDIENTE', 'CONFIRMADO'])

  // 3. Obtener Pagos Pendientes (Cantidad y Suma)
  const { data: pendingPaymentsData } = await supabase
    .from('Payment')
    .select('amount')
    .eq('status', 'PENDIENTE')

  const totalPendingMoney = pendingPaymentsData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  // 4. Citas por confirmar (futuras, en estado PENDIENTE — típicamente solicitudes desde la web)
  const nowISO = new Date().toISOString()
  const { data: pendingAppointments, count: pendingCount } = await supabase
    .from('Appointment')
    .select('id, startsAt, treatmentType, notes, Patient:patientId(firstName, lastName)', { count: 'exact' })
    .eq('status', 'PENDIENTE')
    .gte('startsAt', nowISO)
    .order('startsAt', { ascending: true })
    .limit(5)

  // 5. Preferencia de notificaciones (Configuración)
  const settings = await getClinicSettings()

  // 6. Actividad Reciente (Audit Logs)
  const { data: auditLogs } = await supabase
    .from('AuditLog')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(5)

  const getActivityDescription = (action: string, entity: string) => {
    switch (action) {
      case 'CREATE': return entity === 'Patient' ? 'Nuevo paciente registrado' : 'Nuevo pago registrado'
      case 'UPDATE_HISTORY': return 'Historial clínico actualizado'
      case 'UPLOAD_MEDIA': return 'Nueva imagen/documento subido'
      case 'DELETE_MEDIA': return 'Archivo eliminado'
      case 'CREATE_ACCESS': return 'Acceso de portal generado'
      case 'REGEN_ACCESS': return 'Código de acceso regenerado'
      default: return 'Actividad en el sistema'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-serif text-brand tracking-tight">Dashboard</h1>
        <p className="text-muted">Un vistazo rápido al estado de la clínica hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard
          title="Pacientes Activos"
          value={activePatients || 0}
          icon={Users}
          description="En tratamiento o control"
        />
        <KPICard
          title="Citas Hoy"
          value={todayAppointments || 0}
          icon={Calendar}
          description="Pendientes y confirmadas"
        />
        <KPICard
          title="Pagos Pendientes"
          value={`Bs ${totalPendingMoney.toFixed(2)}`}
          icon={Banknote}
          description={`${pendingPaymentsData?.length || 0} pagos por cobrar`}
        />
        <KPICard
          title="Citas por Confirmar"
          value={pendingCount || 0}
          icon={ClipboardList}
          description="Solicitudes pendientes de la web"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card bg-surface p-6 min-h-[400px]">
          <h2 className="text-xl font-semibold text-text mb-6">Actividad Reciente</h2>

          {auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-border transition-colors hover:bg-elevated group">
                  <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-brand-soft transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-text">{getActivityDescription(log.action, log.entity)}</p>
                    <p className="text-xs text-muted mt-1">
                      {intlBO({ dateStyle: 'medium', timeStyle: 'short' }).format(toBO(log.createdAt))}
                      {' '}• Referencia: {log.entityId.split('-')[0]}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted border border-dashed border-border rounded-2xl m-4 bg-elevated">
              Aún no hay actividad registrada en el sistema.
            </div>
          )}
        </div>

        <div className="card bg-brand-soft border-brand-soft p-6 min-h-[400px]">
          <h2 className="text-xl font-semibold text-brand mb-6">Recordatorios</h2>

          {!settings.pendingAppointmentsAlert ? (
            <p className="text-brand/60 text-sm">
              Los avisos de citas por confirmar están desactivados. Podés activarlos en Configuración.
            </p>
          ) : pendingAppointments && pendingAppointments.length > 0 ? (
            <div className="space-y-3">
              {pendingAppointments.map((a: any) => (
                <div key={a.id} className="bg-surface/70 rounded-xl p-3 text-sm">
                  <p className="font-semibold text-text">{a.Patient?.firstName ? `${a.Patient.firstName} ${a.Patient.lastName}` : (a.notes?.split('—')[1]?.split('·')[0]?.trim() || 'Solicitud web')}</p>
                  <p className="text-muted text-xs mt-0.5">
                    {intlBO({ dateStyle: 'medium', timeStyle: 'short' }).format(toBO(a.startsAt))} · {a.treatmentType || 'Consulta'}
                  </p>
                </div>
              ))}
              <Link href="/admin/calendario" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:gap-2 transition-all mt-2">
                Ver en el calendario <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-brand/60 border border-dashed border-brand-soft rounded-2xl">
              Todo al día. No hay citas por confirmar.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
