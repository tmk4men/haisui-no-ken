export function HpBar({ value, max, color = "bg-emerald-500", label }: { value: number; max: number; color?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {label && <div className="text-xs text-slate-400 mb-0.5 flex justify-between"><span>{label}</span><span className="font-mono">{Math.max(0, Math.round(value))}/{max}</span></div>}
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full transition-[width] duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
