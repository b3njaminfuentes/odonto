'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

const certsDir = path.join(process.cwd(), 'public', 'certificates')

export async function getUnmappedImages() {
  try {
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true })
      return []
    }

    const files = fs.readdirSync(certsDir)
    // Devolver solo imagenes que NO sigan el patron que yo asigne (ej: master-ortodoncia.jpg)
    // O mejor, devolvemos todas y que el frontend las filtre.
    return files.filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i))
  } catch (error) {
    console.error('Error reading certs dir:', error)
    return []
  }
}

export async function renameImage(oldFilename: string, newFilename: string) {
  try {
    const oldPath = path.join(certsDir, oldFilename)
    const newPath = path.join(certsDir, newFilename)

    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath)
      revalidatePath('/admin/certificados')
      revalidatePath('/')
      return { success: true }
    }
    return { success: false, error: 'File not found' }
  } catch (error: any) {
    console.error('Error renaming file:', error)
    return { success: false, error: error.message }
  }
}
