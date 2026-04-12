"use client";
import { useGameState } from "@/hooks/useGameState";
import { EQUIPMENT } from "@/lib/game/equipment";

const UNLOCK_LABEL = { totalSquats: "累計スクワット", totalStudyMin: "累計勉強（分）", wins: "累計勝利", level: "Lv" } as const;

export default function EquipmentPage() {
  const { state, equip } = useGameState();
  if (!state) return <div className="text-slate-400">読み込み中…</div>;
  const c = state.character;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">装具</h2>
      <div className="text-sm text-slate-400">装備中: {c.equippedId ? EQUIPMENT.find(e => e.id === c.equippedId)?.name : "なし"}</div>
      <button onClick={() => equip(undefined)} className="text-xs bg-slate-800 hover:bg-slate-700 rounded px-3 py-1.5">外す</button>
      <div className="grid gap-3">
        {EQUIPMENT.map(e => {
          const unlocked = c.equipmentUnlocked.includes(e.id);
          const equipped = c.equippedId === e.id;
          return (
            <div key={e.id} className={`rounded-xl ring-1 p-4 ${equipped ? "bg-amber-900/30 ring-amber-700" : unlocked ? "bg-slate-900 ring-slate-800" : "bg-slate-900/50 ring-slate-800 opacity-60"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold" style={{ fontFamily: "serif" }}>{e.name}</div>
                  <div className="text-xs text-slate-400">{e.desc}</div>
                  <div className="text-xs text-slate-500 italic mt-1">「{e.flavor}」</div>
                  {!unlocked && <div className="text-xs text-slate-500 mt-1">条件: {UNLOCK_LABEL[e.unlock.type]} {e.unlock.value} 以上</div>}
                </div>
                {unlocked && !equipped && (
                  <button onClick={() => equip(e.id)} className="text-xs bg-emerald-600 hover:bg-emerald-500 rounded px-3 py-1.5">装備</button>
                )}
                {equipped && <span className="text-xs text-amber-300">装備中</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
