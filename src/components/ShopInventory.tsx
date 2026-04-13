"use client";
import { ITEMS, SHOP_ITEMS } from "@/lib/game/items";
import { GameState } from "@/types/game";

export function ShopInventory({
  state, onBuy, onUseWorldItem,
}: {
  state: GameState;
  onBuy: (id: string) => boolean;
  onUseWorldItem: (id: string) => boolean;
}) {
  const inv = state.inventory ?? {};
  const coins = state.coins ?? 0;
  const entries = Object.entries(inv).filter(([, n]) => n > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-kan text-amber-300/90 tracking-[0.2em]">⟢ 売店</h3>
        <span className="font-mono text-xs text-amber-300">所持 {coins} コイン</span>
      </div>
      <div className="grid gap-2">
        {SHOP_ITEMS.map(id => {
          const it = ITEMS[id];
          if (!it || it.price == null) return null;
          const affordable = coins >= it.price;
          return (
            <div key={id} className="panel-washi rounded-lg p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded border border-amber-700/60 bg-amber-950/30 grid place-items-center font-brush text-amber-200">
                  {it.icon}
                </div>
                <div className="min-w-0">
                  <div className="font-kan text-sm text-slate-100">{it.name}</div>
                  <div className="text-[10px] text-slate-400 font-kan truncate">{it.desc}</div>
                </div>
              </div>
              <button
                onClick={() => onBuy(id)}
                disabled={!affordable}
                className={`shrink-0 font-kan text-xs rounded px-3 py-1.5 border ${
                  affordable ? "border-amber-600 text-amber-200 bg-amber-950/40 hover:bg-amber-900/40" : "border-slate-800 text-slate-600 bg-black/30"
                }`}
              >
                {it.price}C
              </button>
            </div>
          );
        })}
      </div>

      <h3 className="text-xs font-kan text-sky-300/80 tracking-[0.2em] pt-1">⟢ 所持アイテム</h3>
      {entries.length === 0 && <div className="text-xs text-slate-500 font-kan">まだ何も持ってねえ。</div>}
      <div className="grid gap-2">
        {entries.map(([id, n]) => {
          const it = ITEMS[id];
          if (!it) return null;
          const canUseWorld = it.kind === "world-heal" && state.worldHp < (state.worldHpMax ?? 5);
          return (
            <div key={id} className="panel-washi rounded-lg p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded border border-sky-700/50 bg-sky-950/30 grid place-items-center font-brush text-sky-200">
                  {it.icon}
                </div>
                <div className="min-w-0">
                  <div className="font-kan text-sm text-slate-100">{it.name} <span className="text-xs text-slate-500">×{n}</span></div>
                  <div className="text-[10px] text-slate-400 font-kan truncate">{it.desc}</div>
                </div>
              </div>
              {it.kind === "world-heal" && (
                <button
                  onClick={() => onUseWorldItem(id)}
                  disabled={!canUseWorld}
                  className={`shrink-0 font-kan text-xs rounded px-3 py-1.5 border ${
                    canUseWorld ? "border-emerald-600 text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/40" : "border-slate-800 text-slate-600 bg-black/30"
                  }`}
                >
                  使う
                </button>
              )}
              {it.kind === "battle-heal" && (
                <span className="text-[10px] text-slate-500 font-kan">バトル中に使用</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
