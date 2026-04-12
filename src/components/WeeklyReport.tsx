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
    <div className="fixed inset-0 z-40 bg-black/70 grid place-items-center p-4" onClick={close}>
      <div onClick={e => e.stopPropagation()} className="max-w-md w-full rounded-xl bg-slate-900 ring-1 ring-slate-700 p-5 space-y-3">
        <div className="text-xs text-slate-400">週次の振り返り</div>
        <div className="text-xl font-bold" style={{ fontFamily: "serif" }}>{r.from} 〜 {r.to}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Cell label="稼働日" value={`${r.activeDays}日`} />
          <Cell label="スクワット" value={`${r.squats}回`} />
          <Cell label="腕立て" value={`${r.pushups}回`} />
          <Cell label="プランク" value={`${r.plankSec}秒`} />
          <Cell label="勉強" value={`${r.studyMin}分`} />
          <Cell label="戦績" value={`${r.wins}勝${r.losses}敗`} />
          <Cell label="拳+" value={r.bodyGained.toFixed(1)} />
          <Cell label="頭+" value={r.mindGained.toFixed(1)} />
        </div>
        <button onClick={close} className="w-full bg-amber-600 hover:bg-amber-500 rounded-lg py-2 font-semibold">
          来週も、止まるな
        </button>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-950 ring-1 ring-slate-800 p-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}
