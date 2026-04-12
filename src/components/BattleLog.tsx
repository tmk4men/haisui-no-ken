import { TurnEvent } from "@/lib/game/battle";

export function BattleLog({ turns }: { turns: TurnEvent[] }) {
  return (
    <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-3 max-h-80 overflow-auto text-sm font-mono space-y-1">
      {turns.map((t, i) => {
        const who = t.actor === "player" ? "▶ 自分" : "◀ 敵";
        const color = t.actor === "player" ? "text-emerald-300" : "text-rose-300";
        if (t.dodged) {
          return <div key={i} className={`${color} opacity-70`}>{who} の攻撃 → スカされた。</div>;
        }
        if (t.crit && t.techniqueName) {
          return (
            <div key={i} className={`${color} font-bold`}>
              {who} 《{t.techniqueName}》 — {t.damage} ダメージ! (自{t.hpLeft.player}/敵{t.hpLeft.enemy})
            </div>
          );
        }
        const el = t.element === "magic" ? "読み" : "拳";
        return (
          <div key={i} className={color}>
            {who} の{el}で殴る / {t.damage} (自{t.hpLeft.player}/敵{t.hpLeft.enemy})
          </div>
        );
      })}
    </div>
  );
}
