"use client";
import { useEffect, useState } from "react";
import { WORLD_HP_RECOVER_MS } from "@/lib/game/items";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function WorldHpCountdown({ lastRecoverAt, full }: { lastRecoverAt: number; full: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (full) return <span className="text-[10px] text-emerald-300 font-kan">万全</span>;
  const elapsed = now - (lastRecoverAt ?? now);
  const remaining = Math.max(0, WORLD_HP_RECOVER_MS - elapsed);
  return (
    <span className="text-[10px] font-mono text-slate-400">
      次回復 <span className="text-rose-300">{fmt(remaining)}</span>
    </span>
  );
}
