"use client";

import { useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { todayKey } from "@/lib/game/date";
import { TITLE, TAGLINE } from "@/lib/ui/labels";

const SITE_URL = "https://haisui-no-ken.vercel.app";

export function ShareButton() {
  const { state, shareForHp } = useGameState();
  const [flash, setFlash] = useState<string | null>(null);
  if (!state) return null;

  const today = todayKey();
  const alreadyShared = state.lastShareDate === today;
  const full = state.worldHp >= (state.worldHpMax ?? 5);
  const disabled = alreadyShared || full;

  const onClick = async () => {
    const c = state.character;
    const text = `『${TITLE}』Lv.${c.level}｜${TAGLINE}\n連続${state.streak}日 / 勝${state.winStreak}連勝`;
    const url = SITE_URL;
    let shared = false;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: TITLE, text, url });
        shared = true;
      } else {
        const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + "\n" + url)}`;
        window.open(intent, "_blank", "noopener,noreferrer");
        shared = true;
      }
    } catch {
      return;
    }
    if (!shared) return;
    const res = shareForHp();
    if (res.ok) setFlash("体力 +1");
    else if (res.reason === "already") setFlash("本日はもう共有済み");
    else if (res.reason === "full") setFlash("体力は既に万全");
    setTimeout(() => setFlash(null), 2500);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 text-[11px] font-kan tracking-widest rounded-sm px-3 py-1.5 border transition ${
          disabled
            ? "border-slate-800 text-slate-500 bg-slate-950/40"
            : "border-sky-700/70 text-sky-200 bg-sky-950/30 hover:bg-sky-900/40"
        }`}
        title={alreadyShared ? "本日は共有済み" : full ? "体力は万全" : "共有で体力+1（1日1回）"}
      >
        ◆ 共有して体力回復
      </button>
      {flash && <span className="text-[10px] text-rose-300 font-kan">{flash}</span>}
    </div>
  );
}
