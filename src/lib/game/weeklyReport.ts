import { GameState } from "@/types/game";
import { addDays, todayKey } from "./date";

export type WeeklyReport = {
  from: string; to: string;
  squats: number; pushups: number; plankSec: number; studyMin: number;
  wins: number; losses: number; expGained: number;
  activeDays: number;
  bodyGained: number; mindGained: number;
};

export function buildWeeklyReport(s: GameState, endKey = todayKey()): WeeklyReport {
  const days = Array.from({ length: 7 }, (_, i) => addDays(endKey, -(6 - i)));
  const inRange = (d: string) => days.includes(d);
  const squatList = s.squats.filter(x => inRange(x.date));
  const pushupList = s.pushups.filter(x => inRange(x.date));
  const plankList = s.planks.filter(x => inRange(x.date));
  const studyList = s.studies.filter(x => inRange(x.date));
  const battleList = s.battles.filter(x => inRange(new Date(x.createdAt).toISOString().slice(0, 10)));
  return {
    from: days[0], to: days[6],
    squats: squatList.reduce((a, x) => a + x.reps, 0),
    pushups: pushupList.reduce((a, x) => a + x.reps, 0),
    plankSec: plankList.reduce((a, x) => a + x.durationSec, 0),
    studyMin: studyList.reduce((a, x) => a + x.minutes, 0),
    wins: battleList.filter(x => x.result === "win").length,
    losses: battleList.filter(x => x.result === "lose").length,
    expGained: battleList.reduce((a, x) => a + x.expGained, 0),
    activeDays: days.filter(d => s.dailies[d]?.didTrain || s.dailies[d]?.didStudy).length,
    bodyGained: squatList.reduce((a, x) => a + x.bodyGained, 0) + pushupList.reduce((a, x) => a + x.bodyGained, 0) + plankList.reduce((a, x) => a + x.bodyGained, 0),
    mindGained: studyList.reduce((a, x) => a + x.minutes * 0.05, 0),
  };
}

export function shouldShowWeeklyReport(s: GameState): boolean {
  const today = new Date();
  if (today.getDay() !== 0) return false; // 日曜のみ
  const t = todayKey();
  return s.lastWeeklyReportDate !== t;
}
