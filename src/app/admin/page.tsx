import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { KPICard } from '@/components/ui/KPICard'
import { Users, Calendar, Banknote, Activity, Clock } from 'lucide-react'

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
  // Nota: Como queremos ser precisos, podemos obtener los registros y sumar en JS 
  // si Supabase no expone .sum() directo desde la API REST básica.
  const { data: pendingPaymentsData } = await supabase
    .from('Payment')
    .select('amount')
    .eq('status', 'PENDIENTE')

  const totalPendingMoney = pendingPaymentsData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  // 4. Obtener Actividad Reciente (Audit Logs)
  const { data: auditLogs } = await supabase
    .from('AuditLog')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(5)

  const getActivityDescription = (action: string, entity: string) => {
    switch(action) {
      case 'CREATE': return entity === 'Patient' ? 'Nuevo paciente registrado' : 'Nuevo pago registrado'
      case 'UPDATE_HISTORY': return 'Historial clínico actualizado'
      case 'UPLOAD_MEDIA': return 'Nueva imagen/documento subido'
      case 'DELETE_MEDIA': return 'Archivo eliminado'
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
          trend={{ value: 12, isPositive: true }}
          description="En tratamiento o control"
          colorClass="card-teal"
        />
        <KPICard
          title="Citas Hoy"
          value={todayAppointments || 0}
          icon={Calendar}
          description="Pendientes y confirmadas"
          colorClass="card-slate"
        />
        <KPICard
          title="Pagos Pendientes"
          value={`Bs ${totalPendingMoney.toFixed(2)}`}
          icon={Banknote}
          description={`${pendingPaymentsData?.length || 0} facturas por cobrar`}
          colorClass="card-teal"
        />
        <KPICard
          title="Próximas Cirugías"
          value="0"
          icon={Activity}
          description="Agendadas esta semana"
          colorClass="card-slate"
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
                      {new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(log.createdAt))} 
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
          <div className="flex items-center justify-center h-[300px] text-brand/60 border border-dashed border-brand-soft rounded-2xl m-4">
            Todo al día.
          </div>
        </div>
      </div>
    </div>
  )
}
