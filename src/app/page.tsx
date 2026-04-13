"use client";
import { useGameState } from "@/hooks/useGameState";
import { StatsPanel } from "@/components/StatsPanel";
import { NavCard } from "@/components/NavCard";
import { MissionsPanel } from "@/components/MissionsPanel";
import { WeeklyChart } from "@/components/WeeklyChart";
import { CharaPortrait } from "@/components/CharaPortrait";
import { NAV_ICONS } from "@/components/icons";
import { EXP_PER_LEVEL } from "@/lib/game/constants";

export default function HomePage() {
  const { state, derived, todayStats, revengeActive } = useGameState();
  if (!state || !derived || !todayStats) return <div className="text-slate-400 font-kan">読み込み中…</div>;
  const c = state.character;
  const expInLevel = c.exp % EXP_PER_LEVEL;
  const expPct = Math.min(100, Math.round((expInLevel / EXP_PER_LEVEL) * 100));
  return (
    <div className="space-y-6">
      <section className="panel-washi rounded-xl p-5 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-50 pointer-events-none"
          style={{ backgroundImage: "url('/chara/hero-bg.png')" }}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30 pointer-events-none" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-6 -right-4 text-[160px] leading-none font-brush text-rose-950/40 select-none pointer-events-none">漢</div>
        <div className="grid grid-cols-[116px_1fr] gap-4 items-stretch mb-4 relative">
          <CharaPortrait />
          <div className="flex flex-col gap-1.5 justify-between">
            <div className="flex items-center gap-2">
              <span className="hanko">主人公</span>
              <span className="text-[10px] text-slate-500 tracking-widest font-kan">Lv {c.level}</span>
            </div>
            <div className="font-brush text-[28px] leading-none ink-title">{c.name}</div>

            <div className="pt-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-kan mb-1">
                <span>経験値</span>
                <span className="font-mono text-slate-300">{expInLevel}/{EXP_PER_LEVEL}</span>
              </div>
              <div className="bar-track h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300"
                  style={{ width: `${expPct}%`, boxShadow: "0 0 8px rgba(251,191,36,0.5)" }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {c.skillPoints > 0 && <Badge tone="gold">◈ 技{c.skillPoints}</Badge>}
              <Badge tone="amber">炎 {state.streak}日連続</Badge>
              {state.winStreak > 0 && <Badge tone="emerald">勝 {state.winStreak}連勝</Badge>}
              {revengeActive && <Badge tone="rose">怒 覚えてろよ +20%</Badge>}
            </div>
          </div>
        </div>
        <StatsPanel base={c.base} derived={derived} />

        <div className="relative mt-4">
          <MissionsPanel missions={todayStats.missions} />
        </div>
      </section>

      <section className="panel-washi rounded-xl p-4">
        <h3 className="text-xs font-kan text-rose-300/80 mb-3 tracking-[0.2em]">⟢ 今日刻んだ分</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <Tile label="スクワ" value={todayStats.squatReps} color="text-rose-300" />
          <Tile label="腕立て" value={todayStats.pushupReps} color="text-rose-300" />
          <Tile label="プランク" value={`${Math.floor(todayStats.plankSec)}秒`} color="text-amber-300" />
          <Tile label="読込分" value={todayStats.studyMin} color="text-sky-300" />
        </div>
      </section>

      <WeeklyChart state={state} />

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <NavCard href="/train" title="シバキ上げ" desc="スクワ/腕立/プランク" Icon={NAV_ICONS.train} />
        <NavCard href="/study" title="読み込み" desc="頭を研ぐ" Icon={NAV_ICONS.study} />
        <NavCard href="/battle" title="出入り" desc="殴り合い" Icon={NAV_ICONS.battle} />
        <NavCard href="/skills" title="技の覚書" desc="スキル習得" Icon={NAV_ICONS.skills} />
        <NavCard href="/equipment" title="装具" desc="手に入れた装備" Icon={NAV_ICONS.equipment} />
        <NavCard href="/character" title="漢" desc="詳細/実績/データ" Icon={NAV_ICONS.character} />
      </section>
    </div>
  );
}

function Tile({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="py-1">
      <div className={`text-2xl font-black font-mono ${color} drop-shadow-[0_0_8px_rgba(251,113,133,0.25)]`}>{value}</div>
      <div className="text-[10px] text-slate-500 font-kan tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "gold" | "amber" | "emerald" | "rose" }) {
  const tones: Record<string, string> = {
    gold:    "border-amber-600/60 text-amber-200 bg-amber-950/30",
    amber:   "border-orange-700/60 text-orange-200 bg-orange-950/30",
    emerald: "border-emerald-700/60 text-emerald-200 bg-emerald-950/30",
    rose:    "border-rose-700/60 text-rose-200 bg-rose-950/30",
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-kan tracking-wider px-2 py-0.5 rounded-sm border ${tones[tone]}`}>
      {children}
    </span>
  );
}
