import { Point } from "../geometry";
import { LandmarkKey } from "../landmarks";
import { AnalysisDefinition } from "./types";
import { steinerAnalysis } from "./steiner";

const REGISTRY: Record<string, AnalysisDefinition> = {
  steiner: steinerAnalysis,
};

export const AnalysisEngine = {
  list(): AnalysisDefinition[] {
    return Object.values(REGISTRY);
  },

  /** Que landmarks faltan para poder correr un analisis - usalo en la UI para el checklist "17/17 listo" */
  missingLandmarks(analysisKey: string, landmarks: Partial<Record<LandmarkKey, Point>>): LandmarkKey[] {
    const def = REGISTRY[analysisKey];
    if (!def) throw new Error(`Analisis desconocido: ${analysisKey}`);
    return def.requiredLandmarks.filter((k) => !landmarks[k]);
  },

  /** Corre un analisis sobre un set de landmarks y devuelve un resultado versionado y listo para persistir */
  run(analysisKey: string, landmarks: Partial<Record<LandmarkKey, Point>>, pixelsPerMm: number) {
    const def = REGISTRY[analysisKey];
    if (!def) throw new Error(`Analisis desconocido: ${analysisKey}`);
    
    const missing = this.missingLandmarks(analysisKey, landmarks);
    if (missing.length > 0) {
      throw new Error(`Faltan landmarks para ${def.label}: ${missing.join(", ")}`);
    }

    const measurements: Record<string, number> = {};
    for (const m of def.measurements) {
      measurements[m.key] = m.calc(landmarks as Record<LandmarkKey, Point>, pixelsPerMm);
    }

    return {
      analysis: def.key,
      version: def.version,
      generatedAt: new Date().toISOString(),
      measurements,
    };
  },
};
