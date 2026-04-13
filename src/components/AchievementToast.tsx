"use client";
import { useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";

export function AchievementToast() {
  const { newlyAchieved, ackAchievements } = useGameState();
  useEffect(() => {
    if (!newlyAchieved.length) return;
    const t = setTimeout(ackAchievements, 4500);
    return () => clearTimeout(t);
  }, [newlyAchieved, ackAchievements]);
  if (!newlyAchieved.length) return null;
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-[80vw]">
      {newlyAchieved.map(a => (
        <div key={a.id}
          className="panel-washi rounded-md border border-amber-600/70 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.6)] toast-in">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="hanko" style={{ borderColor: "#d4a24c", color: "#fde68a", background: "rgba(180,83,9,0.25)" }}>称号</span>
            <span className="text-[10px] text-amber-300/80 font-kan tracking-widest">獲得</span>
          </div>
          <div className="font-brush text-xl ink-title" style={{ color: "#fde68a" }}>{a.name}</div>
          <div className="text-[11px] text-amber-200/80 font-kan mt-0.5">{a.desc}</div>
        </div>
      ))}
      <style jsx>{`
        .toast-in { animation: toastIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        @keyframes toastIn {
          0%   { opacity: 0; transform: translateX(20px) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
