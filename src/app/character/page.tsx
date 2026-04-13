"use client";
import { useRef, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { StatsPanel } from "@/components/StatsPanel";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { ENEMIES } from "@/lib/game/enemies";
import { exportState, importStateFromFile } from "@/lib/storage/exportImport";

export default function CharacterPage() {
  const { state, derived, reset, replaceState, renameCharacter } = useGameState();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  if (!state || !derived) return <div className="text-slate-400 font-kan">読み込み中…</div>;
  const c = state.character;

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const imported = await importStateFromFile(f);
      if (confirm("現在のデータを上書きしてインポートします。よろしいですか？")) replaceState(imported);
    } catch (err) { alert("インポート失敗: " + (err as Error).message); }
  };

  const commitName = () => {
    if (draft.trim()) renameCharacter(draft);
    setEditing(false);
  };

  return (
    <div className="space-y-5">
      <h2 className="font-brush text-2xl ink-title blood-stroke">漢の詳細</h2>

      <div className="panel-washi rounded-xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-slate-500 font-kan tracking-widest mb-1">名乗り</div>
            {editing ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") commitName(); if (e.key === "Escape") setEditing(false); }}
                  maxLength={16}
                  className="flex-1 bg-black/40 border border-rose-900/60 rounded-md px-3 py-2 font-brush text-2xl text-slate-100"
                  placeholder="16字以内"
                />
                <button onClick={commitName} className="text-xs font-kan bg-amber-700 hover:bg-amber-600 rounded px-3 tracking-widest">確定</button>
                <button onClick={() => setEditing(false)} className="text-xs font-kan text-slate-400 underline">やめる</button>
              </div>
            ) : (
              <div className="flex items-baseline gap-3">
                <div className="font-brush text-3xl ink-title truncate">{c.name}</div>
                <button onClick={() => { setDraft(c.name); setEditing(true); }}
                        className="text-[10px] text-rose-300/80 hover:text-rose-200 font-kan tracking-widest underline shrink-0">
                  改名
                </button>
              </div>
            )}
            <div className="text-xs text-slate-400 font-kan mt-1">
              Lv {c.level} / EXP {c.exp} / 連続 {state.streak}日 / 連勝 {state.winStreak}
            </div>
          </div>
        </div>
      </div>

      <StatsPanel base={c.base} derived={derived} />

      <AchievementsPanel state={state} />

      <section className="space-y-2">
        <h3 className="font-kan tracking-[0.2em] text-rose-300/80 text-sm">◆ 最近の喧嘩</h3>
        <div className="space-y-1.5">
          {state.battles.slice(0, 10).map(b => {
            const e = ENEMIES.find(x => x.id === b.enemyId);
            return (
              <div key={b.id} className="panel-washi rounded-md p-2.5 flex justify-between items-center text-xs font-kan">
                <span className="truncate">{e?.name ?? b.enemyId}</span>
                <span className={`font-mono shrink-0 ml-2 ${b.result === "win" ? "text-emerald-300" : "text-rose-300"}`}>
                  {b.result === "win" ? "勝" : "負"} / EXP+{b.expGained}
                </span>
              </div>
            );
          })}
          {state.battles.length === 0 && <div className="text-slate-500 text-sm font-kan">まだ履歴がありません</div>}
        </div>
      </section>

      <section className="flex flex-wrap gap-2 pt-4 border-t border-slate-800/80">
        <button onClick={() => exportState(state)} className="text-xs font-kan bg-slate-800 hover:bg-slate-700 rounded-md px-3 py-2 tracking-widest">JSON出力</button>
        <button onClick={() => fileRef.current?.click()} className="text-xs font-kan bg-slate-800 hover:bg-slate-700 rounded-md px-3 py-2 tracking-widest">JSON入力</button>
        <input ref={fileRef} type="file" accept="application/json" onChange={onImport} className="hidden" />
        <button onClick={() => { if (confirm("全データをリセットしますか？")) reset(); }}
                className="text-xs font-kan text-rose-400 hover:text-rose-300 underline ml-auto tracking-widest">データをリセット</button>
      </section>
    </div>
  );
}
