import { TurnLog } from "@/lib/game/battle";

export function BattleLog({ turns }: { turns: TurnLog[] }) {
  return (
    <div className="panel-washi rounded-xl p-3 max-h-80 overflow-auto text-xs font-kan space-y-1.5">
      {turns.map((t, i) => (
        <div key={i} className="border-b border-slate-800/60 pb-1.5 last:border-0">
          <div className="flex justify-between text-slate-400">
            <span>第 {t.turn} 手</span>
            <span className="font-mono text-slate-500">自{t.hpLeft.player} / 敵{t.hpLeft.enemy}</span>
          </div>
          <div className="flex gap-2 text-slate-200">
            <span className="text-emerald-300">自:{act(t.playerAction, t.playerTechName)}</span>
            <span className="text-slate-600">×</span>
            <span className="text-rose-300">敵:{act(t.enemyAction, t.enemyTechName)}</span>
            <span className="ml-auto font-mono text-slate-400">{t.playerDamage}↔{t.enemyDamage}</span>
          </div>
          {t.notes.length > 0 && (
            <div className="text-[10px] text-rose-300/70">{t.notes.join(" / ")}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function act(a: string, tn?: string) {
  if (a === "punch") return "拳";
  if (a === "kick") return "蹴";
  if (a === "guard") return "守";
  return `技《${tn ?? "—"}》`;
}
