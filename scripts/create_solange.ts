import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import WebSocket from 'ws'

// @ts-ignore
global.WebSocket = WebSocket

dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  const email = '2005@clinicavillarroel.com'
  const password = 'odontosolange'

  // 1. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('User already exists in Auth.')
    } else {
      console.error('Error creating auth user:', authError)
      return
    }
  } else {
    console.log('User created in Auth:', authData.user.id)
  }

  // Get user id
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('Error fetching users:', listError)
    return
  }

  const user = usersData.users.find(u => u.email === email)
  if (!user) {
    console.error('User not found after creation/check.')
    return
  }

  const userId = user.id

  // 2. Create/Update Profile in Prisma/Postgres
  const { error: profileError } = await supabase
    .from('Profile')
    .upsert({
      id: userId,
      email,
      role: 'doctor',
      firstName: 'Solange',
      lastName: 'Terrazas',
      specialty: 'Endodoncia',
      color: 'bg-indigo-500 text-white',
      isActive: true,
    })

  if (profileError) {
    console.error('Error updating Profile:', profileError)
  } else {
    console.log('Profile created/updated successfully with color.')
  }
}

main().catch(console.error)
