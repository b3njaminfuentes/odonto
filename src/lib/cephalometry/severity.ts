/** Clasifica un valor contra su norma para el color del reporte (verde/naranja/rojo) */
export function classifySeverity(value: number, norm: number, sd: number): "normal" | "leve" | "severo" {
  const diff = Math.abs(value - norm);
  if (diff <= sd) return "normal";
  if (diff <= sd * 2) return "leve";
  return "severo";
}
