import { Point } from "../geometry";
import { LandmarkKey } from "../landmarks";

export interface MeasurementDefinition {
  key: string;
  label: string;
  unit: "deg" | "mm";
  norm: number;
  sd: number;
  calc: (points: Record<LandmarkKey, Point>, pixelsPerMm: number) => number;
}

export interface AnalysisDefinition {
  key: string; // "steiner", "ricketts", "mcnamara"...
  label: string;
  version: string; // subir este numero si se corrige una formula clinica
  requiredLandmarks: LandmarkKey[];
  measurements: MeasurementDefinition[];
}
