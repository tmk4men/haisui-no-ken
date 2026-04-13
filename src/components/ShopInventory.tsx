"use client";
import { useState } from "react";
import { ITEMS, SHOP_ITEMS, WALLET_RARITY } from "@/lib/game/items";
import { GameState } from "@/types/game";

const RARITY_STYLE: Record<string, string> = {
  common: "border-slate-600 text-slate-200 bg-slate-900/60",
  rare: "border-sky-500 text-sky-100 bg-sky-950/40 shadow-[0_0_10px_rgba(56,189,248,0.35)]",
  legend: "border-amber-400 text-amber-100 bg-amber-950/40 shadow-[0_0_14px_rgba(251,191,36,0.55)]",
};

export function ShopInventory({
  state, onBuy, onUseWorldItem, onOpenWallet,
}: {
  state: GameState;
  onBuy: (id: string) => boolean;
  onUseWorldItem: (id: string) => boolean;
  onOpenWallet: (id: string) => number | null;
}) {
  const [popup, setPopup] = useState<{ name: string; coins: number; rarity: string; key: number } | null>(null);
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
              {it.kind === "wallet" && (
                <button
                  onClick={() => {
                    const gained = onOpenWallet(id);
                    if (gained != null) {
                      setPopup({ name: it.name, coins: gained, rarity: WALLET_RARITY[id] ?? "common", key: Date.now() });
                    }
                  }}
                  className={`shrink-0 font-kan text-xs rounded px-3 py-1.5 border ${RARITY_STYLE[WALLET_RARITY[id] ?? "common"]}`}
                >
                  開ける
                </button>
              )}
            </div>
          );
        })}
      </div>

      {popup && (
        <div
          key={popup.key}
          onAnimationEnd={() => setPopup(null)}
          className={`fixed inset-0 z-50 grid place-items-center pointer-events-none`}
          style={{ animation: "walletPop 1400ms ease-out forwards" }}
        >
          <div className={`rounded-xl border-2 px-6 py-4 text-center backdrop-blur ${RARITY_STYLE[popup.rarity]}`}>
            <div className="font-brush text-2xl mb-1">《{popup.name}》を開けた</div>
            <div className="font-mono text-3xl font-black">+{popup.coins} コイン</div>
          </div>
          <style>{`@keyframes walletPop {
            0% { opacity: 0; transform: scale(0.85); }
            15% { opacity: 1; transform: scale(1.05); }
            25% { transform: scale(1); }
            80% { opacity: 1; }
            100% { opacity: 0; transform: scale(1); }
          }`}</style>
        </div>
      )}
    </div>
  );
}
