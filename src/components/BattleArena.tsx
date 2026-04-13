"use client";
import { useMemo, useState } from "react";
import { BattleState, PlayerAction, Action, resolveTurn, canUseTech } from "@/lib/game/battle";
import { Enemy } from "@/lib/game/enemies";
import { Technique, TECHNIQUES } from "@/lib/game/techniques";
import { DerivedStats } from "@/types/game";
import { HpBar } from "./HpBar";
import { CharaPortrait } from "./CharaPortrait";
import { SpecialMoveFlash } from "./SpecialMoveFlash";
import { DamagePop } from "./DamagePop";
import { SFX } from "@/lib/audio/sfx";

export function BattleArena({
  state, setState, derived, enemy, playerSkills, inventory, onUseBattleItem, onFinished, busy,
}: {
  state: BattleState;
  setState: (s: BattleState) => void;
  derived: DerivedStats;
  enemy: Enemy;
  playerSkills: string[];
  inventory?: Record<string, number>;
  onUseBattleItem?: (id: string) => { healAmount: number; name: string } | null;
  onFinished: (finalState: BattleState) => void;
  busy: boolean;
}) {
  const [techOpen, setTechOpen] = useState(false);
  const [flash, setFlash] = useState<{ name: string; key: number } | null>(null);
  const [popPlayer, setPopPlayer] = useState<{ amount: number; key: number }>({ amount: 0, key: 0 });
  const [popEnemy, setPopEnemy] = useState<{ amount: number; key: number }>({ amount: 0, key: 0 });
  const [shakeP, setShakeP] = useState(0);
  const [shakeE, setShakeE] = useState(0);
  const ownedTechs = useMemo(
    () => TECHNIQUES.filter(t => playerSkills.includes(t.id)),
    [playerSkills]
  );
  const lastLog = state.log[state.log.length - 1];

  const act = (action: PlayerAction) => {
    if (state.over || busy) return;
    const next = resolveTurn(state, action, derived, enemy);
    const log = next.log[next.log.length - 1];
    const techName = log.playerTechName || log.enemyTechName;
    if (techName) {
      SFX.special();
      setFlash({ name: techName, key: Date.now() });
    } else {
      // アクション別音
      if (log.playerAction === "kick" || log.enemyAction === "kick") SFX.deep();
      else if (log.playerAction === "guard" && log.enemyAction === "guard") SFX.guard();
      else if (log.playerAction === "guard" || log.enemyAction === "guard") SFX.guard();
      else if (log.playerDamage > 0 || log.enemyDamage > 0) SFX.rep();
    }
    if (log.enemyDamage > 0 && !techName) setTimeout(() => SFX.hit(), 80);
    // 攻撃が当たったら打撃音（敵被弾/自被弾それぞれ）
    if (log.playerDamage > 0) SFX.strike();
    if (log.enemyDamage > 0) setTimeout(() => SFX.strike(), 120);
    if (log.playerDamage > 0) { setPopEnemy({ amount: log.playerDamage, key: Date.now() }); setShakeE(Date.now()); }
    if (log.enemyDamage > 0) { setPopPlayer({ amount: log.enemyDamage, key: Date.now() + 1 }); setShakeP(Date.now() + 1); }
    setState(next);
    if (next.over) setTimeout(() => onFinished(next), 900);
    setTechOpen(false);
  };

  const nigiriCount = inventory?.["nigiri"] ?? 0;
  const useNigiri = () => {
    if (state.over || busy || nigiriCount <= 0) return;
    if (state.player.hp >= state.player.maxHp) return;
    const info = onUseBattleItem?.("nigiri");
    if (!info) return;
    const next = resolveTurn(state, { type: "guard" }, derived, enemy);
    const healed = Math.min(state.player.maxHp, next.player.hp + info.healAmount);
    const logs = [...next.log];
    const last = logs[logs.length - 1];
    logs[logs.length - 1] = {
      ...last,
      notes: [`《${info.name}》を頬張った — HP+${info.healAmount}`, ...last.notes],
    };
    const patched = { ...next, player: { ...next.player, hp: healed }, log: logs };
    setState(patched);
    if (patched.over) setTimeout(() => onFinished(patched), 900);
    setTechOpen(false);
  };

  return (
    <div className="space-y-3">
      <SpecialMoveFlash techName={flash?.name ?? null} trigger={flash?.key ?? 0} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2 relative">
          <div key={`pw-${shakeP}`} className={`relative ${shakeP ? "shake-hit" : ""}`}>
            <CharaPortrait />
            <DamagePop amount={popPlayer.amount} crit={false} dodged={false} side="left" trigger={popPlayer.key} />
          </div>
          <HpBar value={state.player.hp} max={state.player.maxHp} color="bg-emerald-500" label="自分" />
          <KiGauge value={state.player.ki} max={state.player.maxKi} />
          <RageGauge value={state.player.rage ?? 0} />
        </div>
        <div className="space-y-2 relative">
          <div key={`ew-${shakeE}`} className={`relative ${shakeE ? "shake-hit" : ""}`}>
            <EnemyPortrait enemy={enemy} />
            <DamagePop amount={popEnemy.amount} crit={false} dodged={false} side="right" trigger={popEnemy.key} />
          </div>
          <HpBar value={state.enemy.hp} max={state.enemy.maxHp} color="bg-rose-500" label={enemy.name} />
          <KiGauge value={state.enemy.ki} max={state.enemy.maxKi} />
          <RageGauge value={state.enemy.rage ?? 0} />
        </div>
      </div>
      <style jsx global>{`
        @keyframes shakeHit {
          0%   { transform: translate(0,0) rotate(0); }
          15%  { transform: translate(-6px, 2px) rotate(-1.5deg); }
          30%  { transform: translate(6px, -2px) rotate(1.5deg); }
          45%  { transform: translate(-4px, 3px) rotate(-1deg); }
          60%  { transform: translate(4px, -1px) rotate(1deg); }
          75%  { transform: translate(-2px, 1px) rotate(-0.5deg); }
          100% { transform: translate(0,0) rotate(0); }
        }
        .shake-hit { animation: shakeHit 420ms ease-out; }
      `}</style>

      {lastLog && (() => {
        const playerFirst = lastLog.notes.some(n => n.startsWith("先手：自"));
        const enemyFirst  = lastLog.notes.some(n => n.startsWith("先手：敵"));
        return (
        <div className="panel-washi rounded-lg p-3 text-xs font-kan space-y-1">
          <div className="flex justify-between text-slate-400 tracking-widest">
            <span>第 {lastLog.turn} 手</span>
            <span>自→敵 {lastLog.playerDamage} / 敵→自 {lastLog.enemyDamage}</span>
          </div>
          <div className="flex gap-2 text-slate-200 items-center">
            <span className="inline-flex items-center gap-1">
              {playerFirst && <Pill tone="amber">先</Pill>}
              {enemyFirst && <Pill tone="slate">後</Pill>}
              自：{labelAction(lastLog.playerAction, lastLog.playerTechName)}
            </span>
            <span className="text-slate-600">×</span>
            <span className="inline-flex items-center gap-1">
              {enemyFirst && <Pill tone="amber">先</Pill>}
              {playerFirst && <Pill tone="slate">後</Pill>}
              敵：{labelAction(lastLog.enemyAction, lastLog.enemyTechName)}
            </span>
          </div>
          {lastLog.notes.length > 0 && (
            <div className="text-[11px] text-rose-300/80">{lastLog.notes.join(" / ")}</div>
          )}
        </div>
        );
      })()}

      {!state.over && (
        <>
          <div className="grid grid-cols-4 gap-2">
            <CmdBtn label="拳" sub="速い" icon="拳" onClick={() => act({ type: "punch" })} disabled={busy} />
            <CmdBtn label="蹴り" sub="重い/技潰し" icon="脚" onClick={() => act({ type: "kick" })} disabled={busy} />
            <CmdBtn label="ガード" sub="被ダメ減" icon="盾" onClick={() => act({ type: "guard" })} disabled={busy} />
            <CmdBtn label="技" sub={`${ownedTechs.length}種`} icon="技" onClick={() => setTechOpen(v => !v)}
                    disabled={busy || ownedTechs.length === 0} active={techOpen} />
          </div>
          {nigiriCount > 0 && (
            <button
              onClick={useNigiri}
              disabled={busy || state.player.hp >= state.player.maxHp}
              className={`w-full rounded-lg py-2 border font-kan text-sm transition ${
                state.player.hp >= state.player.maxHp
                  ? "border-slate-800 bg-black/40 opacity-40"
                  : "border-amber-700 bg-amber-950/40 hover:bg-amber-900/40 text-amber-100"
              }`}
            >
              握り飯を食う（HP+15 / 残 {nigiriCount}）
            </button>
          )}
        </>
      )}

      {techOpen && !state.over && (
        <div className="panel-washi rounded-lg p-3 space-y-1.5">
          {ownedTechs.length === 0 && (
            <div className="text-xs text-slate-400 font-kan">習得した技がない。技の覚書で購入せよ。</div>
          )}
          {ownedTechs.map(t => {
            const usable = canUseTech(state.player.ki, t);
            return (
              <button
                key={t.id}
                onClick={() => usable && act({ type: "tech", techId: t.id })}
                disabled={!usable || busy}
                className={`w-full text-left rounded-md p-2 border flex justify-between items-center transition ${
                  usable ? "border-rose-800/60 bg-rose-950/20 hover:bg-rose-900/30" : "border-slate-800 bg-black/30 opacity-50"
                }`}
              >
                <div>
                  <div className="font-kan font-bold text-slate-100">{t.name}</div>
                  <div className="text-[10px] text-slate-400 font-kan">{t.flavor}</div>
                </div>
                <div className="text-xs font-mono text-amber-300 shrink-0 ml-2">気力 {t.cost}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: "amber" | "slate" }) {
  const c = tone === "amber"
    ? "border-amber-500 text-amber-100 bg-amber-900/50"
    : "border-slate-600 text-slate-300 bg-slate-800/60";
  return <span className={`inline-block text-[9px] font-kan tracking-wider px-1.5 py-0 rounded-sm border ${c}`}>{children}</span>;
}

function labelAction(a: Action, techName?: string): string {
  if (a === "punch") return "拳";
  if (a === "kick") return "蹴り";
  if (a === "guard") return "ガード";
  return `技《${techName ?? "—"}》`;
}

function CmdBtn({ label, sub, icon, onClick, disabled, active }: {
  label: string; sub: string; icon: string; onClick: () => void; disabled?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`slash-on-hover rounded-lg py-2.5 px-1 border text-center transition ${
        active
          ? "border-rose-500 bg-rose-900/40"
          : disabled
          ? "border-slate-800 bg-black/40 opacity-40"
          : "border-slate-700 bg-slate-900 hover:bg-rose-950/40 hover:border-rose-800"
      }`}
    >
      <div className="font-brush text-xl text-rose-200">{icon}</div>
      <div className="font-kan text-xs text-slate-200 mt-0.5">{label}</div>
      <div className="text-[9px] text-slate-500 font-kan">{sub}</div>
    </button>
  );
}

function RageGauge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const full = pct >= 100;
  return (
    <div>
      <div className="flex justify-between text-[10px] font-kan mb-0.5">
        <span className={full ? "text-rose-200 font-bold animate-pulse" : "text-slate-400"}>怒</span>
        <span className="font-mono text-slate-400">{Math.floor(pct)}/100{full ? " ▶発動" : ""}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-sm overflow-hidden">
        <div
          className={`h-full ${full ? "bg-gradient-to-r from-rose-500 via-orange-400 to-rose-500 animate-pulse" : "bg-gradient-to-r from-rose-700 to-rose-500"}`}
          style={{ width: `${pct}%`, boxShadow: full ? "0 0 10px rgba(244,63,94,0.8)" : "none" }}
        />
      </div>
    </div>
  );
}

function KiGauge({ value, max }: { value: number; max: number }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-slate-400 font-kan mb-0.5">
        <span>気力</span>
        <span className="font-mono">{value}/{max}</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-sm ${
              i < value ? "bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_6px_rgba(251,191,36,0.5)]" : "bg-slate-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function EnemyPortrait({ enemy }: { enemy: Enemy }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-b from-rose-950 to-slate-950 ring-1 ring-rose-900/50">
      {failed ? (
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="font-brush text-5xl text-rose-300">敵</div>
            <div className="font-kan font-bold mt-2">{enemy.name}</div>
          </div>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/chara/enemy_${enemy.id}.webp`} alt={enemy.name}
             className="w-full h-full object-cover" onError={() => setFailed(true)} />
      )}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2 text-center">
        <div className="font-kan font-bold tracking-wider text-slate-100 drop-shadow">{enemy.name}</div>
        <div className="text-[10px] text-rose-300/80 mt-0.5 font-kan tracking-widest">
          {enemy.element === "magic" ? "読み型" : "拳型"} / AI:{enemy.ai}
        </div>
      </div>
    </div>
  );
}
