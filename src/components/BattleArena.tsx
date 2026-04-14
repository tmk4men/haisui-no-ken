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
  const [impact, setImpact] = useState<{ key: number; side: "left" | "right"; crit: boolean; color: string } | null>(null);
  const [popPlayerMeta, setPopPlayerMeta] = useState<{ crit: boolean; dodged: boolean }>({ crit: false, dodged: false });
  const [popEnemyMeta, setPopEnemyMeta] = useState<{ crit: boolean; dodged: boolean }>({ crit: false, dodged: false });
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
    const pCrit = !!log.playerTechName || log.playerDamage >= 20;
    const eCrit = !!log.enemyTechName || log.enemyDamage >= 20;
    if (log.playerDamage > 0) {
      setPopEnemy({ amount: log.playerDamage, key: Date.now() });
      setPopEnemyMeta({ crit: pCrit, dodged: false });
      setShakeE(Date.now());
      setImpact({ key: Date.now(), side: "right", crit: pCrit, color: pCrit ? "#fbbf24" : "#f43f5e" });
    } else if (log.enemyDodged) {
      setPopEnemy({ amount: 0, key: Date.now() });
      setPopEnemyMeta({ crit: false, dodged: true });
    }
    if (log.enemyDamage > 0) {
      setPopPlayer({ amount: log.enemyDamage, key: Date.now() + 1 });
      setPopPlayerMeta({ crit: eCrit, dodged: false });
      setShakeP(Date.now() + 1);
      setImpact({ key: Date.now() + 1, side: "left", crit: eCrit, color: eCrit ? "#fbbf24" : "#f43f5e" });
    } else if (log.playerDodged) {
      setPopPlayer({ amount: 0, key: Date.now() + 1 });
      setPopPlayerMeta({ crit: false, dodged: true });
    }
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
      <ImpactFlash data={impact} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2 relative">
          <div key={`pw-${shakeP}`} className={`relative ${shakeP ? "shake-hit" : ""}`}>
            <CharaPortrait />
            <HitFx trigger={shakeP} crit={popPlayerMeta.crit} />
            <DamagePop amount={popPlayer.amount} crit={popPlayerMeta.crit} dodged={popPlayerMeta.dodged} side="left" trigger={popPlayer.key} />
          </div>
          <HpBar value={state.player.hp} max={state.player.maxHp} color="bg-emerald-500" label="自分" />
          <KiGauge value={state.player.ki} max={state.player.maxKi} />
          <RageGauge value={state.player.rage ?? 0} />
        </div>
        <div className="space-y-2 relative">
          <div key={`ew-${shakeE}`} className={`relative ${shakeE ? "shake-hit" : ""}`}>
            <EnemyPortrait enemy={enemy} />
            <HitFx trigger={shakeE} crit={popEnemyMeta.crit} />
            <DamagePop amount={popEnemy.amount} crit={popEnemyMeta.crit} dodged={popEnemyMeta.dodged} side="right" trigger={popEnemy.key} />
          </div>
          <HpBar value={state.enemy.hp} max={state.enemy.maxHp} color="bg-rose-500" label={enemy.name} />
          <KiGauge value={state.enemy.ki} max={state.enemy.maxKi} />
          <RageGauge value={state.enemy.rage ?? 0} />
        </div>
      </div>
      <style jsx global>{`
        @keyframes shakeHit {
          0%   { transform: translate(0,0) rotate(0) scale(1); filter: brightness(1); }
          8%   { transform: translate(-10px, 4px) rotate(-2.5deg) scale(1.04); filter: brightness(1.6) contrast(1.2); }
          18%  { transform: translate(11px, -4px) rotate(2.5deg) scale(0.98); filter: brightness(1.3); }
          28%  { transform: translate(-8px, 5px) rotate(-1.5deg) scale(1.02); filter: brightness(1.1); }
          40%  { transform: translate(7px, -2px) rotate(1.5deg) scale(1); filter: brightness(1); }
          55%  { transform: translate(-4px, 2px) rotate(-0.8deg); }
          70%  { transform: translate(3px, -1px) rotate(0.6deg); }
          100% { transform: translate(0,0) rotate(0); }
        }
        .shake-hit { animation: shakeHit 520ms cubic-bezier(.36,.07,.19,.97); transform-origin: center; }
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

function HitFx({ trigger, crit }: { trigger: number; crit: boolean }) {
  if (!trigger) return null;
  return (
    <div key={trigger} className="absolute inset-0 pointer-events-none z-10 grid place-items-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/chara/ヒット効果.png" alt=""
           className="hit-fx-img"
           style={{
             width: crit ? "140%" : "115%",
             maxWidth: "none",
             filter: crit
               ? "drop-shadow(0 0 14px #fbbf24) drop-shadow(0 0 28px #f43f5e) hue-rotate(-10deg) saturate(1.3)"
               : "drop-shadow(0 0 10px #f43f5e)",
             mixBlendMode: "screen",
           }} />
      <style jsx>{`
        .hit-fx-img {
          animation: hitFxAnim 520ms cubic-bezier(.2,.9,.2,1) forwards;
          transform-origin: center;
        }
        @keyframes hitFxAnim {
          0%   { opacity: 0; transform: scale(0.3) rotate(-18deg); }
          20%  { opacity: 1; transform: scale(1.15) rotate(6deg); }
          55%  { opacity: 1; transform: scale(1) rotate(-3deg); }
          100% { opacity: 0; transform: scale(1.25) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

function ImpactFlash({ data }: { data: { key: number; side: "left" | "right"; crit: boolean; color: string } | null }) {
  if (!data) return null;
  const { key, side, crit, color } = data;
  return (
    <div key={key} className="fixed inset-0 pointer-events-none z-40 overflow-hidden impact-root">
      <div className="absolute inset-0 impact-flash"
           style={{ background: `radial-gradient(circle at ${side === "left" ? "30%" : "70%"} 45%, ${color}55, transparent 55%)` }} />
      <div className="absolute inset-0 impact-vignette" />
      {[...Array(crit ? 14 : 8)].map((_, i) => {
        const rot = (i / (crit ? 14 : 8)) * 360;
        return (
          <div key={i} className="absolute top-1/2 left-1/2 impact-line"
               style={{
                 width: crit ? "130vw" : "90vw",
                 height: crit ? "3px" : "2px",
                 background: `linear-gradient(90deg, transparent 0%, ${color} 45%, #fff 50%, ${color} 55%, transparent 100%)`,
                 transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                 animationDelay: `${i * 12}ms`,
                 opacity: 0.85,
                 filter: `drop-shadow(0 0 6px ${color})`,
               }} />
        );
      })}
      <style jsx>{`
        .impact-root { animation: impactRoot 360ms ease-out forwards; }
        .impact-flash { animation: impactFade 320ms ease-out forwards; }
        .impact-vignette {
          background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.55) 100%);
          animation: impactFade 400ms ease-out forwards;
        }
        .impact-line { animation: impactSweep 380ms cubic-bezier(.2,.8,.2,1) forwards; transform-origin: center; }
        @keyframes impactRoot { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes impactFade { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes impactSweep {
          0%   { opacity: 0; transform: translate(-50%, -50%) rotate(var(--r,0)) scaleX(0); }
          30%  { opacity: 1; transform: translate(-50%, -50%) rotate(var(--r,0)) scaleX(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--r,0)) scaleX(1.1); }
        }
      `}</style>
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
