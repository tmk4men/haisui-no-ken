"use client";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { GameState } from "@/types/game";

export function AchievementsPanel({ state }: { state: GameState }) {
  const unlocked = ACHIEVEMENTS.filter(a => state.achievements[a.id]).length;
  return (
    <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-2">称号 ({unlocked}/{ACHIEVEMENTS.length})</h3>
      <div className="grid grid-cols-2 gap-2">
        {ACHIEVEMENTS.map(a => {
          const got = !!state.achievements[a.id];
          return (
            <div key={a.id} className={`rounded-lg p-2 text-xs ring-1 ${got ? "bg-amber-900/20 ring-amber-700/50" : "bg-slate-950 ring-slate-800 opacity-50"}`}>
              <div className={got ? "font-bold text-amber-300" : "text-slate-400"} style={{ fontFamily: "serif" }}>{got ? a.name : "？？？"}</div>
              <div className="text-slate-500">{a.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
