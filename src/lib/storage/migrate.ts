import { GameState, SquatSession } from "@/types/game";
import { STATE_VERSION } from "@/lib/game/constants";

type AnyRec = Record<string, unknown>;
type LegacySquat = { id?: string; date?: string; reps: number; createdAt?: number; qualityCounts?: SquatSession["qualityCounts"]; bodyGained?: number };

export function migrate(raw: AnyRec): GameState {
  const state = { ...raw } as AnyRec;
  const v = (state.version as number | undefined) ?? 1;

  if (v < 2) {
    const legacy = (state.squats ?? []) as LegacySquat[];
    state.squats = legacy.map(s => ({
      id: s.id ?? Math.random().toString(36).slice(2),
      date: s.date ?? "1970-01-01",
      reps: s.reps,
      createdAt: s.createdAt ?? Date.now(),
      qualityCounts: s.qualityCounts ?? { good: s.reps, deep: 0, fast: 0, shallow: 0 },
      bodyGained: s.bodyGained ?? s.reps * 0.1,
    }));
    state.missions = state.missions ?? {};
    state.buffs = state.buffs ?? [];
    state.winStreak = state.winStreak ?? 0;
  }
  if (v < 3) {
    state.pushups = state.pushups ?? [];
    state.planks = state.planks ?? [];
    state.achievements = state.achievements ?? {};
    state.settings = state.settings ?? { reminderEnabled: false, reminderTime: "20:00" };
    const char = (state.character ?? {}) as AnyRec;
    char.skillPoints = (char.skillPoints as number | undefined) ?? 0;
    char.skills = (char.skills as string[] | undefined) ?? [];
    char.equipmentUnlocked = (char.equipmentUnlocked as string[] | undefined) ?? [];
    state.character = char;
  }

  state.version = STATE_VERSION;
  return state as unknown as GameState;
}
