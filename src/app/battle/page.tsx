"use client";
import { useMemo, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { ENEMIES, Enemy } from "@/lib/game/enemies";
import { BattleState, computeExpReward, flavorResult, initBattle } from "@/lib/game/battle";
import { levelFromExp } from "@/lib/game/stats";
import { BattleLog } from "@/components/BattleLog";
import { BattleArena } from "@/components/BattleArena";
import { BattleTutorial } from "@/components/BattleTutorial";
import { levelupLine } from "@/lib/ui/labels";

type Fight = { enemy: Enemy; battle: BattleState; exp: number; firstKill: boolean; leveledUp: boolean; newLevel: number } | null;

export default function BattlePage() {
  const { state, derived, derivedFull, recordBattle } = useGameState();
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [result, setResult] = useState<Fight>(null);
  const [phase, setPhase] = useState<"select" | "arena" | "result">("select");

  const killedIds = useMemo(() => {
    if (!state) return new Set<string>();
    return new Set(state.battles.filter(b => b.result === "win").map(b => b.enemyId));
  }, [state]);

  const lostIds = useMemo(() => {
    if (!state) return new Set<string>();
    return new Set(state.battles.filter(b => b.result === "lose").map(b => b.enemyId));
  }, [state]);

  if (!state || !derived || !derivedFull) return <div className="text-slate-400 font-kan">読み込み中…</div>;

  const startFight = (e: Enemy) => {
    setEnemy(e);
    setBattle(initBattle(derived, e));
    setResult(null);
    setPhase("arena");
  };

  const onFinished = (finalBattle: BattleState) => {
    if (!enemy) return;
    const winner: "player" | "enemy" = finalBattle.over ?? "enemy";
    const firstKill = winner === "player" && !killedIds.has(enemy.id);
    const baseExp = computeExpReward({ baseReward: enemy.expReward, winner, winStreak: state.winStreak, firstKill });
    const actualExp = Math.round(baseExp * derivedFull.expMult);
    const prevLevel = state.character.level;
    const newLevel = levelFromExp(state.character.exp + actualExp);
    recordBattle({ enemyId: enemy.id, result: winner === "player" ? "win" : "lose", expGained: baseExp });
    setResult({ enemy, battle: finalBattle, exp: actualExp, firstKill, leveledUp: newLevel > prevLevel, newLevel });
    setPhase("result");
  };

  const back = () => {
    setEnemy(null); setBattle(null); setResult(null); setPhase("select");
  };

  return (
    <div className="space-y-4">
      <BattleTutorial />
      <h2 className="font-brush text-2xl ink-title blood-stroke">出入り</h2>

      {phase === "select" && (
        <>
          {state.winStreak > 0 && (
            <div className="text-xs text-emerald-300 font-kan">勝 {state.winStreak}連勝中（EXP x{Math.min(1.5, 1 + state.winStreak * 0.1).toFixed(1)}）</div>
          )}
          <div className="grid gap-3">
            {ENEMIES.map(e => {
              const killed = killedIds.has(e.id);
              const lost = lostIds.has(e.id) && !killed;
              return (
              <button key={e.id} onClick={() => startFight(e)}
                className={`slash-on-hover text-left relative rounded-xl panel-washi p-4 hover:border-rose-800/60 transition ${killed ? "opacity-80" : ""}`}>
                {killed && (
                  <span className="absolute top-2 right-2 stamp-cleared">撃破</span>
                )}
                {lost && (
                  <span className="absolute top-2 right-2 stamp-cleared" style={{ color: "#94a3b8", borderColor: "#475569", background: "rgba(15,23,42,0.5)" }}>敗北</span>
                )}
                <div className="flex justify-between pr-14">
                  <div>
                    <div className="text-xs text-slate-500 font-kan tracking-widest">{e.chapter}</div>
                    <div className="font-kan font-bold tracking-wider text-slate-100">
                      {e.name} {!killed && <span className="text-xs text-amber-300 ml-1">初討伐 x1.5</span>}
                    </div>
                    <div className="text-xs text-slate-400 italic mt-1 font-kan">「{e.taunt}」</div>
                  </div>
                  <div className="text-xs text-slate-400 text-right font-kan shrink-0 ml-2">
                    {e.element === "magic" ? "読み型" : "拳型"}<br />弱点:{e.weakness === "magic" ? "読み" : "拳"}
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-2 font-mono">
                  体{e.stats.hp} 剛{e.stats.attack} 受{e.stats.defense} 知{e.stats.magic} 速{e.stats.speed} — EXP{e.expReward}
                </div>
              </button>
              );
            })}
          </div>
        </>
      )}

      {phase === "arena" && enemy && battle && (
        <BattleArena
          state={battle}
          setState={setBattle}
          derived={derived}
          enemy={enemy}
          playerSkills={state.character.skills}
          onFinished={onFinished}
          busy={false}
        />
      )}

      {phase === "result" && result && (
        <div className="space-y-3">
          <div className={`panel-washi rounded-xl p-4 text-center border ${
            result.battle.over === "player" ? "border-emerald-700/60" : "border-rose-700/60"
          }`}>
            <div className="font-brush text-xl ink-title">
              {flavorResult({ winner: result.battle.over ?? "enemy", enemyName: result.enemy.name, winStreak: state.winStreak })}
            </div>
            <div className="text-sm mt-2 font-kan">
              {result.battle.over === "player"
                ? <>EXP +{result.exp}{result.firstKill && " 《初討伐》"}</>
                : <>EXP 0 — 明日の拳に、倍返しを乗せる。</>}
            </div>
            {result.leveledUp && (
              <div className="mt-3 text-amber-300 font-brush text-lg">
                Lv.{result.newLevel} — {levelupLine(result.newLevel)}
              </div>
            )}
          </div>
          <BattleLog turns={result.battle.log} />
          <button onClick={back} className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl py-3 font-kan tracking-widest">戻る</button>
        </div>
      )}
    </div>
  );
}
