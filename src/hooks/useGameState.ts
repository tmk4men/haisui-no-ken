"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GameState, SquatSession, PushupSession, PlankSession, StudySession, BattleRecord, SquatQuality, DailyMission, MissionType } from "@/types/game";
import { localStorageAdapter } from "@/lib/storage/localStorageAdapter";
import { GROWTH, STATE_VERSION } from "@/lib/game/constants";
import { deriveCharacterStats, levelFromExp, skillPointsEarned } from "@/lib/game/stats";
import { todayKey, addDays, diffDays } from "@/lib/game/date";
import { generateDailyMissions, advanceMission } from "@/lib/game/missions";
import { evaluateAchievements, ACHIEVEMENTS, Achievement } from "@/lib/game/achievements";
import { checkUnlocks } from "@/lib/game/equipment";
import { ITEMS, WORLD_HP_MAX, WORLD_HP_RECOVER_MS } from "@/lib/game/items";
import { SKILLS } from "@/lib/game/skills";

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function initialState(): GameState {
  return {
    version: STATE_VERSION,
    worldHp: 5,
    worldHpMax: 5,
    worldHpLastRecoverAt: Date.now(),
    coins: 0,
    inventory: {},
    character: {
      id: uid(), name: "主人公", level: 1, exp: 0,
      base: { body: 0, mind: 0, discipline: 0 },
      skillPoints: 0, skills: [], equipmentUnlocked: [],
    },
    squats: [], pushups: [], planks: [], studies: [],
    dailies: {}, streak: 0, battles: [],
    winStreak: 0, missions: {}, buffs: [],
    achievements: {},
    settings: { reminderEnabled: false, reminderTime: "20:00" },
  };
}

function ensureTodayMissions(state: GameState): GameState {
  const today = todayKey();
  if (state.missions[today]) return state;
  const missions = { ...state.missions, [today]: generateDailyMissions(today) };
  const keep = new Set(Array.from({ length: 7 }, (_, i) => addDays(today, -i)));
  const pruned: GameState["missions"] = {};
  for (const [k, v] of Object.entries(missions)) if (keep.has(k)) pruned[k] = v;
  return { ...state, missions: pruned };
}

function tickWorldHp(state: GameState): GameState {
  const max = state.worldHpMax ?? WORLD_HP_MAX;
  if (state.worldHp >= max) {
    return state.worldHpLastRecoverAt ? state : { ...state, worldHpLastRecoverAt: Date.now() };
  }
  const now = Date.now();
  const last = state.worldHpLastRecoverAt ?? now;
  const elapsed = now - last;
  if (elapsed < WORLD_HP_RECOVER_MS) return state;
  const ticks = Math.min(max - state.worldHp, Math.floor(elapsed / WORLD_HP_RECOVER_MS));
  return {
    ...state,
    worldHp: Math.min(max, state.worldHp + ticks),
    worldHpLastRecoverAt: last + ticks * WORLD_HP_RECOVER_MS,
  };
}

function pruneBuffs(state: GameState): GameState {
  const today = todayKey();
  const buffs = state.buffs.filter(b => diffDays(b.expiresDate, today) >= 0);
  return buffs.length === state.buffs.length ? state : { ...state, buffs };
}

function updateStreak(state: GameState, wasActiveToday: boolean, nowActiveToday: boolean): GameState {
  if (wasActiveToday || !nowActiveToday) return state;
  const today = todayKey();
  const last = state.lastActiveDate;
  const streak = last
    ? (diffDays(today, last) === 1 ? state.streak + 1 : diffDays(today, last) === 0 ? state.streak : 1)
    : 1;
  return {
    ...state,
    streak,
    lastActiveDate: today,
    character: { ...state.character, base: { ...state.character.base, discipline: state.character.base.discipline + GROWTH.disciplinePerActiveDay } },
  };
}

