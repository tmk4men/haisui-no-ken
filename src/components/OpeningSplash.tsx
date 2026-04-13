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

  const start = () => {
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
    setPhase("bike");
  };

  return (
    <div
      onClick={start}
      className="fixed inset-0 z-[70] cursor-pointer select-none overflow-hidden bg-black"
    >
      {/* 背景：ぼかした立ち絵を画面全体に、その上にハッキリした立ち絵を中央に */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110"
        style={{ backgroundImage: "url('/chara/hero-bg.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90 pointer-events-none" />

      {/* 和紙風ビネット */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)"
      }} />

      {/* タイトル風の大きな漢字 */}
      <div className="absolute top-6 left-6 font-brush text-[96px] leading-none text-rose-900/50 select-none pointer-events-none">漢</div>
      <div className="absolute top-8 right-8 font-brush text-[10px] tracking-[0.5em] text-rose-300/60 rotate-90 origin-top-right">- PROLOGUE -</div>

      {/* 立ち絵（object-contain） */}
      <div className="absolute inset-x-0 top-0 bottom-48 flex items-end justify-center px-4 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/chara/main.webp"
          alt="主人公"
          className="h-full max-h-[80vh] object-contain drop-shadow-[0_20px_40px_rgba(220,38,38,0.35)] hero-float"
        />
      </div>

      {/* 下のフェード + セリフ */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-6 pt-12 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-md mx-auto panel-washi rounded-xl border border-rose-800/70 bg-black/70 backdrop-blur p-4 shadow-[0_0_30px_rgba(244,63,94,0.25)]">
          <div className="flex items-baseline justify-between mb-1">
            <span className="hanko">主人公</span>
            <span className="text-[9px] tracking-[0.4em] text-rose-300/60 font-kan">朝</span>
          </div>
          <div className="font-brush text-[26px] leading-tight text-rose-100 ink-title">「今日もカマすか」</div>
        </div>
        <div className="mt-3 text-center text-xs text-slate-400 font-kan tracking-[0.3em] tap-prompt">▶ タップして始める</div>
      </div>

      <style jsx>{`
        .hero-float { animation: heroFloat 4s ease-in-out infinite; }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .tap-prompt { animation: tapPulse 1.6s ease-in-out infinite; }
        @keyframes tapPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
