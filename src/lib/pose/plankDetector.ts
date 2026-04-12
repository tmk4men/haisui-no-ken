import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { angleDeg, L, visibility } from "./geometry";

// プランクは「体が一直線 (shoulder-hip-ankle 角度 ~170°) を保てているか」を秒数で計測
export class PlankDetector {
  id = "plank";
  label = "プランク";
  private accumMs = 0;
  private lastTs: number | null = null;
  private holding = false;

  reset() { this.accumMs = 0; this.lastTs = null; this.holding = false; }

  update(lm: NormalizedLandmark[], t: number): { holding: boolean; durationSec: number } {
    if (visibility(lm, [L.L_SHOULDER, L.L_HIP, L.L_ANKLE]) < 0.5) {
      this.holding = false; this.lastTs = t;
      return { holding: false, durationSec: this.accumMs / 1000 };
    }
    const l = angleDeg(lm[L.L_SHOULDER], lm[L.L_HIP], lm[L.L_ANKLE]);
    const r = angleDeg(lm[L.R_SHOULDER], lm[L.R_HIP], lm[L.R_ANKLE]);
    const avg = (l + r) / 2;
    const holding = avg > 160;
    if (this.lastTs !== null && holding && this.holding) this.accumMs += t - this.lastTs;
    this.holding = holding; this.lastTs = t;
    return { holding, durationSec: this.accumMs / 1000 };
  }

  getDurationSec() { return this.accumMs / 1000; }
}
