"use client";
import { useEffect, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { buildWeeklyReport, shouldShowWeeklyReport } from "@/lib/game/weeklyReport";

export function WeeklyReportModal() {
  const { state, markWeeklyReportShown } = useGameState();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (state && shouldShowWeeklyReport(state)) setShow(true);
  }, [state]);
  if (!state || !show) return null;
  const r = buildWeeklyReport(state);
  const close = () => { markWeeklyReportShown(); setShow(false); };
  return (
    <div className="fixed inset-0 z-40 bg-black/80 grid place-items-center p-4" onClick={close}>
      <div onClick={e => e.stopPropagation()} className="panel-washi max-w-md w-full rounded-xl p-5 space-y-4 border border-rose-900/60">
        <div className="flex items-baseline gap-2">
          <span className="hanko">週報</span>
          <h3 className="font-brush text-2xl ink-title">一週の覚書</h3>
        </div>
        <div className="text-[11px] text-rose-300/70 font-kan tracking-widest">{r.from} 〜 {r.to}</div>
        <div className="grid grid-cols-2 gap-2">
          <Cell label="稼働日" value={`${r.activeDays}日`} />
          <Cell label="スクワ" value={`${r.squats}回`} />
          <Cell label="腕立て" value={`${r.pushups}回`} />
          <Cell label="プランク" value={`${r.plankSec}秒`} />
          <Cell label="勉学" value={`${r.studyMin}分`} />
          <Cell label="戦績" value={`${r.wins}勝${r.losses}敗`} />
          <Cell label="拳+" value={r.bodyGained.toFixed(1)} />
          <Cell label="頭+" value={r.mindGained.toFixed(1)} />
        </div>
        <button onClick={close}
          className="slash-on-hover w-full border border-rose-800/70 bg-rose-950/40 hover:bg-rose-900/40 rounded-md py-3 font-brush text-lg ink-title tracking-widest">
          来週も、止まるな
        </button>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-black/40 border border-slate-800 p-2.5">
      <div className="text-[10px] text-slate-500 font-kan tracking-widest">{label}</div>
      <div className="font-mono font-bold text-slate-100 mt-0.5">{value}</div>
    </div>
  );
}