function applyMissionProgress(state: GameState, type: MissionType, amount: number): GameState {
  const today = todayKey();
  const list = state.missions[today];
  if (!list) return state;
  let addExp = 0, addDiscipline = 0;
  const next = list.map(m => {
    const before = m.completed;
    const updated = advanceMission(m, type, amount);
    if (!before && updated.completed) { addExp += updated.rewardExp; addDiscipline += updated.rewardDiscipline; }
    return updated;
  });
  const newExp = state.character.exp + addExp;
  return {
    ...state,
    missions: { ...state.missions, [today]: next },
    character: {
      ...state.character, exp: newExp, level: levelFromExp(newExp),
      base: { ...state.character.base, discipline: state.character.base.discipline + addDiscipline },
    },
  };
}

function updateLevelAndSkillPoints(s: GameState, prevLevel: number): GameState {
  const level = s.character.level;
  if (level <= prevLevel) return s;
  const earnedBefore = skillPointsEarned(prevLevel);
  const earnedAfter = skillPointsEarned(level);
  const diff = earnedAfter - earnedBefore;
  if (diff <= 0) return s;
  return { ...s, character: { ...s.character, skillPoints: s.character.skillPoints + diff } };
}

function updateEquipmentUnlocks(s: GameState): GameState {
  const totalSquats = s.squats.reduce((a, x) => a + x.reps, 0) + s.pushups.reduce((a, x) => a + x.reps, 0);
  const totalStudyMin = s.studies.reduce((a, x) => a + x.minutes, 0);
  const wins = s.battles.filter(b => b.result === "win").length;
  const unlocks = checkUnlocks({ totalSquats, totalStudyMin, wins, level: s.character.level });
  const set = new Set([...s.character.equipmentUnlocked, ...unlocks]);
  if (set.size === s.character.equipmentUnlocked.length) return s;
  return { ...s, character: { ...s.character, equipmentUnlocked: Array.from(set) } };
}

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);
  const [newlyAchieved, setNewlyAchieved] = useState<Achievement[]>([]);

  useEffect(() => {
    const loaded = localStorageAdapter.load() ?? initialState();
    setState(tickWorldHp(pruneBuffs(ensureTodayMissions(loaded))));
  }, []);

  useEffect(() => { if (state) localStorageAdapter.save(state); }, [state]);

  const hasRevengeBuff = useCallback((s: GameState) =>
    s.buffs.some(b => b.kind === "revenge" && diffDays(b.expiresDate, todayKey()) >= 0), []);

  const finalize = useCallback((prevLevel: number) => (s: GameState): GameState => {
    let n = updateLevelAndSkillPoints(s, prevLevel);
    n = updateEquipmentUnlocks(n);
    const res = evaluateAchievements(n);
    if (res.newly.length) setNewlyAchieved(prev => [...prev, ...res.newly]);
    return res.state;
  }, []);

  const addSquats = useCallback((qualityCounts: Record<SquatQuality, number>) => {
    const reps = Object.values(qualityCounts).reduce((a, b) => a + b, 0);
    if (reps <= 0) return;
    setState(prev => {
      if (!prev) return prev;
      const prevLevel = prev.character.level;
      const buff = hasRevengeBuff(prev) ? GROWTH.revengeBonus : 1;
      const { bodyMult } = deriveCharacterStats(prev.character);
      const bodyGained = (Object.entries(qualityCounts) as [SquatQuality, number][])
        .reduce((sum, [q, n]) => sum + n * GROWTH.bodyPerSquatBase * GROWTH.qualityMultiplier[q], 0) * buff * bodyMult;
      const session: SquatSession = { id: uid(), date: todayKey(), reps, qualityCounts, bodyGained, createdAt: Date.now() };
      const today = todayKey();
      const wasActive = !!(prev.dailies[today]?.didTrain || prev.dailies[today]?.didStudy);
      let next: GameState = {
        ...prev,
        squats: [session, ...prev.squats],
        dailies: { ...prev.dailies, [today]: { date: today, didTrain: true, didStudy: prev.dailies[today]?.didStudy ?? false } },
        character: { ...prev.character, base: { ...prev.character.base, body: prev.character.base.body + bodyGained } },
      };
      next = updateStreak(next, wasActive, true);
      next = applyMissionProgress(next, "squat", reps);
      return finalize(prevLevel)(next);
    });
  }, [hasRevengeBuff, finalize]);

  const addPushups = useCallback((qualityCounts: Record<SquatQuality, number>) => {
    const reps = Object.values(qualityCounts).reduce((a, b) => a + b, 0);
    if (reps <= 0) return;
    setState(prev => {
      if (!prev) return prev;
      const prevLevel = prev.character.level;
      const buff = hasRevengeBuff(prev) ? GROWTH.revengeBonus : 1;
      const { bodyMult } = deriveCharacterStats(prev.character);
      const bodyGained = (Object.entries(qualityCounts) as [SquatQuality, number][])
        .reduce((sum, [q, n]) => sum + n * GROWTH.bodyPerPushupBase * GROWTH.qualityMultiplier[q], 0) * buff * bodyMult;
      const session: PushupSession = { id: uid(), date: todayKey(), reps, qualityCounts, bodyGained, createdAt: Date.now() };
      const today = todayKey();
      const wasActive = !!(prev.dailies[today]?.didTrain || prev.dailies[today]?.didStudy);
      let next: GameState = {
        ...prev,
        pushups: [session, ...prev.pushups],
        dailies: { ...prev.dailies, [today]: { date: today, didTrain: true, didStudy: prev.dailies[today]?.didStudy ?? false } },
        character: { ...prev.character, base: { ...prev.character.base, body: prev.character.base.body + bodyGained } },
      };
      next = updateStreak(next, wasActive, true);
      next = applyMissionProgress(next, "pushup", reps);
      return finalize(prevLevel)(next);
    });
  }, [hasRevengeBuff, finalize]);

  const addPlank = useCallback((durationSec: number) => {
    if (durationSec <= 0) return;
    setState(prev => {
      if (!prev) return prev;
      const prevLevel = prev.character.level;
      const { bodyMult } = deriveCharacterStats(prev.character);
      const buff = hasRevengeBuff(prev) ? GROWTH.revengeBonus : 1;
      const bodyGained = durationSec * GROWTH.bodyPerPlankSec * buff * bodyMult;
      const session: PlankSession = { id: uid(), date: todayKey(), durationSec, bodyGained, createdAt: Date.now() };
      const today = todayKey();
      const wasActive = !!(prev.dailies[today]?.didTrain || prev.dailies[today]?.didStudy);
      let next: GameState = {
        ...prev,
        planks: [session, ...prev.planks],
        dailies: { ...prev.dailies, [today]: { date: today, didTrain: true, didStudy: prev.dailies[today]?.didStudy ?? false } },
        character: { ...prev.character, base: { ...prev.character.base, body: prev.character.base.body + bodyGained } },
      };
      next = updateStreak(next, wasActive, true);
      next = applyMissionProgress(next, "plank", Math.round(durationSec));
      return finalize(prevLevel)(next);
    });
  }, [hasRevengeBuff, finalize]);

  const addStudy = useCallback((minutes: number, subject?: string) => {
    if (minutes <= 0) return;
    setState(prev => {
      if (!prev) return prev;
      const prevLevel = prev.character.level;
      const { mindMult } = deriveCharacterStats(prev.character);
      const today = todayKey();
      const wasActive = !!(prev.dailies[today]?.didTrain || prev.dailies[today]?.didStudy);
      const session: StudySession = { id: uid(), date: today, minutes, subject, createdAt: Date.now() };
      let next: GameState = {
        ...prev,
        studies: [session, ...prev.studies],
        dailies: { ...prev.dailies, [today]: { date: today, didTrain: prev.dailies[today]?.didTrain ?? false, didStudy: true } },
        character: { ...prev.character, base: { ...prev.character.base, mind: prev.character.base.mind + minutes * GROWTH.mindPerStudyMinute * mindMult } },
      };
      next = updateStreak(next, wasActive, true);
      next = applyMissionProgress(next, "study", minutes);
      return finalize(prevLevel)(next);
    });
  }, [finalize]);

  const recordBattle = useCallback((
    rec: Omit<BattleRecord, "id" | "createdAt">,
    drops?: { coins?: number; walletId?: string }
  ) => {
    setState(prev => {
      if (!prev) return prev;
      const prevLevel = prev.character.level;
      const { expMult } = deriveCharacterStats(prev.character);
      const record: BattleRecord = { ...rec, expGained: Math.round(rec.expGained * expMult), id: uid(), createdAt: Date.now() };
      const newExp = prev.character.exp + record.expGained;
      const won = rec.result === "win";
      const winStreak = won ? prev.winStreak + 1 : 0;
      const buffs = won ? prev.buffs : [...prev.buffs.filter(b => b.kind !== "revenge"), { kind: "revenge" as const, expiresDate: addDays(todayKey(), 1) }];

      let coins = prev.coins;
      let inventory = prev.inventory;
      let worldHp = prev.worldHp;
      let worldHpLastRecoverAt = prev.worldHpLastRecoverAt;
      if (won && drops) {
        coins += drops.coins ?? 0;
        if (drops.walletId && ITEMS[drops.walletId]) {
          inventory = { ...inventory, [drops.walletId]: (inventory[drops.walletId] ?? 0) + 1 };
        }
      }
      let coinLost = 0;
      if (!won) {
        worldHp = Math.max(0, prev.worldHp - 1);
        if (prev.worldHp === (prev.worldHpMax ?? WORLD_HP_MAX)) worldHpLastRecoverAt = Date.now();
        coinLost = Math.floor(prev.coins * 0.2);
        coins = Math.max(0, coins - coinLost);
      }

      let next: GameState = {
        ...prev,
        battles: [record, ...prev.battles],
        character: { ...prev.character, exp: newExp, level: levelFromExp(newExp) },
        winStreak, buffs, coins, inventory, worldHp, worldHpLastRecoverAt,
      };
      if (won) next = applyMissionProgress(next, "battleWin", 1);
      return finalize(prevLevel)(next);
    });
  }, [finalize]);

  const buyItem = useCallback((itemId: string): boolean => {
    const item = ITEMS[itemId];
    if (!item || item.price == null) return false;
    let ok = false;
    setState(prev => {
      if (!prev) return prev;
      if (prev.coins < item.price!) return prev;
      ok = true;
      return {
        ...prev,
        coins: prev.coins - item.price!,
        inventory: { ...prev.inventory, [itemId]: (prev.inventory[itemId] ?? 0) + 1 },
      };
    });
    return ok;
  }, []);

  const useWorldItem = useCallback((itemId: string): boolean => {
    const item = ITEMS[itemId];
    if (!item || item.kind !== "world-heal" || !item.healAmount) return false;
    let ok = false;
    setState(prev => {
      if (!prev) return prev;
      const cnt = prev.inventory[itemId] ?? 0;
      if (cnt <= 0) return prev;
      const max = prev.worldHpMax ?? WORLD_HP_MAX;
      if (prev.worldHp >= max) return prev;
      ok = true;
      const inv = { ...prev.inventory, [itemId]: cnt - 1 };
      if (inv[itemId] <= 0) delete inv[itemId];
      return {
        ...prev,
        inventory: inv,
        worldHp: Math.min(max, prev.worldHp + item.healAmount!),
      };
    });
    return ok;
  }, []);

  const openWallet = useCallback((itemId: string): number | null => {
    const item = ITEMS[itemId];
    if (!item || item.kind !== "wallet" || !item.coinContents) return null;
    let gained: number | null = null;
    setState(prev => {
      if (!prev) return prev;
      const cnt = prev.inventory[itemId] ?? 0;
      if (cnt <= 0) return prev;
      const variance = 0.8 + Math.random() * 0.4; // 80〜120%
      gained = Math.max(1, Math.round(item.coinContents! * variance));
      const inv = { ...prev.inventory, [itemId]: cnt - 1 };
      if (inv[itemId] <= 0) delete inv[itemId];
      return { ...prev, inventory: inv, coins: prev.coins + gained! };
    });
    return gained;
  }, []);

  const consumeBattleItem = useCallback((itemId: string): boolean => {
    const item = ITEMS[itemId];
    if (!item || item.kind !== "battle-heal") return false;
    let ok = false;
    setState(prev => {
      if (!prev) return prev;
      const cnt = prev.inventory[itemId] ?? 0;
      if (cnt <= 0) return prev;
      ok = true;
      const inv = { ...prev.inventory, [itemId]: cnt - 1 };
      if (inv[itemId] <= 0) delete inv[itemId];
      return { ...prev, inventory: inv };
    });
    return ok;
  }, []);

  const learnSkill = useCallback((skillId: string) => {
    setState(prev => {
      if (!prev || prev.character.skillPoints <= 0 || prev.character.skills.includes(skillId)) return prev;
      const skill = SKILLS.find(s => s.id === skillId);
      const price = skill?.coinPrice ?? 0;
      if (prev.coins < price) return prev;
      return {
        ...prev,
        coins: prev.coins - price,
        character: { ...prev.character, skills: [...prev.character.skills, skillId], skillPoints: prev.character.skillPoints - 1 },
      };
    });
  }, []);

  const equip = useCallback((id?: string) => {
    setState(prev => prev ? ({ ...prev, character: { ...prev.character, equippedId: id } }) : prev);
  }, []);

  const updateSettings = useCallback((patch: Partial<GameState["settings"]>) => {
    setState(prev => prev ? ({ ...prev, settings: { ...prev.settings, ...patch } }) : prev);
  }, []);

  const renameCharacter = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 16);
    if (!trimmed) return;
    setState(prev => prev ? ({ ...prev, character: { ...prev.character, name: trimmed } }) : prev);
  }, []);

  const markWeeklyReportShown = useCallback(() => {
    setState(prev => prev ? ({ ...prev, lastWeeklyReportDate: todayKey() }) : prev);
  }, []);

  const replaceState = useCallback((s: GameState) => setState(pruneBuffs(ensureTodayMissions(s))), []);
  const reset = useCallback(() => setState(initialState()), []);
  const ackAchievements = useCallback(() => setNewlyAchieved([]), []);

  const derivedFull = useMemo(() => (state ? deriveCharacterStats(state.character) : null), [state]);

  const todayStats = useMemo(() => {
    if (!state) return null;
    const d = todayKey();
    const squatReps = state.squats.filter(s => s.date === d).reduce((a, s) => a + s.reps, 0);
    const pushupReps = state.pushups.filter(s => s.date === d).reduce((a, s) => a + s.reps, 0);
    const plankSec = state.planks.filter(s => s.date === d).reduce((a, s) => a + s.durationSec, 0);
    const studyMin = state.studies.filter(s => s.date === d).reduce((a, s) => a + s.minutes, 0);
    const missions: DailyMission[] = state.missions[d] ?? [];
    return { squatReps, pushupReps, plankSec, studyMin, missions };
  }, [state]);

  const revengeActive = state ? hasRevengeBuff(state) : false;

  return {
    state, derived: derivedFull?.derived ?? null, derivedFull, todayStats, revengeActive,
    addSquats, addPushups, addPlank, addStudy, recordBattle,
    learnSkill, equip, updateSettings, renameCharacter, markWeeklyReportShown,
    buyItem, useWorldItem, openWallet, consumeBattleItem,
    reset, replaceState,
    newlyAchieved, ackAchievements,
    achievementList: ACHIEVEMENTS,
  };
}
