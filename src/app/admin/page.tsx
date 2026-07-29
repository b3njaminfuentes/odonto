import React from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { KPICard } from '@/components/ui/KPICard'
import { getClinicSettings } from './configuracion/actions'
import { Users, Calendar, Banknote, Clock, ClipboardList, ArrowRight, CheckCircle2, User, Phone } from 'lucide-react'
import { intlBO, toBO } from '@/lib/datetime'
import { StatusBadge } from '@/components/ui/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Huso horario de Bolivia (America/La_Paz) para calcular el día de hoy exacto (YYYY-MM-DD)
  const todayBO = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())

  // 1. Obtener Pacientes Activos
  const { count: activePatients } = await supabase
    .from('Patient')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'ACTIVE')

  // 2. Obtener Citas de Hoy (Lista Completa y Conteo) en hora local de Bolivia
  const { data: todayAppointmentsList, count: todayAppointmentsCount } = await supabase
    .from('Appointment')
    .select(`
      id,
      startsAt,
      endsAt,
      treatmentType,
      status,
      notes,
      patientId,
      Patient:patientId (
        id,
        firstName,
        lastName,
        phone
      )
    `, { count: 'exact' })
    .gte('startsAt', `${todayBO}T00:00:00`)
    .lte('startsAt', `${todayBO}T23:59:59`)
    .not('status', 'eq', 'CANCELADO')
    .order('startsAt', { ascending: true })

  // 3. Obtener Pagos Pendientes (Cantidad y Suma)
  const { data: pendingPaymentsData } = await supabase
    .from('Payment')
    .select('amount')
    .eq('status', 'PENDIENTE')

  const totalPendingMoney = pendingPaymentsData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  // 4. Citas por confirmar (futuras, en estado PENDIENTE)
  const { data: pendingAppointments, count: pendingCount } = await supabase
    .from('Appointment')
    .select('id, startsAt, treatmentType, notes, Patient:patientId(firstName, lastName)', { count: 'exact' })
    .eq('status', 'PENDIENTE')
    .gte('startsAt', `${todayBO}T00:00:00`)
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
      case 'CREATE': return entity === 'Patient' ? 'Nuevo paciente registrado' : 'Nuevo registro en el sistema'
      case 'UPDATE_HISTORY': return 'Historial clínico actualizado'
      case 'UPLOAD_MEDIA': return 'Nueva imagen/documento subido'
      case 'DELETE_MEDIA': return 'Archivo eliminado'
      case 'CREATE_ACCESS': return 'Acceso de portal generado'
      case 'REGEN_ACCESS': return 'Código de acceso regenerado'
      case 'CREATE_MOLD_CHART': return 'Ficha de moldes de ortodoncia guardada'
      case 'DELETE': return entity === 'Patient' ? 'Paciente eliminado' : 'Registro eliminado'
      case 'BULK_DELETE': return 'Eliminación masiva de pacientes'
      default: return 'Actividad en el sistema'
    }
  }

  const formatHour = (iso: string) => (iso ? iso.slice(11, 16) : '')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-serif text-brand tracking-tight">Dashboard</h1>
        <p className="text-muted">Un vistazo rápido al estado de la clínica y la agenda de hoy.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard
          title="Pacientes Activos"
          value={activePatients || 0}
          icon={Users}
          description="En tratamiento o control"
        />
        <KPICard
          title="Citas Hoy"
          value={todayAppointmentsCount || 0}
          icon={Calendar}
          description="Agendadas para el día de hoy"
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

      {/* AGENDA DE HOY (CITAS DEL DÍA) + RECORDATORIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA PRINCIPAL: AGENDA DE HOY */}
        <div className="lg:col-span-2 card bg-surface p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-semibold text-text flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand" />
                Citas de Hoy ({todayAppointmentsCount || 0})
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {intlBO({ dateStyle: 'full' }).format(toBO(new Date()))}
              </p>
            </div>
            <Link
              href="/admin/calendario"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              Ver calendario completo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayAppointmentsList && todayAppointmentsList.length > 0 ? (
            <div className="space-y-3">
              {todayAppointmentsList.map((app: any) => {
                const patientName = app.Patient?.firstName
                  ? `${app.Patient.firstName} ${app.Patient.lastName}`
                  : (app.notes?.split('—')[1]?.split('·')[0]?.trim() || 'Paciente sin registrar')

                const isWebBooking = app.status === 'PENDIENTE' && app.notes?.startsWith('Solicitud web')
                const isPast = app.startsAt < `${todayBO}T00:00:00` && app.status === 'CONFIRMADO'
                const displayStatus = isPast ? 'FINALIZADO' : app.status
                
                return (
                  <div
                    key={app.id}
                    className={`p-4 rounded-xl bg-elevated/60 border ${isWebBooking ? 'border-danger bg-danger-soft/30 border-l-4' : 'border-border'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand/40 transition-all group`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Horario de la Cita */}
                      <div className="px-3 py-2 bg-surface rounded-xl border border-border text-center shrink-0 min-w-[90px] shadow-sm">
                        <span className="text-base font-bold text-brand block leading-none">
                          {formatHour(app.startsAt)}
                        </span>
                        <span className="text-[10px] font-medium text-muted block mt-1">
                          a {formatHour(app.endsAt)}
                        </span>
                      </div>

                      {/* Info del Paciente */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <StatusBadge
                            status={isWebBooking ? 'danger' : displayStatus === 'FINALIZADO' ? 'success' : displayStatus === 'CONFIRMADO' ? 'success' : displayStatus === 'PENDIENTE' ? 'warning' : 'default'}
                            text={displayStatus}
                          />
                          {isWebBooking && <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-danger px-2 py-0.5 rounded-full animate-pulse">Reserva Web</span>}
                          <span className="text-xs font-bold text-brand bg-brand-soft px-2 py-0.5 rounded-md border border-brand/10">
                            {app.treatmentType || 'Consulta General'}
                          </span>
                        </div>
                        <h4 className="font-bold text-text text-base group-hover:text-brand transition-colors">
                          {patientName}
                        </h4>
                        {app.notes && (
                          <p className={`text-xs mt-0.5 line-clamp-1 ${isWebBooking ? 'text-danger font-medium' : 'text-muted'}`}>
                            {app.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Acción / Enlace a Ficha */}
                    {app.Patient?.id ? (
                      <Link
                        href={`/admin/pacientes/${app.Patient.id}`}
                        className="px-3 py-1.5 bg-surface border border-border text-xs font-semibold text-brand rounded-xl hover:bg-brand-soft transition-colors shrink-0"
                      >
                        Ver Ficha
                      </Link>
                    ) : (
                      <Link
                        href="/admin/calendario"
                        className="px-3 py-1.5 bg-surface border border-border text-xs font-semibold text-muted rounded-xl hover:text-brand transition-colors shrink-0"
                      >
                        Ver en Agenda
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[280px] text-muted border border-dashed border-border rounded-2xl bg-elevated/40 p-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-brand mb-3 opacity-60" />
              <p className="text-base font-semibold text-text">No hay citas agendadas para hoy</p>
              <p className="text-xs text-muted mt-1 max-w-sm">
                Podés agendar turnos desde el calendario o esperar solicitudes de pacientes desde la web.
              </p>
            </div>
          )}
        </div>

        {/* COLUMNA SECUNDARIA: RECORDATORIOS Y SOLICITUDES PENDIENTES */}
        <div className="space-y-6">
          
          {/* Recordatorios de Citas Web por Confirmar */}
          <div className="card bg-brand-soft border-brand-soft p-6">
            <h2 className="text-lg font-bold text-brand mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Solicitudes por Confirmar ({pendingCount || 0})
            </h2>

            {!settings.pendingAppointmentsAlert ? (
              <p className="text-brand/60 text-xs leading-relaxed">
                Los avisos de citas por confirmar están desactivados. Podés activarlos en Configuración.
              </p>
            ) : pendingAppointments && pendingAppointments.length > 0 ? (
              <div className="space-y-3">
                {pendingAppointments.map((a: any) => {
                  const pName = a.Patient?.firstName
                    ? `${a.Patient.firstName} ${a.Patient.lastName}`
                    : (a.notes?.split('—')[1]?.split('·')[0]?.trim() || 'Solicitud web')

                  return (
                    <div key={a.id} className="bg-surface/80 rounded-xl p-3 text-xs border border-brand/10 shadow-sm">
                      <p className="font-bold text-text text-sm">{pName}</p>
                      <p className="text-muted mt-1 font-medium">
                        {formatHour(a.startsAt)} hs · {a.treatmentType || 'Consulta'}
                      </p>
                    </div>
                  )
                })}
                <Link href="/admin/calendario" className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:gap-2 transition-all mt-2">
                  Ver todas en la agenda <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="p-4 text-center text-brand/70 text-xs border border-dashed border-brand-soft rounded-xl bg-surface/50 font-medium">
                Todo al día. No hay solicitudes pendientes por confirmar.
              </div>
            )}
          </div>

          {/* Actividad Reciente */}
          <div className="card bg-surface p-6">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand" />
              Actividad Reciente
            </h2>

            {auditLogs && auditLogs.length > 0 ? (
              <div className="space-y-3">
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" />
                    <div>
                      <p className="font-semibold text-text">{getActivityDescription(log.action, log.entity)}</p>
                      <p className="text-[11px] text-muted">
                        {intlBO({ dateStyle: 'short', timeStyle: 'short' }).format(toBO(log.createdAt))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">Sin actividad reciente.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
