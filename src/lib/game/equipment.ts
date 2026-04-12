import { DerivedStats } from "@/types/game";

export type Equipment = {
  id: string;
  name: string;
  desc: string;
  flavor: string;
  unlock: { type: "totalSquats" | "totalStudyMin" | "wins" | "level"; value: number };
  mod: Partial<DerivedStats>;
};

export const EQUIPMENT: Equipment[] = [
  { id: "sarashi", name: "晒し", desc: "体力 +10 / 受け +3", flavor: "腹に巻いた布は、気合いの証。",
    unlock: { type: "totalSquats", value: 50 }, mod: { hp: 10, defense: 3 } },
  { id: "gekkaken", name: "月牙の拳套", desc: "剛撃 +4 / 機敏 +2", flavor: "月の下で磨いた。",
    unlock: { type: "wins", value: 5 }, mod: { attack: 4, speed: 2 } },
  { id: "reimegane", name: "冷眼の眼鏡", desc: "知略 +5 / 眼力 +3", flavor: "読み切るために。",
    unlock: { type: "totalStudyMin", value: 300 }, mod: { magic: 5, focus: 3 } },
  { id: "haisui", name: "背水のタスキ", desc: "全能力+3", flavor: "後ろはもう無い。",
    unlock: { type: "level", value: 10 }, mod: { hp: 3, attack: 3, defense: 3, magic: 3, speed: 3, focus: 3 } },
];

export function applyEquipmentMod(derived: DerivedStats, eqId?: string): DerivedStats {
  if (!eqId) return derived;
  const eq = EQUIPMENT.find(e => e.id === eqId);
  if (!eq) return derived;
  return {
    hp: derived.hp + (eq.mod.hp ?? 0),
    attack: derived.attack + (eq.mod.attack ?? 0),
    defense: derived.defense + (eq.mod.defense ?? 0),
    magic: derived.magic + (eq.mod.magic ?? 0),
    speed: derived.speed + (eq.mod.speed ?? 0),
    focus: derived.focus + (eq.mod.focus ?? 0),
  };
}

export function checkUnlocks(stats: {
  totalSquats: number;
  totalStudyMin: number;
  wins: number;
  level: number;
}): string[] {
  return EQUIPMENT.filter(e => stats[e.unlock.type] >= e.unlock.value).map(e => e.id);
}
