"use client";
export function DamagePop({ amount, crit, dodged, side, trigger }: { amount: number; crit: boolean; dodged: boolean; side: "left" | "right"; trigger: number }) {
  if (!trigger) return null;
  const text = dodged ? "MISS" : amount;
  const color = dodged ? "text-slate-400" : crit ? "text-amber-300" : side === "right" ? "text-rose-300" : "text-emerald-300";
  const glow = dodged
    ? "0 0 8px rgba(148,163,184,0.5)"
    : crit
    ? "0 0 18px rgba(251,191,36,0.95), 0 0 36px rgba(251,146,60,0.7), 0 2px 0 #000"
    : side === "right"
    ? "0 0 14px rgba(244,63,94,0.9), 0 2px 0 #000"
    : "0 0 14px rgba(52,211,153,0.9), 0 2px 0 #000";
  const rayColor = crit ? "#fbbf24" : side === "right" ? "#f43f5e" : "#34d399";

  return (
    <div key={trigger}
      className={`absolute ${side === "left" ? "left-4" : "right-4"} top-1/3 pointer-events-none z-20`}>
      {!dodged && (
        <>
          <svg width="160" height="160" viewBox="-80 -80 160 160"
               className="absolute -top-8 -left-8"
               style={{ animation: "burstScale 520ms cubic-bezier(0.2,0.9,0.2,1) forwards" }}>
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return <line key={i}
                x1={Math.cos(a) * 14} y1={Math.sin(a) * 14}
                x2={Math.cos(a) * 56} y2={Math.sin(a) * 56}
                stroke={rayColor} strokeWidth={crit ? 3 : 2} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${rayColor})` }} />;
            })}
            <circle r={crit ? 22 : 16} fill={rayColor} opacity="0.35" />
          </svg>
          {[...Array(crit ? 8 : 5)].map((_, i) => (
            <span key={i} className="absolute block"
              style={{
                left: `${30 + Math.cos(i * 1.3) * 20}px`,
                top: `${30 + Math.sin(i * 1.7) * 20}px`,
                width: "5px", height: "5px", borderRadius: "50%", background: rayColor,
                filter: `drop-shadow(0 0 6px ${rayColor})`,
                animation: `spark${i % 3} 620ms ${i * 20}ms ease-out forwards`,
              }} />
          ))}
        </>
      )}
      <div className={`relative ${color}`}
           style={{
             fontFamily: "serif",
             fontWeight: 900,
             fontSize: crit ? "56px" : "44px",
             letterSpacing: "-0.03em",
             textShadow: glow,
             animation: crit ? "damagePopCrit 900ms cubic-bezier(.2,.9,.2,1) forwards" : "damagePop 750ms ease-out forwards",
             WebkitTextStroke: crit ? "1.5px #78350f" : undefined,
           }}>
        {crit && <span className="absolute -top-4 left-0 text-[11px] font-kan tracking-[0.3em] text-amber-200">会心</span>}
        {text}
      </div>
      <style>{`
        @keyframes damagePop {
          0%   { transform: translateY(8px) scale(0.4); opacity: 0; }
          25%  { transform: translateY(-6px) scale(1.25); opacity: 1; }
          60%  { transform: translateY(-18px) scale(1); opacity: 1; }
          100% { transform: translateY(-44px) scale(0.9); opacity: 0; }
        }
        @keyframes damagePopCrit {
          0%   { transform: translateY(10px) scale(0.3) rotate(-8deg); opacity: 0; }
          20%  { transform: translateY(-4px) scale(1.5) rotate(3deg); opacity: 1; }
          45%  { transform: translateY(-12px) scale(1.1) rotate(-2deg); opacity: 1; }
          70%  { transform: translateY(-22px) scale(1.15) rotate(1deg); opacity: 1; }
          100% { transform: translateY(-56px) scale(0.95) rotate(0); opacity: 0; }
        }
        @keyframes burstScale {
          0%   { transform: scale(0.2); opacity: 0; }
          30%  { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes spark0 { to { transform: translate(24px, -28px) scale(0); opacity: 0; } }
        @keyframes spark1 { to { transform: translate(-22px, -30px) scale(0); opacity: 0; } }
        @keyframes spark2 { to { transform: translate(6px, -40px) scale(0); opacity: 0; } }
      `}</style>
    </div>
  );
}
