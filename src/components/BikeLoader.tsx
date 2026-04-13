"use client";
import { useEffect, useState } from "react";
import { SFX } from "@/lib/audio/sfx";

export function BikeLoader() {
  const [phase, setPhase] = useState<"run" | "done">("run");
  useEffect(() => {
    SFX.bike();
    const t = setTimeout(() => setPhase("done"), 3800);
    return () => clearTimeout(t);
  }, []);
  if (phase === "done") return null;
  return (
    <div className="fixed inset-0 z-[60] pointer-events-none bike-root">
      {/* 路面のスピードライン */}
      <div className="absolute inset-x-0 top-1/2 h-28 -translate-y-1/2">
        {[...Array(8)].map((_, i) => (
          <div key={i}
            className="absolute h-[2px] bg-gradient-to-r from-transparent via-rose-400/70 to-transparent speed-line"
            style={{
              top: `${12 + i * 10}px`,
              width: `${30 + Math.random() * 40}%`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>
      {/* 暗転背景フェードアウト */}
      <div className="absolute inset-0 bg-black/95 bike-fade" />
      {/* 単車 */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 bike-move">
        <Bike />
      </div>
      {/* 排気煙 */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 smoke-move">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-slate-400/25 smoke-puff"
            style={{ left: `-${10 + i * 14}px`, top: `${-4 + Math.random() * 8}px`, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
      <style jsx>{`
        .bike-root { animation: rootFade 3.8s ease-out forwards; }
        .bike-fade { animation: bgFade 3.8s ease-in forwards; }
        @keyframes rootFade { 0%, 85% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes bgFade  { 0% { opacity: 1; } 60% { opacity: 0.6; } 100% { opacity: 0; } }

        .bike-move { animation: bikeRide 3s cubic-bezier(0.25, 0.1, 0.35, 1) forwards; }
        @keyframes bikeRide {
          0%   { transform: translate(-40vw, -50%) rotate(-1deg); }
          50%  { transform: translate(50vw, -50%) rotate(-1deg); }
          100% { transform: translate(140vw, -50%) rotate(0deg); }
        }

        .smoke-move { animation: bikeRide 3s cubic-bezier(0.25, 0.1, 0.35, 1) forwards; }
        .smoke-puff {
          width: 10px; height: 10px;
          animation: puff 0.9s ease-out infinite;
          filter: blur(3px);
        }
        @keyframes puff {
          0%   { transform: scale(0.6) translateX(0); opacity: 0.6; }
          100% { transform: scale(2.5) translateX(-40px); opacity: 0; }
        }

        .speed-line {
          right: 0;
          animation: speedPass 0.35s linear infinite;
          opacity: 0;
        }
        @keyframes speedPass {
          0%   { transform: translateX(100vw); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateX(-100vw); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* 単車SVG — 側面シルエット */
function Bike() {
  return (
    <svg width="220" height="120" viewBox="0 0 220 120" className="drop-shadow-[0_6px_14px_rgba(220,38,38,0.6)]">
      <defs>
        <linearGradient id="bikeBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f1f23" />
          <stop offset="100%" stopColor="#0a0a0f" />
        </linearGradient>
        <radialGradient id="headlight" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
          <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 後輪 */}
      <circle cx="50" cy="90" r="22" fill="#0a0a0f" stroke="#444" strokeWidth="2" />
      <circle cx="50" cy="90" r="6" fill="#666" />
      {/* 前輪 */}
      <circle cx="180" cy="90" r="22" fill="#0a0a0f" stroke="#444" strokeWidth="2" />
      <circle cx="180" cy="90" r="6" fill="#666" />
      {/* フレーム下 */}
      <path d="M40 90 L80 60 L150 60 L180 90 Z" fill="url(#bikeBody)" stroke="#dc2626" strokeWidth="1.5" />
      {/* タンク */}
      <path d="M80 60 Q100 40 140 45 L150 60 Z" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" />
      {/* シート */}
      <path d="M60 60 L90 55 L95 62 L60 62 Z" fill="#111" />
      {/* ハンドル */}
      <path d="M150 55 L170 35 L185 35" stroke="#666" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* ライト */}
      <circle cx="193" cy="55" r="14" fill="url(#headlight)" />
      <circle cx="193" cy="55" r="5" fill="#fef3c7" />
      {/* 排気 */}
      <path d="M42 78 L25 80 L25 84 L42 82 Z" fill="#333" />
      {/* 運転手シルエット */}
      <path d="M95 60 Q95 35 108 30 Q120 28 125 40 L128 55 Q130 62 122 62 Z" fill="#0a0a0f" stroke="#444" strokeWidth="1" />
      <circle cx="113" cy="28" r="7" fill="#0a0a0f" stroke="#444" strokeWidth="1" />
      {/* 地面スピード線 */}
      <line x1="10" y1="112" x2="210" y2="112" stroke="#dc2626" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}
