import { createClient } from '@/utils/supabase/server'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const supabase = createClient()
  const { messages } = await req.json()

  // 1. Autenticación Estricta
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return new Response('No autorizado. Debes iniciar sesión.', { status: 401 })
  }

  // 2. Extraer contexto seguro apoyándonos en RLS
  // Como usamos el cliente de Supabase instanciado con la cookie del usuario,
  // cualquier consulta que hagamos aquí ESTÁ protegida por las políticas de la base de datos.
  
  let userRole = 'PACIENTE'
  let systemContext = ''

  const { data: profile } = await supabase.from('Profile').select('role').eq('id', user.id).single()
  
  if (profile?.role === 'admin') {
    userRole = 'DOCTORA/ADMIN'
    
    // Extraer KPIs básicos de la clínica para dárselos a Muelita
    const { count: patientCount } = await supabase.from('Patient').select('id', { count: 'exact', head: true })
    const { count: pendingAppointments } = await supabase.from('Appointment').select('id', { count: 'exact', head: true }).eq('status', 'PENDIENTE')
    
    systemContext = `Eres Muelita, la IA asistente experta de la Clínica Villarroel.
Estás hablando con la Doctora (Administradora).
Contexto actual de la clínica:
- Pacientes totales registrados: ${patientCount || 0}
- Citas pendientes: ${pendingAppointments || 0}

Tu tono debe ser profesional, servicial y de colega. Ayúdala a gestionar su día.`
  } else {
    // Es un paciente. Extraemos SUS datos. RLS garantiza que no vea datos de otros.
    const { data: patient } = await supabase.from('Patient').select('*').eq('profileId', user.id).single()
    
    if (patient) {
      // Extraemos próximas citas del paciente
      const { data: appointments } = await supabase
        .from('Appointment')
        .select('startsAt, type, status')
        .eq('patientId', patient.id)
        .gte('startsAt', new Date().toISOString())
        .order('startsAt', { ascending: true })
        .limit(2)

      const appointmentsText = appointments && appointments.length > 0 
        ? appointments.map(a => `- ${a.type} el ${new Date(a.startsAt).toLocaleString()}`).join('\\n')
        : 'Ninguna cita próxima.'

      systemContext = `Eres Muelita, la IA asistente y mascota amigable de la Clínica Odontológica Villarroel.
Estás hablando con el paciente: ${patient.firstName} ${patient.lastName}.
Tono: Amigable, empático, claro y profesional. Nunca des diagnósticos médicos definitivos, siempre recomienda consultar presencialmente a la Dra. Villarroel.

Contexto del paciente:
- Edad: ${Math.floor((Date.now() - new Date(patient.dob).getTime()) / 31557600000)} años.
- Estado: ${patient.status}
- Próximas citas:
${appointmentsText}

REGLA DE ORO: Tienes estrictamente prohibido mencionar o revelar información de cualquier otra persona o paciente. Si se te pregunta por otro paciente, responde cortésmente que por políticas de privacidad médica solo puedes hablar de la ficha del usuario actual.`
    } else {
      systemContext = `Eres Muelita, asistente de Clínica Villarroel. Estás hablando con un usuario registrado cuya ficha clínica aún no ha sido vinculada. Pídele amablemente que contacte a recepción.`
    }
  }

  // 3. Streaming con Gemini
  const result = await streamText({
    model: google('gemini-1.5-flash'), // Requiere GOOGLE_GENERATIVE_AI_API_KEY
    system: systemContext,
    messages,
  })

  return result.toDataStreamResponse()
}
