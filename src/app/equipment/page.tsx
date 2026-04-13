"use client";
import { useGameState } from "@/hooks/useGameState";
import { EQUIPMENT } from "@/lib/game/equipment";

const UNLOCK_LABEL = { totalSquats: "累計スクワット", totalStudyMin: "累計勉強（分）", wins: "累計勝利", level: "Lv" } as const;

export default function EquipmentPage() {
  const { state, equip } = useGameState();
  if (!state) return <div className="text-slate-400 font-kan">読み込み中…</div>;
  const c = state.character;
  const equipped = c.equippedId ? EQUIPMENT.find(e => e.id === c.equippedId) : null;

  return (
    <div className="space-y-5">
      <h2 className="font-brush text-2xl ink-title blood-stroke">装具</h2>

      <div className="panel-washi rounded-lg p-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-500 font-kan tracking-widest">装備中</div>
          <div className="font-brush text-xl text-slate-100">{equipped?.name ?? "—"}</div>
          {equipped && <div className="text-[10px] text-rose-300/70 font-kan mt-0.5">{equipped.desc}</div>}
        </div>
        {equipped && (
          <button onClick={() => equip(undefined)}
                  className="text-xs font-kan bg-slate-800 hover:bg-slate-700 rounded-md px-3 py-1.5 tracking-widest">
            外す
          </button>
        )}
      </div>

      <div className="grid gap-2">
        {EQUIPMENT.map(e => {
          const unlocked = c.equipmentUnlocked.includes(e.id);
          const isEquipped = c.equippedId === e.id;
          return (
            <div key={e.id}
              className={`panel-washi rounded-lg p-3 border transition ${
                isEquipped ? "border-amber-600/70 bg-amber-950/15" :
                unlocked ? "border-slate-800" : "border-slate-800/60 opacity-55"
              }`}>
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-brush text-xl text-slate-100">{e.name}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5 font-kan">{e.desc}</div>
                  <div className="text-[10px] text-slate-500 italic mt-1 font-kan">「{e.flavor}」</div>
                  {!unlocked && (
                    <div className="text-[10px] text-amber-300/80 mt-1.5 font-kan tracking-widest">
                      条件：{UNLOCK_LABEL[e.unlock.type]} {e.unlock.value} 以上
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {isEquipped ? (
                    <span className="text-[10px] font-kan text-amber-300 tracking-widest">装備中</span>
                  ) : unlocked ? (
                    <button onClick={() => equip(e.id)}
                      className="text-xs font-kan bg-emerald-700 hover:bg-emerald-600 rounded px-3 py-1.5 tracking-widest">
                      装備
                    </button>
                  ) : (
                    <span className="text-[10px] font-kan text-slate-500 tracking-widest">未解放</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
