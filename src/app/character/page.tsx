"use client";
import { useRef } from "react";
import { useGameState } from "@/hooks/useGameState";
import { StatsPanel } from "@/components/StatsPanel";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { exportState, importStateFromFile } from "@/lib/storage/exportImport";

export default function CharacterPage() {
  const { state, derived, reset, replaceState } = useGameState();
  const fileRef = useRef<HTMLInputElement>(null);
  if (!state || !derived) return <div className="text-slate-400">読み込み中…</div>;
  const c = state.character;

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const imported = await importStateFromFile(f);
      if (confirm("現在のデータを上書きしてインポートします。よろしいですか？")) replaceState(imported);
    } catch (err) { alert("インポート失敗: " + (err as Error).message); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">漢の詳細</h2>
      <div className="rounded-xl bg-slate-900 p-4 ring-1 ring-slate-800">
        <div className="text-2xl font-bold" style={{ fontFamily: "serif" }}>{c.name}</div>
        <div className="text-sm text-slate-400">Lv {c.level} / EXP {c.exp} / 連続 {state.streak}日 / 連勝 {state.winStreak}</div>
      </div>
      <StatsPanel base={c.base} derived={derived} />

      <AchievementsPanel state={state} />

      <section>
        <h3 className="text-sm font-semibold text-slate-400 mb-2">最近の出入り</h3>
        <div className="space-y-2">
          {state.battles.slice(0, 10).map(b => (
            <div key={b.id} className="rounded-lg bg-slate-900 ring-1 ring-slate-800 p-3 flex justify-between text-sm">
              <span>{b.enemyId}</span>
              <span className={b.result === "win" ? "text-emerald-300" : "text-rose-300"}>{b.result} / EXP+{b.expGained}</span>
            </div>
          ))}
          {state.battles.length === 0 && <div className="text-slate-500 text-sm">まだ履歴がありません</div>}
        </div>
      </section>

      <section className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
        <button onClick={() => exportState(state)} className="text-xs bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-2">JSONエクスポート</button>
        <button onClick={() => fileRef.current?.click()} className="text-xs bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-2">JSONインポート</button>
        <input ref={fileRef} type="file" accept="application/json" onChange={onImport} className="hidden" />
        <button onClick={() => { if (confirm("全データをリセットしますか？")) reset(); }} className="text-xs text-rose-400 underline ml-auto">データをリセット</button>
      </section>
    </div>
  );
}
