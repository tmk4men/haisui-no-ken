import { DerivedStats } from "@/types/game";
import { TECHNIQUES } from "./techniques";

export type Skill = {
  id: string;
  name: string;
  desc: string;
  kind: "growth" | "derived" | "battle" | "technique";
  apply: (ctx: { derived?: DerivedStats; bodyMult?: number; mindMult?: number; expMult?: number; critBonus?: number }) => void;
};

export const SKILLS: Skill[] = [
  { id: "ironFist", name: "鉄拳", desc: "剛撃+20%", kind: "derived",
    apply: (c) => { if (c.derived) c.derived.attack = Math.round(c.derived.attack * 1.2); } },
  { id: "steelGut", name: "鋼の肚", desc: "体力+25%", kind: "derived",
    apply: (c) => { if (c.derived) c.derived.hp = Math.round(c.derived.hp * 1.25); } },
  { id: "coldBlood", name: "冷血", desc: "クリティカル確率+8%", kind: "battle",
    apply: (c) => { c.critBonus = (c.critBonus ?? 0) + 0.08; } },
  { id: "swift", name: "疾風", desc: "機敏+30%", kind: "derived",
    apply: (c) => { if (c.derived) c.derived.speed = Math.round(c.derived.speed * 1.3); } },
  { id: "diligent", name: "勤勉", desc: "勉強時の頭上昇+20%", kind: "growth",
    apply: (c) => { c.mindMult = (c.mindMult ?? 1) * 1.2; } },
  { id: "beast", name: "獣性", desc: "筋トレ時の拳上昇+20%", kind: "growth",
    apply: (c) => { c.bodyMult = (c.bodyMult ?? 1) * 1.2; } },
  { id: "hunter", name: "目利き", desc: "獲得EXP+15%", kind: "growth",
    apply: (c) => { c.expMult = (c.expMult ?? 1) * 1.15; } },
  // --- 戦闘技（バトル中に使用、気力消費） ---
  ...TECHNIQUES.map<Skill>(t => ({
    id: t.id,
    name: t.name,
    desc: `戦闘技・気力${t.cost}：${t.flavor}`,
    kind: "technique" as const,
    apply: () => {},
  })),
];

export function applySkills(skillIds: string[], ctx: Parameters<Skill["apply"]>[0]) {
  for (const id of skillIds) SKILLS.find(s => s.id === id)?.apply(ctx);
}
