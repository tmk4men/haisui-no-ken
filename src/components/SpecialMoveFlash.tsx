"use client";
import { useEffect, useState } from "react";

type TechKind = "konshin" | "yomikiri" | "fudou" | "hadou" | "enemy_phys" | "enemy_mag" | "generic";

function kindFromName(name: string): TechKind {
  if (name.includes("渾身")) return "konshin";
  if (name.includes("読み切")) return "yomikiri";
  if (name.includes("不動")) return "fudou";
  if (name.includes("破道")) return "hadou";
  if (name.includes("呪い")) return "enemy_mag";
  if (name.includes("一撃")) return "enemy_phys";
  return "generic";
}

export function SpecialMoveFlash({ techName, trigger }: { techName: string | null; trigger: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!techName) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1000);
    return () => clearTimeout(t);
  }, [trigger, techName]);
  if (!show || !techName) return null;
  const kind = kindFromName(techName);
  return (
    <div className="fixed inset-0 z-50 pointer-events-none grid place-items-center bg-black/70 overflow-hidden tech-flash-root">
      <TechEffect kind={kind} />
      <div className="relative z-10 text-center">
        <div className="text-xs tracking-[0.6em] text-rose-300 mb-2 font-kan opacity-80 tech-label-sub">必殺</div>
        <div className={`font-brush text-[56px] leading-none tech-name tech-name-${kind}`}>
          《{techName}》
        </div>
      </div>
      <style jsx>{`
        .tech-flash-root { animation: flashFade 1s ease-out forwards; }
        .tech-name { animation: slashIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .tech-label-sub { animation: fadeInDown 0.5s ease-out both; }
        .tech-name-konshin { color: #fca5a5; text-shadow: 0 0 18px rgba(220,38,38,0.9), 0 0 40px rgba(220,38,38,0.6); }
        .tech-name-yomikiri { color: #e0f2fe; text-shadow: 0 0 18px rgba(56,189,248,0.9); }
        .tech-name-fudou { color: #fde68a; text-shadow: 0 0 18px rgba(251,191,36,0.9); }
        .tech-name-hadou { color: #f5d0fe; text-shadow: 0 0 20px rgba(232,121,249,0.9), 0 0 40px rgba(220,38,38,0.6); }
        .tech-name-enemy_phys { color: #fda4af; text-shadow: 0 0 18px rgba(190,18,60,0.9); }
        .tech-name-enemy_mag { color: #d8b4fe; text-shadow: 0 0 18px rgba(147,51,234,0.9); }
        .tech-name-generic { color: #fde68a; text-shadow: 0 0 18px rgba(251,191,36,0.8); }
        @keyframes flashFade { 0% { opacity: 0; } 10% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes slashIn {
          0%   { opacity: 0; transform: translateX(-40px) skewX(-15deg) scale(0.9); }
          40%  { opacity: 1; transform: translateX(0) skewX(-15deg) scale(1.08); }
          100% { opacity: 1; transform: translateX(0) skewX(0) scale(1); }
        }
        @keyframes fadeInDown {
          0%   { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function TechEffect({ kind }: { kind: TechKind }) {
  if (kind === "konshin" || kind === "enemy_phys") return <SlashEffect color="#dc2626" />;
  if (kind === "yomikiri") return <RingEffect color="#38bdf8" />;
  if (kind === "fudou") return <ShieldEffect />;
  if (kind === "hadou") return <BeamEffect />;
  if (kind === "enemy_mag") return <CurseEffect />;
  return <SlashEffect color="#f59e0b" />;
}

/* ========== 技エフェクト（純CSS/SVG） ========== */

function SlashEffect({ color }: { color: string }) {
  return (
    <>
      <div className="absolute inset-0">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              width: "140vw",
              height: "6px",
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              transform: `translate(-50%, -50%) rotate(${-20 + i * 20}deg)`,
              filter: `drop-shadow(0 0 14px ${color})`,
              animation: `slashCut 0.5s ${i * 0.08}s ease-out both`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes slashCut {
          0%   { opacity: 0; transform: translate(-150%, -50%) rotate(var(--r, 0deg)); }
          40%  { opacity: 1; }
          100% { opacity: 0; transform: translate(50%, -50%) rotate(var(--r, 0deg)); }
        }
      `}</style>
    </>
  );
}

function RingEffect({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: "80px",
            height: "80px",
            borderColor: color,
            filter: `drop-shadow(0 0 12px ${color})`,
            animation: `ringPulse 0.9s ${i * 0.15}s ease-out both`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ringPulse {
          0%   { opacity: 0; transform: scale(0.2); }
          30%  { opacity: 1; }
          100% { opacity: 0; transform: scale(8); }
        }
      `}</style>
    </div>
  );
}

function ShieldEffect() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg width="320" height="320" viewBox="0 0 200 200" className="shield-anim">
        <defs>
          <radialGradient id="sg" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#sg)" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />
        <circle cx="100" cy="100" r="55" fill="none" stroke="#fde68a" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
      </svg>
      <style jsx>{`
        .shield-anim { animation: shieldExpand 0.9s ease-out both; }
        @keyframes shieldExpand {
          0%   { opacity: 0; transform: scale(0.3) rotate(0deg); }
          40%  { opacity: 1; transform: scale(1.1) rotate(180deg); }
          100% { opacity: 0; transform: scale(1.3) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function BeamEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 beam-core"
        style={{
          width: "160vw", height: "16px",
          background: "linear-gradient(90deg, transparent, #f5d0fe 20%, #ffffff 50%, #dc2626 80%, transparent)",
          transform: "translate(-50%, -50%)",
          filter: "drop-shadow(0 0 20px #f5d0fe) drop-shadow(0 0 40px #dc2626)",
        }}
      />
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute beam-spark"
          style={{
            left: `${20 + i * 9}%`,
            top: "50%",
            width: "4px", height: "4px",
            background: "#fff",
            borderRadius: "50%",
            filter: "drop-shadow(0 0 8px #fff)",
            animation: `sparkFly 0.8s ${i * 0.05}s ease-out both`,
          }}
        />
      ))}
      <style jsx>{`
        .beam-core { animation: beamShoot 0.8s ease-out both; }
        @keyframes beamShoot {
          0%   { opacity: 0; transform: translate(-50%, -50%) scaleX(0); }
          30%  { opacity: 1; transform: translate(-50%, -50%) scaleX(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scaleX(1); }
        }
        @keyframes sparkFly {
          0%   { opacity: 0; transform: scale(0.3); }
          40%  { opacity: 1; transform: scale(2) translateY(-${Math.random() * 20}px); }
          100% { opacity: 0; transform: scale(0.3) translateY(-40px); }
        }
      `}</style>
    </div>
  );
}

function CurseEffect() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = 140;
        return (
          <div key={i} className="absolute font-brush text-3xl curse-rune"
            style={{
              color: "#d8b4fe",
              textShadow: "0 0 12px #a855f7",
              left: `calc(50% + ${Math.cos(angle) * r}px)`,
              top: `calc(50% + ${Math.sin(angle) * r}px)`,
              animation: `curseSpin 1s ${i * 0.02}s ease-out both`,
            }}
          >
            {"呪詛怨祟".charAt(i % 4)}
          </div>
        );
      })}
      <style jsx>{`
        @keyframes curseSpin {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0) rotate(0deg); }
          40%  { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(180deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
