"use client";
import { useEffect, useRef, useState } from "react";
import { BattleResult, TurnEvent } from "@/lib/game/battle";
import { Enemy } from "@/lib/game/enemies";
import { HpBar } from "./HpBar";
import { CharaPortrait } from "./CharaPortrait";
import { DamagePop } from "./DamagePop";
import { SpecialMoveFlash } from "./SpecialMoveFlash";
import { SFX } from "@/lib/audio/sfx";

export function BattleArena({ result, playerHp, enemy, onFinished }: {
  result: BattleResult;
  playerHp: number;
  enemy: Enemy;
  onFinished: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [pHp, setPHp] = useState(playerHp);
  const [eHp, setEHp] = useState(enemy.stats.hp);
  const [pop, setPop] = useState<{ amount: number; crit: boolean; dodged: boolean; side: "left" | "right"; trigger: number } | null>(null);
  const [flash, setFlash] = useState<{ tech: string; key: number } | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (index >= result.turns.length) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        result.winner === "player" ? SFX.victory() : SFX.defeat();
        setTimeout(onFinished, 600);
      }
      return;
    }
    const t: TurnEvent = result.turns[index];
    const delay = 700;
    const h = setTimeout(() => {
      if (t.dodged) {
        setPop({ amount: 0, crit: false, dodged: true, side: t.actor === "player" ? "right" : "left", trigger: Date.now() });
      } else {
        if (t.actor === "player") setEHp(t.hpLeft.enemy);
        else setPHp(t.hpLeft.player);
        if (t.crit && t.techniqueName) { setFlash({ tech: t.techniqueName, key: Date.now() }); SFX.special(); }
        setPop({ amount: t.damage, crit: t.crit, dodged: false, side: t.actor === "player" ? "right" : "left", trigger: Date.now() });
      }
      setIndex(i => i + 1);
    }, delay);
    return () => clearTimeout(h);
  }, [index, result, onFinished]);

  return (
    <div className="space-y-3">
      <SpecialMoveFlash techName={flash?.tech ?? null} trigger={flash?.key ?? 0} />
      <div className="relative rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 ring-1 ring-slate-800 p-4 min-h-[320px]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <CharaPortrait />
            <div className="mt-2">
              <HpBar value={pHp} max={playerHp} color="bg-emerald-500" label="自分" />
            </div>
          </div>
          <div>
            <div className="aspect-[3/4] rounded-xl bg-gradient-to-b from-rose-950 to-slate-950 ring-1 ring-rose-900/50 grid place-items-center">
              <div className="text-center">
                <div className="text-4xl mb-2">👹</div>
                <div className="font-bold" style={{ fontFamily: "serif" }}>{enemy.name}</div>
                <div className="text-xs text-slate-500 mt-1">{enemy.element === "magic" ? "読み型" : "拳型"}</div>
              </div>
            </div>
            <div className="mt-2">
              <HpBar value={eHp} max={enemy.stats.hp} color="bg-rose-500" label={enemy.name} />
            </div>
          </div>
        </div>
        {pop && <DamagePop {...pop} />}
      </div>
    </div>
  );
}
