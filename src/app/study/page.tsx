"use client";
import { useEffect, useRef, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { PageHero } from "@/components/PageHero";
import { SFX } from "@/lib/audio/sfx";

const SUBJECTS = ["数学", "英語", "プログラミング", "読書", "資格", "その他"];
const PRESETS = [5, 15, 25] as const;
const MAX_MIN = 25;

export default function StudyPage() {
  const { state, addStudy } = useGameState();
  const [target, setTarget] = useState(25);
  const [remain, setRemain] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [subject, setSubject] = useState<string>("プログラミング");
  const [toast, setToast] = useState<string | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemain(r => {
        if (r <= 1) {
          clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && remain === 0) {
      setRunning(false);
      SFX.levelUp();
      commit(target, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remain, running]);

  if (!state) return <div className="text-slate-400 font-kan">読み込み中…</div>;

  const setDuration = (m: number) => {
    if (running) return;
    const clamped = Math.max(1, Math.min(MAX_MIN, m));
    setTarget(clamped);
    setRemain(clamped * 60);
  };

  const start = () => {
    if (remain <= 0) setRemain(target * 60);
    startRef.current = Date.now();
    setRunning(true);
    SFX.tap();
  };

  const pause = () => {
    setRunning(false);
    SFX.tap();
  };

  const reset = () => {
    setRunning(false);
    setRemain(target * 60);
    startRef.current = null;
  };

  const commit = (mins: number, auto: boolean) => {
    if (mins < 1) {
      setToast("1分未満は記録されない。");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    addStudy(mins, subject);
    setToast(auto ? `刻んだ：${mins}分（頭 +${(mins * 0.05).toFixed(1)}）` : `途中記録：${mins}分`);
    setTimeout(() => setToast(null), 2500);
    reset();
  };

  const stopAndRecord = () => {
    const elapsed = target * 60 - remain;
    const mins = Math.floor(elapsed / 60);
    setRunning(false);
    commit(mins, false);
  };

  const mm = String(Math.floor(remain / 60)).padStart(2, "0");
  const ss = String(remain % 60).padStart(2, "0");
  const pct = target > 0 ? 100 - (remain / (target * 60)) * 100 : 0;
  const circ = 2 * Math.PI * 90;

  return (
    <div className="space-y-5">
      <PageHero image="/chara/勉強.webp" title="勉学" desc="頭を研ぐ。ポモドーロで集中、25分が刃になる。" />

      <div className="panel-washi rounded-xl p-5 space-y-5">
        <div className="relative grid place-items-center">
          <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
            <circle cx="110" cy="110" r="90" stroke="#1e293b" strokeWidth="8" fill="none" />
            <circle cx="110" cy="110" r="90" stroke="url(#pg)" strokeWidth="8" fill="none"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear", filter: "drop-shadow(0 0 8px rgba(244,63,94,0.6))" }} />
            <defs>
              <linearGradient id="pg" x1="0" x2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className={`font-mono text-5xl tracking-wider ${running ? "text-rose-100" : "text-slate-300"}`}>
                {mm}:{ss}
              </div>
              <div className="text-[10px] font-kan tracking-[0.4em] text-rose-300/70 mt-1">
                {running ? "刻中" : remain === 0 ? "完了" : "待機"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 justify-center">
          {PRESETS.map(m => (
            <button key={m} onClick={() => setDuration(m)} disabled={running}
              className={`px-4 py-1.5 rounded-sm text-xs font-kan tracking-widest border transition ${
                target === m
                  ? "bg-rose-900/40 border-rose-700 text-rose-100"
                  : "bg-black/30 border-slate-800 text-slate-300 hover:border-rose-900/60"
              } ${running ? "opacity-40 cursor-not-allowed" : ""}`}>
              {m}分
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {!running ? (
            <button onClick={start}
              className="slash-on-hover col-span-2 border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/50 rounded-md py-3 font-kan tracking-[0.3em] text-rose-100">
              {remain === target * 60 ? "刻み始める" : "再開"}
            </button>
          ) : (
            <>
              <button onClick={pause}
                className="border border-amber-700/60 bg-amber-950/30 hover:bg-amber-900/40 rounded-md py-3 font-kan tracking-widest text-amber-100">
                一時停止
              </button>
              <button onClick={stopAndRecord}
                className="border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/50 rounded-md py-3 font-kan tracking-widest text-rose-100">
                中断して記録
              </button>
            </>
          )}
          {!running && remain !== target * 60 && (
            <button onClick={reset}
              className="col-span-2 border border-slate-700 bg-black/30 hover:bg-slate-900 rounded-md py-2 font-kan text-xs tracking-widest text-slate-300">
              リセット
            </button>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-kan tracking-widest text-rose-300/70 mb-1.5">科目</label>
          <div className="flex gap-1.5 flex-wrap">
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-sm text-xs font-kan tracking-widest border transition ${
                  subject === s
                    ? "bg-rose-900/40 border-rose-700 text-rose-100"
                    : "bg-black/30 border-slate-800 text-slate-300 hover:border-rose-900/60"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {toast && (
          <div className="text-center text-sm font-kan text-amber-200 panel-washi rounded-md py-2 border border-amber-800/50">
            {toast}
          </div>
        )}
      </div>

      <section className="space-y-2">
        <h3 className="font-kan tracking-[0.2em] text-rose-300/80 text-sm">◆ 最近の記録</h3>
        <div className="space-y-1.5">
          {state.studies.slice(0, 10).map(s => (
            <div key={s.id} className="panel-washi rounded-md p-2.5 flex justify-between items-center text-xs font-kan">
              <span className="truncate">{s.date} / {s.subject ?? "-"}</span>
              <span className="font-mono text-sky-300 shrink-0 ml-2">{s.minutes} 分</span>
            </div>
          ))}
          {state.studies.length === 0 && <div className="text-slate-500 text-sm font-kan">まだ記録がありません</div>}
        </div>
      </section>
    </div>
  );
}
