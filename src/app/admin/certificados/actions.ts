'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

export async function rotateCertificate(filename: string, newRotationClass: string) {
  try {
    const certsPath = path.join(process.cwd(), 'src', 'data', 'certificates.ts')
    let content = fs.readFileSync(certsPath, 'utf-8')
    
    // We need to parse the JSON portion of the file, update it, and write it back
    // The file exports certificatesData: Certificate[] = [...]
    const match = content.match(/export const certificatesData: Certificate\[\] = (\[.*\]);/s)
    if (match && match[1]) {
      const certs = JSON.parse(match[1])
      const certIndex = certs.findIndex((c: any) => c.filename === filename)
      if (certIndex !== -1) {
        certs[certIndex].rotationClass = newRotationClass
        
        // Re-generate file content
        const newContent = content.replace(
          /export const certificatesData: Certificate\[\] = \[.*\];/s,
          `export const certificatesData: Certificate[] = ${JSON.stringify(certs, null, 2)};`
        )
        
        fs.writeFileSync(certsPath, newContent)
        
        // Let Next.js know to reload the pages using this data (dev mode will automatically restart anyway)
        revalidatePath('/')
        revalidatePath('/admin/certificados')
        return { success: true }
      }
    }
    
    return { success: false, error: 'Certificate not found in data file' }
  } catch (error: any) {
    console.error('Error rotating file:', error)
    return { success: false, error: error.message }
  }
}
