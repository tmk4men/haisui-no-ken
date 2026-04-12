"use client";
import { BaseStats, DerivedStats } from "@/types/game";
import { BASE_LABEL, DERIVED_LABEL } from "@/lib/ui/labels";

export function StatsPanel({ base, derived }: { base: BaseStats; derived: DerivedStats }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl bg-slate-900 p-4 ring-1 ring-slate-800">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">気合い</h3>
        <Row label={BASE_LABEL.body} value={base.body.toFixed(1)} color="text-rose-400" />
        <Row label={BASE_LABEL.mind} value={base.mind.toFixed(1)} color="text-sky-400" />
        <Row label={BASE_LABEL.discipline} value={base.discipline.toFixed(1)} color="text-amber-400" />
      </div>
      <div className="rounded-xl bg-slate-900 p-4 ring-1 ring-slate-800">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">実力</h3>
        <Row label={DERIVED_LABEL.hp} value={derived.hp} />
        <Row label={DERIVED_LABEL.attack} value={derived.attack} />
        <Row label={DERIVED_LABEL.defense} value={derived.defense} />
        <Row label={DERIVED_LABEL.magic} value={derived.magic} />
        <Row label={DERIVED_LABEL.speed} value={derived.speed} />
        <Row label={DERIVED_LABEL.focus} value={derived.focus} />
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-slate-300">{label}</span>
      <span className={`font-mono ${color ?? "text-slate-100"}`}>{value}</span>
    </div>
  );
}
