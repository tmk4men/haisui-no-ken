"use client";
import { useEffect, useState } from "react";
import { BikeLoader } from "./BikeLoader";

const SEEN_KEY = "opening-seen-v1";

// プロローグの独白（短く、余白多め）
const PROLOGUE = [
  { text: "――あの夜、俺は膝をついていた。", sub: "" },
  { text: "大事なもん、奪われた。", sub: "何もできなかった。" },
  { text: "「金も、力もねえ奴は、黙って踏まれてろ」", sub: "そう、笑われた。" },
  { text: "…悔しさは、骨の奥まで沁みついた。", sub: "" },
  { text: "もう二度と、膝はつかねえ。", sub: "鍛える。殴る。取り返す。" },
];

export function OpeningSplash() {
  const [phase, setPhase] = useState<"hidden" | "prologue" | "intro" | "bike">("hidden");
  const [line, setLine] = useState(0);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (!localStorage.getItem(SEEN_KEY)) setPhase("prologue");
    } catch { /* ignore */ }
  }, []);

  if (phase === "hidden") return null;
  if (phase === "bike") return <BikeLoader />;

  if (phase === "prologue") {
    const cur = PROLOGUE[line];
    const next = () => {
      if (line < PROLOGUE.length - 1) setLine(line + 1);
      else setPhase("intro");
    };
    return (
      <div onClick={next} className="fixed inset-0 z-[70] bg-black cursor-pointer select-none overflow-hidden">
        {/* 和紙の傷 */}
        <div aria-hidden className="absolute inset-0 opacity-20" style={{
          background: "radial-gradient(ellipse at center, rgba(80,0,0,0.35), transparent 60%)"
        }} />
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.9) 100%)"
        }} />
        <div className="absolute top-6 left-6 font-brush text-[80px] leading-none text-rose-900/40 select-none">漢</div>
        <div className="absolute top-8 right-8 font-kan text-[10px] tracking-[0.5em] text-rose-300/60">
          {String(line + 1).padStart(2, "0")} / {String(PROLOGUE.length).padStart(2, "0")}
        </div>

        <div key={line} className="absolute inset-0 grid place-items-center px-8">
          <div className="max-w-md text-center space-y-4 prologue-fade">
            <div className="font-brush text-3xl sm:text-4xl leading-relaxed ink-title text-rose-50">
              {cur.text}
            </div>
            {cur.sub && (
              <div className="font-kan text-sm tracking-widest text-slate-400">{cur.sub}</div>
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-8 text-center text-xs font-kan text-slate-500 tracking-[0.3em] tap-prompt">
          ▶ タップで進む
        </div>

        <style jsx>{`
          .prologue-fade { animation: pfade 700ms ease-out; }
          @keyframes pfade {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .tap-prompt { animation: tapPulse 1.6s ease-in-out infinite; }
          @keyframes tapPulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // intro = 立ち絵＋「今日もカマすか」
  const start = () => {
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
    setPhase("bike");
  };

  return (
    <div onClick={start} className="fixed inset-0 z-[70] cursor-pointer select-none overflow-hidden bg-black">
      <div aria-hidden className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110" style={{ backgroundImage: "url('/chara/hero-bg.webp')" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90 pointer-events-none" />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)"
      }} />
      <div className="absolute top-6 left-6 font-brush text-[96px] leading-none text-rose-900/50 select-none pointer-events-none">漢</div>
      <div className="absolute top-8 right-8 font-brush text-[10px] tracking-[0.5em] text-rose-300/60 rotate-90 origin-top-right">- PROLOGUE -</div>

      <div className="absolute inset-x-0 top-0 bottom-48 flex items-end justify-center px-4 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/chara/main.webp" alt="主人公" className="h-full max-h-[80vh] object-contain drop-shadow-[0_20px_40px_rgba(220,38,38,0.35)] hero-float" />
      </div>

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
