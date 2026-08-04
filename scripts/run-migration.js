const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

async function run() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL not set in .env')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: dbUrl })
  const client = await pool.connect()

  try {
    console.log('--- STEP 1: PRE-MIGRATION COUNTS ---')
    const countCheck = async (table) => {
      try {
        const res = await client.query(`SELECT COUNT(*)::int as c FROM "${table}"`)
        return res.rows[0].c
      } catch {
        return 'N/A'
      }
    }

    const prePatients = await countCheck('Patient')
    const preAppointments = await countCheck('Appointment')
    const prePayments = await countCheck('Payment')
    const preTreatments = await countCheck('Treatment')

    console.log({
      prePatients,
      preAppointments,
      prePayments,
      preTreatments
    })

    console.log('\n--- STEP 2: EXECUTING SQL MIGRATION ---')
    const sqlPath = path.join(__dirname, 'multitenant_migration.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    await client.query(sql)
    console.log('SQL Migration executed successfully.')

    console.log('\n--- STEP 3: POST-MIGRATION VERIFICATION ---')
    const postPatients = await countCheck('Patient')
    const postAppointments = await countCheck('Appointment')
    const postPayments = await countCheck('Payment')
    const postTreatments = await countCheck('Treatment')

    const clinicCheck = await client.query(`SELECT id, name, slug, plan FROM "Clinic"`)
    const domainCheck = await client.query(`SELECT domain, "isPrimary" FROM "ClinicDomain"`)

    console.log('Post-migration counts:', {
      postPatients,
      postAppointments,
      postPayments,
      postTreatments
    })
    console.log('Clinics in database:', clinicCheck.rows)
    console.log('Domains in database:', domainCheck.rows)

    if (
      prePatients !== postPatients ||
      preAppointments !== postAppointments ||
      prePayments !== postPayments ||
      preTreatments !== postTreatments
    ) {
      console.error('DISCREPANCY DETECTED IN RECORD COUNTS!')
      process.exit(1)
    }

    console.log('\nSUCCESS: Migration verified with 100% record match.')
  } catch (err) {
    console.error('MIGRATION FAILED:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
