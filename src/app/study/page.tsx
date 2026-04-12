"use client";
import { useState } from "react";
import { useGameState } from "@/hooks/useGameState";

const SUBJECTS = ["数学", "英語", "プログラミング", "読書", "資格", "その他"];

export default function StudyPage() {
  const { state, addStudy } = useGameState();
  const [minutes, setMinutes] = useState(25);
  const [subject, setSubject] = useState<string>("プログラミング");

  if (!state) return <div className="text-slate-400">読み込み中…</div>;

  const submit = () => {
    addStudy(minutes, subject);
    setMinutes(25);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">勉強記録</h2>
      <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-4 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">時間（分）</label>
          <input
            type="number"
            min={1}
            value={minutes}
            onChange={e => setMinutes(Number(e.target.value))}
            className="w-full bg-slate-950 rounded-lg p-3 ring-1 ring-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">科目</label>
          <div className="flex gap-2 flex-wrap">
            {SUBJECTS.map(s => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-full text-sm ring-1 ${
                  subject === s ? "bg-sky-600 ring-sky-500" : "bg-slate-800 ring-slate-700 text-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <button onClick={submit} className="w-full bg-sky-600 hover:bg-sky-500 rounded-xl py-3 font-semibold">
          記録する（Mind +{(minutes * 0.05).toFixed(1)}）
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-2">最近の記録</h3>
        <div className="space-y-2">
          {state.studies.slice(0, 10).map(s => (
            <div key={s.id} className="rounded-lg bg-slate-900 ring-1 ring-slate-800 p-3 flex justify-between text-sm">
              <span>{s.date} / {s.subject ?? "-"}</span>
              <span className="font-mono text-sky-300">{s.minutes} 分</span>
            </div>
          ))}
          {state.studies.length === 0 && <div className="text-slate-500 text-sm">まだ記録がありません</div>}
        </div>
      </div>
    </div>
  );
}
