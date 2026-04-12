"use client";
import { useGameState } from "@/hooks/useGameState";
import { StatsPanel } from "@/components/StatsPanel";
import { NavCard } from "@/components/NavCard";
import { MissionsPanel } from "@/components/MissionsPanel";
import { WeeklyChart } from "@/components/WeeklyChart";
import { CharaPortrait } from "@/components/CharaPortrait";

export default function HomePage() {
  const { state, derived, todayStats, revengeActive } = useGameState();
  if (!state || !derived || !todayStats) return <div className="text-slate-400">読み込み中…</div>;
  const c = state.character;
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 ring-1 ring-slate-800">
        <div className="grid grid-cols-[120px_1fr] gap-4 items-start mb-4">
          <CharaPortrait />
          <div className="space-y-1">
            <div className="text-xs text-slate-400">漢</div>
            <div className="text-2xl font-bold tracking-wider" style={{ fontFamily: "serif" }}>{c.name}</div>
            <div className="text-xs text-slate-300">Lv {c.level} / EXP {c.exp}</div>
            {c.skillPoints > 0 && <div className="text-xs text-amber-300">✦ 技ポイント {c.skillPoints}</div>}
            <div className="text-xs text-amber-300">🔥 {state.streak}日、途切れずやってる</div>
            {state.winStreak > 0 && <div className="text-xs text-emerald-300">⚔ {state.winStreak}連勝中</div>}
            {revengeActive && <div className="text-xs text-rose-300">💢 覚えてろよバフ（拳成長+20%）</div>}
          </div>
        </div>
        <StatsPanel base={c.base} derived={derived} />
      </section>

      <MissionsPanel missions={todayStats.missions} />

      <section className="rounded-xl bg-slate-900 p-4 ring-1 ring-slate-800">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">今日刻んだ分</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <Tile label="スクワット" value={todayStats.squatReps} color="text-rose-300" />
          <Tile label="腕立て" value={todayStats.pushupReps} color="text-rose-300" />
          <Tile label="プランク" value={`${Math.floor(todayStats.plankSec)}s`} color="text-amber-300" />
          <Tile label="勉強(分)" value={todayStats.studyMin} color="text-sky-300" />
        </div>
      </section>

      <WeeklyChart state={state} />

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <NavCard href="/train" title="🏋️ シバキ上げ" desc="スクワ/腕立/プランク" />
        <NavCard href="/study" title="📚 読み込み" desc="頭を研ぐ" />
        <NavCard href="/battle" title="⚔️ 出入り" desc="殴り合い" />
        <NavCard href="/skills" title="✦ 技の覚書" desc="スキル習得" />
        <NavCard href="/equipment" title="🎽 装具" desc="手に入れた装備" />
        <NavCard href="/character" title="漢" desc="詳細/実績/データ" />
      </section>
    </div>
  );
}

function Tile({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
