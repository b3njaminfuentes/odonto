/**
 * ClinicOS — Servicio de Notificación y Bienvenida
 */

export interface WelcomeEmailData {
  doctorName: string
  clinicName: string
  email: string
  tempPassword?: string
  planName: string
  trialDays: number
  loginUrl: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; error?: string }> {
  console.log(`[Email Service] Enviando correo de bienvenida a ${data.email} (${data.clinicName})...`)
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
        .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 999px; font-weight: 600; font-size: 12px; display: inline-block; }
        .btn { display: inline-block; background: #0F6E56; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="color: #0F6E56; margin: 0;">ClinicOS</h1>
          <p style="color: #64748b; margin: 4px 0 0;">El Sistema Operativo para tu Clínica Dental</p>
        </div>

        <h2>¡Bienvenido/a, ${data.doctorName}!</h2>
        <p>Tu clínica <strong>${data.clinicName}</strong> ya está configurada y lista para comenzar a operar.</p>
        
        <div class="badge">✨ Prueba Gratuita de ${data.trialDays} Días Activa (Plan ${data.planName})</div>

        <div class="box">
          <h3 style="margin-top: 0;">Tus Datos de Acceso:</h3>
          <p style="margin: 6px 0;"><strong>URL de Acceso:</strong> <a href="${data.loginUrl}">${data.loginUrl}</a></p>
          <p style="margin: 6px 0;"><strong>Usuario / Email:</strong> ${data.email}</p>
          ${data.tempPassword ? `<p style="margin: 6px 0;"><strong>Contraseña:</strong> ${data.tempPassword}</p>` : ''}
        </div>

        <div style="text-align: center;">
          <a href="${data.loginUrl}" class="btn" style="color: #ffffff;">Ingresar a mi Panel Médico →</a>
        </div>

        <h3>Primeros Pasos Recomendados:</h3>
        <ol style="line-height: 1.8; color: #334155;">
          <li><strong>Agenda:</strong> Revisa tu calendario y crea tu primer turno de prueba.</li>
          <li><strong>Pacientes:</strong> Registra un paciente y prueba el odontograma interactivo.</li>
          <li><strong>Cefalometría con IA:</strong> Sube una teleradiografía para obtener trazados automáticos.</li>
          <li><strong>Guía de Uso:</strong> Recuerda que dentro de tu panel tienes el botón <strong>(?) Centro de Ayuda</strong> disponible 24/7.</li>
        </ol>

        <div class="footer">
          <p>© 2026 ClinicOS · Soporte prioritario para profesionales dentales.</p>
        </div>
      </div>
    </body>
    </html>
  `

  // En producción se conecta con Resend o SendGrid mediante RESEND_API_KEY
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'ClinicOS <soporte@clinicos.app>',
          to: data.email,
          subject: `¡Bienvenido a ClinicOS! Accesos para ${data.clinicName}`,
          html: htmlContent
        })
      })
      if (!res.ok) {
        console.warn('[Email Service] Error enviando via Resend API:', await res.text())
      }
    } catch (e) {
      console.error('[Email Service] Excepción al enviar correo:', e)
    }
  }

  return { success: true }
}
