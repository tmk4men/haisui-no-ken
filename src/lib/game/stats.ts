import { BaseStats, Character, DerivedStats } from "@/types/game";
import { DERIVED_COEFF, EXP_PER_LEVEL, SKILL_POINT_EVERY_N_LEVELS } from "./constants";
import { applySkills } from "./skills";
import { applyEquipmentMod } from "./equipment";

export function deriveStatsRaw(base: BaseStats): DerivedStats {
  const r = Math.round;
  return {
    hp: r(base.body * DERIVED_COEFF.hp.body + 20),
    attack: r(base.body * DERIVED_COEFF.attack.body + 5),
    defense: r(base.body * DERIVED_COEFF.defense.body + 3),
    magic: r(base.mind * DERIVED_COEFF.magic.mind + 3),
    focus: r(base.mind * DERIVED_COEFF.focus.mind + base.discipline * DERIVED_COEFF.focus.discipline),
    speed: r(base.body * DERIVED_COEFF.speed.body + base.discipline * DERIVED_COEFF.speed.discipline + 5),
  };
}

export function deriveCharacterStats(ch: Character): { derived: DerivedStats; critBonus: number; bodyMult: number; mindMult: number; expMult: number } {
  const derived = { ...deriveStatsRaw(ch.base) };
  const ctx: { derived: DerivedStats; critBonus?: number; bodyMult?: number; mindMult?: number; expMult?: number } = { derived };
  applySkills(ch.skills, ctx);
  const withEq = applyEquipmentMod(ctx.derived, ch.equippedId);
  return {
    derived: withEq,
    critBonus: ctx.critBonus ?? 0,
    bodyMult: ctx.bodyMult ?? 1,
    mindMult: ctx.mindMult ?? 1,
    expMult: ctx.expMult ?? 1,
  };
}

export function levelFromExp(exp: number): number {
  return 1 + Math.floor(exp / EXP_PER_LEVEL);
}

export function skillPointsEarned(level: number): number {
  return Math.floor(level / SKILL_POINT_EVERY_N_LEVELS);
}

// 互換エイリアス
export const deriveStats = deriveStatsRaw;
