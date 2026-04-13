"use client";
import { useEffect, useState } from "react";
import { BikeLoader } from "./BikeLoader";

const SEEN_KEY = "opening-seen-v1";

export function OpeningSplash() {
  const [phase, setPhase] = useState<"hidden" | "intro" | "bike">("hidden");

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (!localStorage.getItem(SEEN_KEY)) setPhase("intro");
    } catch { /* ignore */ }
  }, []);

  if (phase === "hidden") return null;
  if (phase === "bike") return <BikeLoader />;

  return (
    <div
      onClick={() => {
        try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
        setPhase("bike");
      }}
      className="fixed inset-0 z-[70] bg-black cursor-pointer select-none"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-90"
        style={{ backgroundImage: "url('/chara/main.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 pointer-events-none" />

      <div className="absolute inset-x-0 bottom-16 px-6 flex flex-col items-center gap-3">
        <div className="w-full max-w-md rounded-xl border border-rose-800/70 bg-black/80 backdrop-blur p-4 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
          <div className="text-[10px] tracking-[0.3em] text-rose-300/70 font-kan mb-1">主人公</div>
          <div className="font-brush text-2xl text-rose-100 ink-title">「今日もカマすか」</div>
        </div>
        <div className="text-xs text-slate-400 font-kan tracking-widest animate-pulse">▶ 画面をタップして始める</div>
      </div>
    </div>
  );
}
