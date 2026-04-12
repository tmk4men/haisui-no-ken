export const STATE_VERSION = 3;

export const GROWTH = {
  bodyPerSquatBase: 0.1,
  bodyPerPushupBase: 0.12,
  bodyPerPlankSec: 0.02,
  qualityMultiplier: { good: 1.0, deep: 1.5, fast: 0.6, shallow: 0.3 } as const,
  revengeBonus: 1.2,
  mindPerStudyMinute: 0.05,
  disciplinePerActiveDay: 0.2,
};

export const EXP_PER_LEVEL = 100;

export const DERIVED_COEFF = {
  hp: { body: 2 },
  attack: { body: 1.2 },
  defense: { body: 1.0 },
  magic: { mind: 1.5 },
  focus: { mind: 0.8, discipline: 0.5 },
  speed: { body: 0.5, discipline: 0.7 },
};

export const BATTLE = {
  critBaseChance: 0.05,
  critFocusDivisor: 200,
  critDamageMult: 1.8,
  dodgeSpeedDivisor: 300,
  dodgeMaxChance: 0.25,
  weaknessMult: 1.5,
  resistMult: 0.6,
  winStreakBonusPerWin: 0.1,
  winStreakBonusCap: 1.5,
  firstKillBonusMult: 1.5,
};

export const MISSION_TEMPLATES = [
  { type: "squat", goal: 20, rewardExp: 15, rewardDiscipline: 0.1 },
  { type: "study", goal: 30, rewardExp: 15, rewardDiscipline: 0.1 },
  { type: "battleWin", goal: 1, rewardExp: 20, rewardDiscipline: 0.1 },
  { type: "pushup", goal: 15, rewardExp: 15, rewardDiscipline: 0.1 },
  { type: "plank", goal: 60, rewardExp: 15, rewardDiscipline: 0.1 },
] as const;

export const SKILL_POINT_EVERY_N_LEVELS = 5;
