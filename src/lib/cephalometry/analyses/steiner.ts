import { angleAtVertex, angleBetweenLines, distanceMm } from "../geometry";
import { AnalysisDefinition } from "./types";

export const steinerAnalysis: AnalysisDefinition = {
  key: "steiner",
  label: "Steiner",
  version: "1.0.0",
  requiredLandmarks: ["S", "N", "A", "B", "Po", "Or", "Go", "Me", "U1", "U1a", "L1", "L1a"],
  measurements: [
    { key: "SNA", label: "SNA", unit: "deg", norm: 82, sd: 2,
      calc: (p) => angleAtVertex(p.S, p.N, p.A) },
    { key: "SNB", label: "SNB", unit: "deg", norm: 80, sd: 2,
      calc: (p) => angleAtVertex(p.S, p.N, p.B) },
    { key: "ANB", label: "ANB", unit: "deg", norm: 2, sd: 2,
      calc: (p) => angleAtVertex(p.S, p.N, p.A) - angleAtVertex(p.S, p.N, p.B) },
    { key: "FMA", label: "Plano Frankfort-Mandibular", unit: "deg", norm: 25, sd: 4,
      calc: (p) => angleBetweenLines([p.Po, p.Or], [p.Go, p.Me]) },
    { key: "interincisal", label: "Angulo interincisal", unit: "deg", norm: 130, sd: 6,
      calc: (p) => angleBetweenLines([p.U1, p.U1a], [p.L1, p.L1a]) },
    { key: "IMPA", label: "IMPA (incisivo inf. a plano mandibular)", unit: "deg", norm: 90, sd: 4,
      calc: (p) => angleBetweenLines([p.L1, p.L1a], [p.Go, p.Me]) },
    { key: "overjetRaw", label: "Overjet (aproximado, TODO revisar proyeccion)", unit: "mm", norm: 2, sd: 2,
      calc: (p, mm) => distanceMm(p.U1, p.L1, mm) },
  ],
};
