import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type RepEvent<Q extends string = string> = {
  quality: Q;
  meta?: Record<string, number>;
};

export interface ExerciseDetector<Q extends string = string> {
  id: string;
  label: string;
  reset(): void;
  update(landmarks: NormalizedLandmark[], timestamp: number): {
    phase: string;
    displayMetric: number; // 表示用の主要数値（角度など）
    rep?: RepEvent<Q>;
  };
}
