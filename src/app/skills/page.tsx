"use client";
import { useGameState } from "@/hooks/useGameState";
import { SKILLS } from "@/lib/game/skills";

export default function SkillsPage() {
  const { state, learnSkill } = useGameState();
  if (!state) return <div className="text-slate-400">読み込み中…</div>;
  const c = state.character;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">技の覚書</h2>
      <div className="text-sm text-slate-400">スキルポイント: <span className="text-amber-300 font-bold">{c.skillPoints}</span> (5Lv毎に1)</div>
      <div className="grid gap-3">
        {SKILLS.map(s => {
          const learned = c.skills.includes(s.id);
          const canLearn = !learned && c.skillPoints > 0;
          return (
            <div key={s.id} className={`rounded-xl ring-1 p-4 ${learned ? "bg-emerald-900/30 ring-emerald-700" : "bg-slate-900 ring-slate-800"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold" style={{ fontFamily: "serif" }}>{s.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
                </div>
                {learned
                  ? <span className="text-xs text-emerald-300">習得済</span>
                  : <button onClick={() => learnSkill(s.id)} disabled={!canLearn}
                      className="text-xs bg-amber-600 hover:bg-amber-500 disabled:opacity-30 rounded px-3 py-1.5">習得</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
