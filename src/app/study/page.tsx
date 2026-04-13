"use client";
import { useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { PageHero } from "@/components/PageHero";

const SUBJECTS = ["数学", "英語", "プログラミング", "読書", "資格", "その他"];

export default function StudyPage() {
  const { state, addStudy } = useGameState();
  const [minutes, setMinutes] = useState(25);
  const [subject, setSubject] = useState<string>("プログラミング");

  if (!state) return <div className="text-slate-400 font-kan">読み込み中…</div>;

  const submit = () => {
    addStudy(minutes, subject);
    setMinutes(25);
  };

  return (
    <div className="space-y-5">
      <PageHero image="/chara/勉強.webp" title="読み込み" desc="頭を研ぐ。刻んだ分だけ、知略は深まる。" />

      <div className="panel-washi rounded-xl p-4 space-y-4">
        <div>
          <label className="block text-[11px] font-kan tracking-widest text-rose-300/70 mb-1.5">時間（分）</label>
          <input type="number" min={1} value={minutes}
            onChange={e => setMinutes(Number(e.target.value))}
            className="w-full bg-black/40 border border-slate-800 rounded-md p-3 font-mono text-lg" />
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
        <button onClick={submit}
          className="slash-on-hover w-full border border-rose-800/60 bg-rose-950/30 hover:bg-rose-900/40 rounded-md py-3 font-kan tracking-[0.3em] text-rose-100">
          刻む（頭 +{(minutes * 0.05).toFixed(1)}）
        </button>
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
