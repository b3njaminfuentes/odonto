export interface Point { x: number; y: number; }

/** Distancia euclidiana en las mismas unidades que los puntos (normalmente px normalizados) */
export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/** Distancia real en mm, usando el factor de calibración pixelsPerMm */
export function distanceMm(p1: Point, p2: Point, pixelsPerMm: number): number {
  return distance(p1, p2) / pixelsPerMm;
}

/** Ángulo (en grados) formado en 'vertex' por los segmentos vertex-p1 y vertex-p2 */
export function angleAtVertex(p1: Point, vertex: Point, p2: Point): number {
  const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
  const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (mag === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Ángulo agudo (0-90) entre dos líneas definidas por pares de puntos — útil para FMA, interincisal, etc. */
export function angleBetweenLines(a: [Point, Point], b: [Point, Point]): number {
  const angA = Math.atan2(a[1].y - a[0].y, a[1].x - a[0].x);
  const angB = Math.atan2(b[1].y - b[0].y, b[1].x - b[0].x);
  let diff = Math.abs(((angA - angB) * 180) / Math.PI);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/** Proyección ortogonal de un punto p sobre la recta a-b */
export function projectPointOnLine(p: Point, a: Point, b: Point): Point {
  const abx = b.x - a.x, aby = b.y - a.y;
  const lenSq = abx * abx + aby * aby;
  const t = lenSq === 0 ? 0 : ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq;
  return { x: a.x + t * abx, y: a.y + t * aby };
}

/** Distancia con signo de p a la recta a-b (positivo = a la derecha del vector a->b) */
export function signedDistanceToLine(p: Point, a: Point, b: Point): number {
  const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  const len = distance(a, b);
  return len === 0 ? 0 : cross / len;
}
