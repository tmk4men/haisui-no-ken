import { GameState } from "@/types/game";

export type Achievement = {
  id: string;
  name: string;
  desc: string;
  check: (s: GameState) => boolean;
};

const sum = <T,>(arr: T[], f: (x: T) => number) => arr.reduce((a, x) => a + f(x), 0);

export const ACHIEVEMENTS: Achievement[] = [
  { id: "firstBlood", name: "初陣", desc: "初めての勝利",
    check: s => s.battles.some(b => b.result === "win") },
  { id: "squat100", name: "腿に鉄", desc: "累計スクワット100回",
    check: s => sum(s.squats, x => x.reps) >= 100 },
  { id: "squat500", name: "鉄の路", desc: "累計スクワット500回",
    check: s => sum(s.squats, x => x.reps) >= 500 },
  { id: "study600", name: "読み切り", desc: "累計勉強10時間",
    check: s => sum(s.studies, x => x.minutes) >= 600 },
  { id: "streak7", name: "七日連続", desc: "7日連続で活動",
    check: s => s.streak >= 7 },
  { id: "streak30", name: "一ヶ月不退転", desc: "30日連続で活動",
    check: s => s.streak >= 30 },
  { id: "winStreak5", name: "無敗の五戦", desc: "5連勝",
    check: s => s.winStreak >= 5 },
  { id: "allChapters", name: "全章制覇", desc: "全ての敵を倒す",
    check: s => new Set(s.battles.filter(b => b.result === "win").map(b => b.enemyId)).size >= 10 },
  { id: "deepMaster", name: "深みの男", desc: "Deep スクワット累計50回",
    check: s => sum(s.squats, x => x.qualityCounts.deep) >= 50 },
  { id: "plank180", name: "三分の我慢", desc: "プランク180秒を1回",
    check: s => s.planks.some(p => p.durationSec >= 180) },
];

export function evaluateAchievements(state: GameState): { state: GameState; newly: Achievement[] } {
  const now = Date.now();
  const newly: Achievement[] = [];
  const achievements = { ...state.achievements };
  for (const a of ACHIEVEMENTS) {
    if (!achievements[a.id] && a.check(state)) {
      achievements[a.id] = now;
      newly.push(a);
    }
  }
  return { state: { ...state, achievements }, newly };
}
