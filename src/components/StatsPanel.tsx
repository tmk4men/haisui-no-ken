"use client";
import { BaseStats, DerivedStats } from "@/types/game";
import { BASE_LABEL, DERIVED_LABEL } from "@/lib/ui/labels";

const BASE_MAX = 50;
const DERIVED_MAX: Record<keyof DerivedStats, number> = {
  hp: 300, attack: 80, defense: 80, magic: 80, speed: 80, focus: 80,
};

export function StatsPanel({ base, derived }: { base: BaseStats; derived: DerivedStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="panel-washi rounded-lg p-3">
        <h3 className="text-[11px] font-kan tracking-[0.2em] text-rose-300/80 mb-2">◆ 気合い</h3>
        <StatBar label={BASE_LABEL.body} value={base.body} max={BASE_MAX} color="rose" />
        <StatBar label={BASE_LABEL.mind} value={base.mind} max={BASE_MAX} color="sky" />
        <StatBar label={BASE_LABEL.discipline} value={base.discipline} max={BASE_MAX} color="amber" />
      </div>
      <div className="panel-washi rounded-lg p-3">
        <h3 className="text-[11px] font-kan tracking-[0.2em] text-rose-300/80 mb-2">◆ 実力</h3>
        <StatBar label={DERIVED_LABEL.hp} value={derived.hp} max={DERIVED_MAX.hp} color="emerald" />
        <StatBar label={DERIVED_LABEL.attack} value={derived.attack} max={DERIVED_MAX.attack} color="rose" />
        <StatBar label={DERIVED_LABEL.defense} value={derived.defense} max={DERIVED_MAX.defense} color="slate" />
        <StatBar label={DERIVED_LABEL.magic} value={derived.magic} max={DERIVED_MAX.magic} color="violet" />
        <StatBar label={DERIVED_LABEL.speed} value={derived.speed} max={DERIVED_MAX.speed} color="sky" />
        <StatBar label={DERIVED_LABEL.focus} value={derived.focus} max={DERIVED_MAX.focus} color="amber" />
      </div>
    </div>
  );
}

const BAR_GRAD: Record<string, string> = {
  rose:    "from-rose-600 to-rose-400",
  sky:     "from-sky-600 to-sky-400",
  amber:   "from-amber-600 to-amber-300",
  emerald: "from-emerald-600 to-emerald-400",
  violet:  "from-violet-600 to-violet-400",
  slate:   "from-slate-500 to-slate-300",
};

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (typeof value === "number" ? value : 0) / max * 100);
  const shown = typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(1)) : value;
  return (
    <div className="mb-1.5 last:mb-0">
      <div className="flex justify-between text-[11px] font-kan mb-0.5">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono text-slate-200">{shown}</span>
      </div>
      <div className="bar-track h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${BAR_GRAD[color]} rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
