"use client";
import { useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";

export function AchievementToast() {
  const { newlyAchieved, ackAchievements } = useGameState();
  useEffect(() => {
    if (!newlyAchieved.length) return;
    const t = setTimeout(ackAchievements, 4000);
    return () => clearTimeout(t);
  }, [newlyAchieved, ackAchievements]);
  if (!newlyAchieved.length) return null;
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {newlyAchieved.map(a => (
        <div key={a.id} className="rounded-xl bg-amber-900/90 ring-1 ring-amber-500 px-4 py-3 shadow-xl">
          <div className="text-xs text-amber-200">称号獲得</div>
          <div className="font-bold text-amber-100" style={{ fontFamily: "serif" }}>{a.name}</div>
          <div className="text-xs text-amber-300/80">{a.desc}</div>
        </div>
      ))}
    </div>
  );
}
