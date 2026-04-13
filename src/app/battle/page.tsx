"use client";
import { useMemo, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { ENEMIES, Enemy, isChapterUnlocked } from "@/lib/game/enemies";
import { BattleState, computeExpReward, flavorResult, initBattle } from "@/lib/game/battle";
import { ITEMS, rollEnemyDrop } from "@/lib/game/items";
import { SFX } from "@/lib/audio/sfx";
import { levelFromExp } from "@/lib/game/stats";
import { BattleLog } from "@/components/BattleLog";
import { BattleArena } from "@/components/BattleArena";
import { BattleTutorial } from "@/components/BattleTutorial";
import { PageHero } from "@/components/PageHero";
import { levelupLine } from "@/lib/ui/labels";

type Drops = { coins: number; walletId?: string };
type Fight = { enemy: Enemy; battle: BattleState; exp: number; firstKill: boolean; leveledUp: boolean; newLevel: number; drops?: Drops; coinLost?: number } | null;

export default function BattlePage() {
  const { state, derived, derivedFull, recordBattle, consumeBattleItem } = useGameState();
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
    if ((state?.worldHp ?? 0) <= 0) return;
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
    const drops: Drops | undefined = winner === "player" ? rollEnemyDrop(enemy.expReward) : undefined;
    const coinLost = winner === "enemy" ? Math.floor((state.coins ?? 0) * 0.2) : 0;
    if (drops && drops.coins > 0) setTimeout(() => SFX.coin(drops.walletId ? 2 : 1), 400);
    recordBattle({ enemyId: enemy.id, result: winner === "player" ? "win" : "lose", expGained: baseExp }, drops);
    setResult({ enemy, battle: finalBattle, exp: actualExp, firstKill, leveledUp: newLevel > prevLevel, newLevel, drops, coinLost });
    setPhase("result");
  };

  const back = () => {
    setEnemy(null); setBattle(null); setResult(null); setPhase("select");
  };

  return (
    <div className="space-y-4">
      <BattleTutorial />
      {phase === "select" && <PageHero image="/chara/バトル背景.webp" title="喧嘩" desc="殴り合い。負けりゃ金と体力が落ちる。" />}

      {phase === "select" && (state.worldHp ?? 0) <= 0 && (
        <div className="panel-washi rounded-xl p-5 text-center border border-rose-800/60">
          <div className="font-brush text-xl ink-title text-rose-200">体力が尽きた</div>
          <div className="text-xs text-slate-400 font-kan mt-2">しばらく休むか、お守り・湯呑みで回復しろ。</div>
        </div>
      )}
      {phase === "select" && (state.worldHp ?? 0) > 0 && (
        <>
          <div className="text-xs text-rose-300 font-kan">体力 {state.worldHp}/{state.worldHpMax ?? 5}（敗北で -1）</div>
          {state.winStreak > 0 && (
            <div className="text-xs text-emerald-300 font-kan">勝 {state.winStreak}連勝中（EXP x{Math.min(1.5, 1 + state.winStreak * 0.1).toFixed(1)}）</div>
          )}
          <div className="grid gap-3">
            {ENEMIES.map(e => {
              const killed = killedIds.has(e.id);
              const lost = lostIds.has(e.id) && !killed;
              const unlocked = isChapterUnlocked(e.chapter, killedIds, ENEMIES);
              return (
              <button key={e.id} onClick={() => unlocked && startFight(e)} disabled={!unlocked}
                className={`slash-on-hover text-left relative rounded-xl panel-washi p-4 transition ${
                  !unlocked ? "opacity-40 cursor-not-allowed" : "hover:border-rose-800/60"
                } ${killed ? "opacity-80" : ""}`}>
                {killed && (
                  <span className="absolute top-2 right-2 stamp-cleared">撃破</span>
                )}
                {lost && unlocked && (
                  <span className="absolute top-2 right-2 stamp-cleared" style={{ color: "#94a3b8", borderColor: "#475569", background: "rgba(15,23,42,0.5)" }}>敗北</span>
                )}
                {!unlocked && (
                  <span className="absolute top-2 right-2 text-[10px] font-kan tracking-widest text-slate-500 border border-slate-700 bg-black/50 px-2 py-0.5 rounded-sm">封鎖中</span>
                )}
                <div className="flex justify-between pr-14">
                  <div>
                    <div className="text-xs text-slate-500 font-kan tracking-widest">{e.chapter}</div>
                    <div className="font-kan font-bold tracking-wider text-slate-100">
                      {unlocked ? e.name : "？？？"} {unlocked && !killed && <span className="text-xs text-amber-300 ml-1">初討伐 x1.5</span>}
                    </div>
                    <div className="text-xs text-slate-400 italic mt-1 font-kan">
                      {unlocked ? `「${e.taunt}」` : "前章を制覇せよ。"}
                    </div>
                  </div>
                  {unlocked && (
                    <div className="text-xs text-slate-400 text-right font-kan shrink-0 ml-2">
                      {e.element === "magic" ? "読み型" : "拳型"}<br />弱点:{e.weakness === "magic" ? "読み" : "拳"}
                    </div>
                  )}
                </div>
                {unlocked && (
                  <div className="text-xs text-slate-500 mt-2 font-mono">
                    体{e.stats.hp} 剛{e.stats.attack} 受{e.stats.defense} 知{e.stats.magic} 速{e.stats.speed} — EXP{e.expReward}
                  </div>
                )}
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
          inventory={state.inventory ?? {}}
          onUseBattleItem={(id) => {
            const item = ITEMS[id];
            if (!item || item.kind !== "battle-heal" || !item.healAmount) return null;
            if (!consumeBattleItem(id)) return null;
            return { healAmount: item.healAmount, name: item.name };
          }}
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
                : <>EXP 0 — 体力 -1{result.coinLost ? ` / ◎ ${result.coinLost}コイン 落とした` : ""}。明日の拳に倍返しを乗せる。</>}
            </div>
            {result.drops && result.battle.over === "player" && (
              <div className="mt-3 text-amber-200 font-kan text-sm">
                ◎ コイン +{result.drops.coins}
                {result.drops.walletId && (() => {
                  const w = ITEMS[result.drops!.walletId!];
                  return w ? <> / 《{w.name}》を拾った（ホームで開けろ）</> : null;
                })()}
              </div>
            )}
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
