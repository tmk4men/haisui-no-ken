import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { ExerciseDetector, RepEvent } from "@/lib/exercise/detector";
import type { SquatQuality } from "@/types/game";
import { angleDeg, L, visibility } from "./geometry";

const UP = 160, DOWN = 90, DEEP = 75, MIN_REP_MS = 500, FAST_MS = 700;

type Phase = "up" | "descending" | "down" | "rising";

export class PushupDetector implements ExerciseDetector<SquatQuality> {
  id = "pushup"; label = "腕立て";
  private phase: Phase = "up";
  private lastAngle = 180;
  private lastRepAt = 0;
  private descendAt = 0;
  private minAngle = 180;

  reset() { this.phase = "up"; this.lastAngle = 180; this.lastRepAt = 0; this.descendAt = 0; this.minAngle = 180; }

  update(lm: NormalizedLandmark[], t: number) {
    if (visibility(lm, [L.L_ELBOW, L.R_ELBOW, L.L_SHOULDER, L.R_SHOULDER]) < 0.4)
      return { phase: this.phase, displayMetric: this.lastAngle };
    const lAng = angleDeg(lm[L.L_SHOULDER], lm[L.L_ELBOW], lm[L.L_WRIST]);
    const rAng = angleDeg(lm[L.R_SHOULDER], lm[L.R_ELBOW], lm[L.R_WRIST]);
    const avg = (lAng + rAng) / 2;
    const delta = avg - this.lastAngle;
    this.lastAngle = avg;
    if (avg < this.minAngle) this.minAngle = avg;

    let rep: RepEvent<SquatQuality> | undefined;
    switch (this.phase) {
      case "up":
        if (avg < UP) { this.phase = "descending"; this.descendAt = t; this.minAngle = avg; }
        break;
      case "descending":
        if (avg < DOWN) this.phase = "down";
        else if (delta > 2 && avg > UP) this.phase = "up";
        break;
      case "down":
        if (delta > 0 && avg > DOWN + 5) this.phase = "rising";
        break;
      case "rising":
        if (avg >= UP) {
          if (this.minAngle < DOWN && t - this.lastRepAt > MIN_REP_MS) {
            const duration = t - this.descendAt;
            let q: SquatQuality = "good";
            if (this.minAngle > DOWN) q = "shallow";
            else if (duration < FAST_MS) q = "fast";
            else if (this.minAngle < DEEP) q = "deep";
            rep = { quality: q };
            this.lastRepAt = t;
          }
          this.phase = "up"; this.minAngle = 180;
        } else if (delta < -2 && avg < DOWN) this.phase = "down";
        break;
    }
    return { phase: this.phase, displayMetric: avg, rep };
  }
}
