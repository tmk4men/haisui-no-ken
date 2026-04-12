import { DailyMission } from "@/types/game";
import { MISSION_LABEL } from "@/lib/ui/labels";

export function MissionsPanel({ missions }: { missions: DailyMission[] }) {
  if (missions.length === 0) return null;
  return (
    <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-3">今日のシノギ</h3>
      <div className="space-y-2">
        {missions.map(m => {
          const pct = Math.min(100, Math.round((m.progress / m.goal) * 100));
          return (
            <div key={m.id} className={`rounded-lg p-3 ring-1 ${m.completed ? "bg-emerald-900/30 ring-emerald-700" : "bg-slate-950 ring-slate-800"}`}>
              <div className="flex justify-between text-sm mb-1">
                <span>{MISSION_LABEL[m.type]} {m.progress}/{m.goal}</span>
                <span className="text-xs text-slate-400">報酬 EXP+{m.rewardExp}</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${m.completed ? "bg-emerald-400" : "bg-sky-500"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
