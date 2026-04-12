"use client";
export function DamagePop({ amount, crit, dodged, side, trigger }: { amount: number; crit: boolean; dodged: boolean; side: "left" | "right"; trigger: number }) {
  if (!trigger) return null;
  const text = dodged ? "MISS" : amount;
  const color = dodged ? "text-slate-400" : crit ? "text-amber-300" : side === "right" ? "text-rose-300" : "text-emerald-300";
  return (
    <div key={trigger}
      className={`absolute ${side === "left" ? "left-8" : "right-8"} top-1/3 text-4xl font-black ${color} pointer-events-none`}
      style={{ animation: "damagePop 700ms ease-out forwards", fontFamily: "serif" }}>
      {text}
      <style>{`@keyframes damagePop { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-40px) scale(1.3); opacity: 0; } }`}</style>
    </div>
  );
}
