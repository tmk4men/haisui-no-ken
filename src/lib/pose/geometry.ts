import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type Point = { x: number; y: number; visibility?: number };

export function angleDeg(a: Point, b: Point, c: Point): number {
  const v1x = a.x - b.x, v1y = a.y - b.y;
  const v2x = c.x - b.x, v2y = c.y - b.y;
  const dot = v1x * v2x + v1y * v2y;
  const n1 = Math.hypot(v1x, v1y);
  const n2 = Math.hypot(v2x, v2y);
  if (n1 === 0 || n2 === 0) return 180;
  return (Math.acos(Math.max(-1, Math.min(1, dot / (n1 * n2)))) * 180) / Math.PI;
}

export const L = {
  NOSE: 0, L_SHOULDER: 11, R_SHOULDER: 12, L_ELBOW: 13, R_ELBOW: 14,
  L_WRIST: 15, R_WRIST: 16, L_HIP: 23, R_HIP: 24, L_KNEE: 25, R_KNEE: 26,
  L_ANKLE: 27, R_ANKLE: 28,
};

export function visibility(landmarks: NormalizedLandmark[], idx: number[]): number {
  const vs = idx.map(i => landmarks[i]?.visibility ?? 0);
  return vs.reduce((a, b) => a + b, 0) / vs.length;
}
