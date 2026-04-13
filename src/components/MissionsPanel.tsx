import { DailyMission } from "@/types/game";
import { MISSION_LABEL } from "@/lib/ui/labels";

export function MissionsPanel({ missions }: { missions: DailyMission[] }) {
  if (missions.length === 0) return null;
  return (
    <div className="panel-washi rounded-xl p-4">
      <h3 className="text-xs font-kan text-rose-300/80 mb-3 tracking-[0.2em]">⟢ 今日のシノギ</h3>
      <div className="space-y-2.5">
        {missions.map(m => {
          const pct = Math.min(100, Math.round((m.progress / m.goal) * 100));
          const done = m.completed;
          return (
            <div
              key={m.id}
              className={`relative rounded-md p-3 border overflow-hidden ${
                done ? "border-emerald-700/60 bg-emerald-950/20" : "border-slate-800 bg-black/30"
              }`}
            >
              {done && (
                <span className="stamp-cleared absolute top-2 right-2 pointer-events-none">
                  完了
                </span>
              )}
              <div className="flex justify-between items-baseline text-sm mb-1.5 pr-14">
                <span className="font-kan text-slate-100 tracking-wide">
                  {MISSION_LABEL[m.type]}
                  <span className="ml-2 font-mono text-xs text-slate-400">{m.progress}/{m.goal}</span>
                </span>
                <span className="text-[10px] text-amber-300/80 font-kan shrink-0">EXP+{m.rewardExp}</span>
              </div>
              <div className="bar-track h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    done
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-300"
                      : "bg-gradient-to-r from-rose-700 via-rose-500 to-amber-400"
                  }`}
                  style={{ width: `${pct}%`, boxShadow: done ? "0 0 8px rgba(52,211,153,0.5)" : "0 0 8px rgba(239,68,68,0.35)" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
