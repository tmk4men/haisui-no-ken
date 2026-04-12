"use client";
import { lastNDates } from "@/lib/game/date";
import { GameState } from "@/types/game";

export function WeeklyChart({ state }: { state: GameState }) {
  const days = lastNDates(7);
  const squatPerDay = days.map(d => state.squats.filter(s => s.date === d).reduce((a, s) => a + s.reps, 0));
  const studyPerDay = days.map(d => state.studies.filter(s => s.date === d).reduce((a, s) => a + s.minutes, 0));
  const maxSquat = Math.max(1, ...squatPerDay);
  const maxStudy = Math.max(1, ...studyPerDay);

  const W = 280, H = 80, P = 8;
  const path = (vals: number[], max: number) =>
    vals.map((v, i) => {
      const x = P + (i * (W - P * 2)) / (vals.length - 1);
      const y = H - P - (v / max) * (H - P * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

  return (
    <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-2">直近7日</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24">
        <path d={path(squatPerDay, maxSquat)} fill="none" stroke="#fb7185" strokeWidth="2" />
        <path d={path(studyPerDay, maxStudy)} fill="none" stroke="#38bdf8" strokeWidth="2" />
      </svg>
      <div className="flex justify-between text-xs text-slate-500 mt-1 font-mono">
        {days.map(d => <span key={d}>{d.slice(5)}</span>)}
      </div>
      <div className="flex gap-4 text-xs mt-2">
        <span className="text-rose-400">● スクワット</span>
        <span className="text-sky-400">● 勉強(分)</span>
      </div>
    </div>
  );
}
