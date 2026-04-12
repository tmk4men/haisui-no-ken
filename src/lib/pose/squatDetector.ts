import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { ExerciseDetector, RepEvent } from "@/lib/exercise/detector";
import type { SquatQuality } from "@/types/game";
import { angleDeg, L, visibility } from "./geometry";

const STANDING = 160, DOWN = 95, DEEP = 75, MIN_REP_MS = 600, FAST_MS = 900;

type Phase = "standing" | "descending" | "down" | "rising";

export type SquatFormIssue = "kneeOverToe" | "backLean" | "tooShallow";

export class SquatDetector implements ExerciseDetector<SquatQuality> {
  id = "squat"; label = "スクワット";
  private phase: Phase = "standing";
  private lastAngle = 180;
  private lastRepAt = 0;
  private descendAt = 0;
  private minAngle = 180;
  private maxKneeForward = 0;
  private maxBackLean = 0;
  lastIssues: SquatFormIssue[] = [];

  reset() {
    this.phase = "standing"; this.lastAngle = 180; this.lastRepAt = 0;
    this.descendAt = 0; this.minAngle = 180; this.maxKneeForward = 0; this.maxBackLean = 0;
    this.lastIssues = [];
  }

  update(lm: NormalizedLandmark[], t: number) {
    if (visibility(lm, [L.L_KNEE, L.R_KNEE, L.L_HIP, L.R_HIP]) < 0.5)
      return { phase: this.phase, displayMetric: this.lastAngle };

    const lAng = angleDeg(lm[L.L_HIP], lm[L.L_KNEE], lm[L.L_ANKLE]);
    const rAng = angleDeg(lm[L.R_HIP], lm[L.R_KNEE], lm[L.R_ANKLE]);
    const avg = (lAng + rAng) / 2;
    const delta = avg - this.lastAngle;
    this.lastAngle = avg;
    if (avg < this.minAngle) this.minAngle = avg;

    // フォーム指標
    const kneeForward = Math.max(lm[L.L_KNEE].x - lm[L.L_ANKLE].x, lm[L.R_KNEE].x - lm[L.R_ANKLE].x);
    if (kneeForward > this.maxKneeForward) this.maxKneeForward = kneeForward;
    const backAng = (angleDeg(lm[L.L_SHOULDER], lm[L.L_HIP], lm[L.L_KNEE]) + angleDeg(lm[L.R_SHOULDER], lm[L.R_HIP], lm[L.R_KNEE])) / 2;
    const backLean = Math.max(0, 150 - backAng);
    if (backLean > this.maxBackLean) this.maxBackLean = backLean;

    let rep: RepEvent<SquatQuality> | undefined;

    switch (this.phase) {
      case "standing":
        if (avg < STANDING) { this.phase = "descending"; this.descendAt = t; this.minAngle = avg; this.maxKneeForward = 0; this.maxBackLean = 0; }
        break;
      case "descending":
        if (avg < DOWN) this.phase = "down";
        else if (delta > 2 && avg > STANDING) this.phase = "standing";
        break;
      case "down":
        if (delta > 0 && avg > DOWN + 5) this.phase = "rising";
        break;
      case "rising":
        if (avg >= STANDING) {
          if (this.minAngle < DOWN && t - this.lastRepAt > MIN_REP_MS) {
            const duration = t - this.descendAt;
            let quality: SquatQuality = "good";
            if (this.minAngle > DOWN) quality = "shallow";
            else if (duration < FAST_MS) quality = "fast";
            else if (this.minAngle < DEEP) quality = "deep";
            const issues: SquatFormIssue[] = [];
            if (this.maxKneeForward > 0.08) issues.push("kneeOverToe");
            if (this.maxBackLean > 30) issues.push("backLean");
            if (this.minAngle > 100) issues.push("tooShallow");
            this.lastIssues = issues;
            rep = { quality, meta: { minAngle: this.minAngle, durationMs: duration } };
            this.lastRepAt = t;
          }
          this.phase = "standing"; this.minAngle = 180;
        } else if (delta < -2 && avg < DOWN) this.phase = "down";
        break;
    }
    return { phase: this.phase, displayMetric: avg, rep };
  }
}

export const SQUAT_FORM_MSG: Record<SquatFormIssue, string> = {
  kneeOverToe: "膝が前に出過ぎ。腰を引け。",
  backLean: "背中が倒れすぎ。胸張れ。",
  tooShallow: "浅い。もっと沈め。",
};
