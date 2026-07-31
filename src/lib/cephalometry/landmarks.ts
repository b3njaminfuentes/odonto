// Superset de landmarks que la UI permite marcar. Un analisis puntual (Steiner, Ricketts...)
// solo usa un subconjunto — ver requiredLandmarks en cada AnalysisDefinition.
export const LANDMARK_REGISTRY = [
  { key: "S", label: "Sella" },
  { key: "N", label: "Nasion" },
  { key: "Or", label: "Orbitale" },
  { key: "Po", label: "Porion" },
  { key: "A", label: "Punto A (subespinal)" },
  { key: "B", label: "Punto B (supramental)" },
  { key: "Pog", label: "Pogonion" },
  { key: "Gn", label: "Gnathion" },
  { key: "Me", label: "Menton" },
  { key: "Go", label: "Gonion" },
  { key: "Ar", label: "Articulare" },
  { key: "ANS", label: "Espina nasal anterior" },
  { key: "PNS", label: "Espina nasal posterior" },
  { key: "U1", label: "Incisivo superior - borde incisal" },
  { key: "U1a", label: "Incisivo superior - ápice" },
  { key: "L1", label: "Incisivo inferior - borde incisal" },
  { key: "L1a", label: "Incisivo inferior - ápice" },
  { key: "UL", label: "Labio superior" },
  { key: "LL", label: "Labio inferior" },
  // Reservados para analisis futuros (Ricketts/McNamara) - agregar formulas cuando se implementen:
  { key: "Cd", label: "Condylion" },
  { key: "Xi", label: "Centro geometrico de la rama mandibular" },
  { key: "Pm", label: "Protuberancia mentoniana" },
  { key: "Ptm", label: "Fisura pterigomaxilar" },
] as const;

export type LandmarkKey = typeof LANDMARK_REGISTRY[number]["key"];
