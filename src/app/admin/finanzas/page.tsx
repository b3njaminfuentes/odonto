import React from 'react'
import { createAdminClient, getAuthProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DollarSign, TrendingUp, Users, ArrowUpRight, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getCurrentClinicId } from '@/lib/tenant'

// Cliente
import FinanzasInteractivityWrapper from './FinanzasWrapper'
import { getDoctorPayments, getDoctorsList } from './doctor-actions'

export const dynamic = 'force-dynamic'

export default async function FinanzasPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined }
}) {
  const supabase = createAdminClient()
  const clinicId = await getCurrentClinicId()
  const { profile } = await getAuthProfile()

  if (profile?.role === 'doctor') {
    redirect('/admin')
  }

  // Traer pacientes para el select del Modal
  const { data: rawPatients } = await supabase
    .from('Patient')
    .select('id, firstName, lastName, patientCode')
    .eq('clinicId', clinicId)
    .eq('status', 'ACTIVE')
    .order('lastName')

  const patientsForSelect = (rawPatients || []).map(p => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    code: p.patientCode
  }))

  // Traer últimos 50 pagos
  const { data: rawPayments } = await supabase
    .from('Payment')
    .select(`
      id,
      amount,
      date,
      method,
      notes,
      status,
      patientId,
      Patient:patientId (
        id,
        firstName,
        lastName
      )
    `)
    .eq('clinicId', clinicId)
    .order('date', { ascending: false })
    .limit(50)

  const payments = (rawPayments || []).map((p: any) => ({
    id: p.id,
    amount: p.amount,
    date: p.date,
    method: p.method,
    concept: p.notes, // Map notes from DB to concept in UI
    status: p.status,
    patientId: p.patientId,
    patient: {
      firstName: p.Patient?.firstName || 'Paciente',
      lastName: p.Patient?.lastName || 'Desconocido',
    }
  }))

  // Traer pagos a doctores y lista de doctores
  const doctorPaymentsRaw = await getDoctorPayments()
  const doctorsList = await getDoctorsList()

  const doctorPayments = (doctorPaymentsRaw || []).map((p: any) => ({
    id: p.id,
    amount: p.amount,
    date: p.date,
    description: p.description,
    signatureUrl: p.signatureUrl,
    doctorId: p.doctorId,
    doctor: {
      firstName: p.doctor?.firstName || 'Doctor',
      lastName: p.doctor?.lastName || '',
      color: p.doctor?.color || 'brand'
    }
  }))

  // KPIs sobre TODO el historial (no solo los últimos 50 que se listan abajo).
  // Solo los pagos COMPLETADOS cuentan como ingreso real (los anulados no).
  const { data: allCompleted } = await supabase
    .from('Payment')
    .select('amount, patientId')
    .eq('clinicId', clinicId)
    .eq('status', 'COMPLETADO')

  const totalIngresos = (allCompleted || []).reduce((acc, curr) => acc + Number(curr.amount), 0)
  const completedCount = (allCompleted || []).length
  const patientsWithPayments = new Set((allCompleted || []).map((p) => p.patientId)).size

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-3xl font-serif text-text tracking-tight">Finanzas</h1>
        <p className="text-muted">
          Control de ingresos, pagos recientes y saldos de pacientes.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-success/5 rounded-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Ingresos Totales</p>
              <h3 className="text-2xl font-bold text-text">Bs {totalIngresos.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand/5 rounded-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Ticket Promedio</p>
              <h3 className="text-2xl font-bold text-text">
                Bs {completedCount > 0 ? (totalIngresos / completedCount).toFixed(2) : '0.00'}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-warning/5 rounded-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Pacientes con Pagos</p>
              <h3 className="text-2xl font-bold text-text">
                {patientsWithPayments}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Transacciones y Modal Wrapper */}
      <FinanzasInteractivityWrapper 
        patients={patientsForSelect} 
        payments={payments} 
        doctors={doctorsList}
        doctorPayments={doctorPayments}
      />

    </div>
  )
}
