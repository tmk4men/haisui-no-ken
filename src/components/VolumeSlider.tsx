"use client";

export function VolumeSlider({
  value, onChange, accent = "rose",
}: {
  value: number;
  onChange: (v: number) => void;
  accent?: "rose" | "amber";
}) {
  const pct = Math.round(value * 100);
  const fill = accent === "amber" ? "from-amber-500 to-amber-300" : "from-rose-600 to-rose-400";
  const glow = accent === "amber" ? "shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "shadow-[0_0_8px_rgba(244,63,94,0.6)]";
  const thumb = accent === "amber" ? "bg-amber-300 border-amber-100" : "bg-rose-400 border-rose-100";
  const step = 0.1;
  const clamp = (n: number) => Math.max(0, Math.min(1, Number(n.toFixed(2))));

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        className="shrink-0 w-10 h-10 rounded-md border border-slate-700 bg-black/40 text-slate-200 text-xl font-black active:bg-slate-800 hover:border-rose-700 transition"
        aria-label="音量を下げる"
      >−</button>

      <div className="relative flex-1 h-10 flex items-center">
        {/* トラック */}
        <div className="w-full h-3 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${fill} ${glow}`} style={{ width: `${pct}%` }} />
        </div>
        {/* つまみ（視覚的） */}
        <div
          aria-hidden
          className={`absolute w-6 h-6 rounded-full border-2 ${thumb} shadow-lg pointer-events-none transition-[left]`}
          style={{ left: `calc(${pct}% - 12px)` }}
        />
        {/* 実際の input（透明で重ねる） */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="音量"
        />
      </div>

      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        className="shrink-0 w-10 h-10 rounded-md border border-slate-700 bg-black/40 text-slate-200 text-xl font-black active:bg-slate-800 hover:border-rose-700 transition"
        aria-label="音量を上げる"
      >＋</button>

      <div className="shrink-0 w-14 text-right font-mono text-sm text-slate-200 tabular-nums">
        {pct}<span className="text-slate-500 text-xs">%</span>
      </div>
    </div>
  );
}
