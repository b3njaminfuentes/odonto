import { TZDate } from '@date-fns/tz'

/** Huso horario de la clínica: todo se muestra en hora de La Paz, Bolivia, sin importar dónde corra el servidor. */
export const BOLIVIA_TZ = 'America/La_Paz'

/** Convierte cualquier fecha/ISO a un objeto Date anclado a la hora de Bolivia, listo para usar con date-fns `format()`. */
export function toBO(date: string | number | Date): TZDate {
  return new TZDate(date, BOLIVIA_TZ)
}

/** Intl.DateTimeFormat pre-configurado en es-BO + huso horario de La Paz. */
export function intlBO(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('es-BO', { ...options, timeZone: BOLIVIA_TZ })
}
