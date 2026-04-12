"use client";
import { useMemo, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { ENEMIES, Enemy } from "@/lib/game/enemies";
import { runBattle, computeExpReward, flavorResult, BattleResult } from "@/lib/game/battle";
import { levelFromExp } from "@/lib/game/stats";
import { BattleLog } from "@/components/BattleLog";
import { BattleArena } from "@/components/BattleArena";
import { levelupLine } from "@/lib/ui/labels";

type FightResult = { enemy: Enemy; battle: BattleResult; exp: number; firstKill: boolean; leveledUp: boolean; newLevel: number };

export default function BattlePage() {
  const { state, derived, derivedFull, recordBattle } = useGameState();
  const [fight, setFight] = useState<FightResult | null>(null);
  const [phase, setPhase] = useState<"select" | "arena" | "result">("select");

  const killedIds = useMemo(() => {
    if (!state) return new Set<string>();
    return new Set(state.battles.filter(b => b.result === "win").map(b => b.enemyId));
  }, [state]);

  if (!state || !derived || !derivedFull) return <div className="text-slate-400">読み込み中…</div>;

  const onFight = (enemy: Enemy) => {
    const battle = runBattle(derived, enemy);
    const firstKill = battle.winner === "player" && !killedIds.has(enemy.id);
    const baseExp = computeExpReward({ baseReward: enemy.expReward, winner: battle.winner, winStreak: state.winStreak, firstKill });
    const actualExp = Math.round(baseExp * derivedFull.expMult);
    const prevLevel = state.character.level;
    const newLevel = levelFromExp(state.character.exp + actualExp);
    recordBattle({ enemyId: enemy.id, result: battle.winner === "player" ? "win" : "lose", expGained: baseExp });
    setFight({ enemy, battle, exp: actualExp, firstKill, leveledUp: newLevel > prevLevel, newLevel });
    setPhase("arena");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">出入り</h2>
      {phase === "select" && (
        <>
          {state.winStreak > 0 && (
            <div className="text-xs text-emerald-400">⚔ {state.winStreak}連勝中（EXP x{Math.min(1.5, 1 + state.winStreak * 0.1).toFixed(1)}）</div>
          )}
          <div className="grid gap-3">
            {ENEMIES.map(e => (
              <button key={e.id} onClick={() => onFight(e)}
                className="text-left rounded-xl bg-slate-900 ring-1 ring-slate-800 p-4 hover:bg-slate-800">
                <div className="flex justify-between">
                  <div>
                    <div className="text-xs text-slate-500">{e.chapter}</div>
                    <div className="font-semibold">{e.name} {!killedIds.has(e.id) && <span className="text-xs text-amber-400 ml-1">初討伐 x1.5</span>}</div>
                    <div className="text-xs text-slate-400 italic mt-1">「{e.taunt}」</div>
                  </div>
                  <div className="text-xs text-slate-400 text-right">{e.element === "magic" ? "読み型" : "拳型"}<br />弱点:{e.weakness === "magic" ? "読み" : "拳"}</div>
                </div>
                <div className="text-xs text-slate-500 mt-2 font-mono">
                  体力{e.stats.hp} 剛{e.stats.attack} 受{e.stats.defense} 知{e.stats.magic} 速{e.stats.speed} — EXP{e.expReward}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "arena" && fight && (
        <BattleArena result={fight.battle} playerHp={derived.hp} enemy={fight.enemy} onFinished={() => setPhase("result")} />
      )}

      {phase === "result" && fight && (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 text-center ring-1 ${
            fight.battle.winner === "player" ? "bg-emerald-900/50 ring-emerald-700 text-emerald-200" : "bg-rose-900/50 ring-rose-700 text-rose-200"
          }`}>
            <div className="text-lg font-bold">
              {flavorResult({ winner: fight.battle.winner, enemyName: fight.enemy.name, winStreak: state.winStreak })}
            </div>
            <div className="text-sm mt-2">
              {fight.battle.winner === "player"
                ? <>EXP +{fight.exp}{fight.firstKill && " 《初討伐》"}</>
                : <>EXP 0 — 明日の拳に、倍返しを乗せる。</>}
            </div>
            {fight.leveledUp && (
              <div className="mt-3 text-amber-300 font-bold" style={{ fontFamily: "serif" }}>
                Lv.{fight.newLevel} — {levelupLine(fight.newLevel)}
              </div>
            )}
          </div>
          <BattleLog turns={fight.battle.turns} />
          <button onClick={() => { setFight(null); setPhase("select"); }} className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl py-3">戻る</button>
        </div>
      )}
    </div>
  );
}
