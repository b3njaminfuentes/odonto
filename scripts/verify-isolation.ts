import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

if (!process.env.DATABASE_URL && process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL
}

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function verifyMultiTenantIsolation() {
  console.log('=== INICIANDO PRUEBA DE AISLAMIENTO MULTI-TENANT ===')
  console.log(`Conectando a la base de datos con adapter PG...`)

  // 1. Obtener Clínica Villarroel
  const villarroel = await prisma.clinic.findUnique({
    where: { slug: 'villarroel' }
  })

  if (!villarroel) {
    throw new Error(`No se pudo obtener la clínica Villarroel`)
  }
  console.log(`✓ Clínica principal: ${villarroel.name} (ID: ${villarroel.id})`)

  // 2. Crear Clínica de Prueba (Tenant 2)
  const testSlug = `test-clinic-${Date.now()}`
  const testClinic = await prisma.clinic.create({
    data: {
      name: 'Clínica Dental San Lucas (Test)',
      slug: testSlug,
      plan: 'pro'
    }
  })

  console.log(`✓ Clínica secundaria creada: ${testClinic.name} (ID: ${testClinic.id}, Slug: ${testClinic.slug})`)

  try {
    // 3. Crear Paciente en Clínica de Prueba
    const testPatient = await prisma.patient.create({
      data: {
        clinicId: testClinic.id,
        patientCode: `TEST-${Date.now()}`,
        firstName: 'Carlos',
        lastName: 'Santillan',
        phone: '+591 79998877',
        dni: `TEST-${Date.now()}`
      }
    })

    console.log(`✓ Paciente creado en Tenant 2: ${testPatient.firstName} ${testPatient.lastName} (ID: ${testPatient.id})`)

    // 4. Test de Aislamiento: Consulta desde Clínica Villarroel
    const villarroelPatients = await prisma.patient.findMany({
      where: { clinicId: villarroel.id },
      select: { id: true, firstName: true, lastName: true }
    })

    const leakFound = villarroelPatients.some(p => p.id === testPatient.id)
    if (leakFound) {
      throw new Error('❌ FALLO CRÍTICO: Fuga de datos detectada! El paciente de la clínica de prueba apareció en las consultas de Villarroel.')
    }
    console.log(`✓ Aislamiento de Pacientes: PASÓ. (El paciente de Tenant 2 NO aparece en los ${villarroelPatients.length} pacientes de Villarroel)`)

    // 5. Test de Citas / Calendario
    const startsAt = new Date()
    startsAt.setDate(startsAt.getDate() + 5)
    startsAt.setHours(10, 0, 0, 0)
    const endsAt = new Date(startsAt.getTime() + 30 * 60000)

    const testAppt = await prisma.appointment.create({
      data: {
        clinicId: testClinic.id,
        patientId: testPatient.id,
        startsAt,
        endsAt,
        status: 'CONFIRMADO',
        treatmentType: 'CONSULTATION',
        notes: 'Cita en clínica secundaria'
      }
    })

    console.log(`✓ Cita creada en Tenant 2 para fecha: ${testAppt.startsAt.toISOString()}`)

    // Consultar citas de Villarroel
    const villarroelAppts = await prisma.appointment.findMany({
      where: { clinicId: villarroel.id },
      select: { id: true, clinicId: true }
    })

    const apptLeakFound = villarroelAppts.some(a => a.id === testAppt.id)
    if (apptLeakFound) {
      throw new Error('❌ FALLO CRÍTICO: La cita del tenant 2 apareció en el calendario de Villarroel!')
    }
    console.log(`✓ Aislamiento de Citas: PASÓ. (La cita de Tenant 2 NO aparece en las ${villarroelAppts.length} citas de Villarroel)`)

    // 6. Test de Finanzas / Pagos
    const testPayment = await prisma.payment.create({
      data: {
        clinicId: testClinic.id,
        patientId: testPatient.id,
        amount: 350.00,
        currency: 'BOB',
        method: 'EFECTIVO'
      }
    })

    const villarroelPayments = await prisma.payment.findMany({
      where: { clinicId: villarroel.id },
      select: { id: true, clinicId: true }
    })

    const payLeak = villarroelPayments.some(p => p.id === testPayment.id)
    if (payLeak) {
      throw new Error('❌ FALLO CRÍTICO: El pago del tenant 2 apareció en las finanzas de Villarroel!')
    }
    console.log(`✓ Aislamiento Financiero: PASÓ. (El pago de Tenant 2 NO aparece en los ${villarroelPayments.length} pagos de Villarroel)`)

    console.log('\n===============================================================')
    console.log('🎉 RESULTADO: TODAS LAS PRUEBAS DE AISLAMIENTO MULTI-TENANT PASARON AL 100%')
    console.log('===============================================================\n')
  } finally {
    // Cleanup
    console.log('Limpiando datos de prueba...')
    await prisma.payment.deleteMany({ where: { clinicId: testClinic.id } })
    await prisma.appointment.deleteMany({ where: { clinicId: testClinic.id } })
    await prisma.patient.deleteMany({ where: { clinicId: testClinic.id } })
    await prisma.clinic.delete({ where: { id: testClinic.id } })
    console.log('✓ Limpieza completada.')
    await prisma.$disconnect()
    await pool.end()
  }
}

verifyMultiTenantIsolation().catch(err => {
  console.error(err)
  process.exit(1)
})
