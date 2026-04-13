"use client";
import { useGameState } from "@/hooks/useGameState";
import { SKILLS, Skill } from "@/lib/game/skills";
import { TECHNIQUES, findTech } from "@/lib/game/techniques";

const SECTIONS: { kind: Skill["kind"]; title: string; sub: string }[] = [
  { kind: "technique", title: "◆ 戦闘技", sub: "喧嘩で使える必殺" },
  { kind: "derived", title: "◆ 実力強化", sub: "体力・剛撃・機敏等を底上げ" },
  { kind: "growth", title: "◆ 成長補正", sub: "日々の鍛錬効率UP" },
  { kind: "battle", title: "◆ 戦闘補助", sub: "クリ率等の戦闘バフ" },
];

export default function SkillsPage() {
  const { state, learnSkill } = useGameState();
  if (!state) return <div className="text-slate-400 font-kan">読み込み中…</div>;
  const c = state.character;
  const grouped = SECTIONS.map(sec => ({ ...sec, items: SKILLS.filter(s => s.kind === sec.kind) }));

  return (
    <div className="space-y-5">
      <h2 className="font-brush text-2xl ink-title blood-stroke">技の覚書</h2>
      <div className="panel-washi rounded-lg p-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-400 font-kan tracking-widest">技ポイント / コイン</div>
          <div className="flex items-baseline gap-3">
            <span className="font-brush text-3xl text-amber-300">{c.skillPoints}</span>
            <span className="text-slate-600">/</span>
            <span className="font-brush text-2xl text-amber-200">◎ {state.coins ?? 0}</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-kan leading-relaxed text-right">
          5レベル毎に1SP<br />Lv {c.level} → 次 {5 - (c.level % 5)}
        </div>
      </div>

      {grouped.map(sec => sec.items.length > 0 && (
        <section key={sec.kind} className="space-y-2">
          <div>
            <h3 className="font-kan tracking-[0.2em] text-rose-300/80 text-sm">{sec.title}</h3>
            <div className="text-[10px] text-slate-500 font-kan">{sec.sub}</div>
          </div>
          <div className="grid gap-2">
            {sec.items.map(s => {
              const learned = c.skills.includes(s.id);
              const hasSp = c.skillPoints > 0;
              const hasCoin = (state.coins ?? 0) >= s.coinPrice;
              const canLearn = !learned && hasSp && hasCoin;
              const tech = s.kind === "technique" ? findTech(s.id) : undefined;
              return (
                <div key={s.id}
                  className={`panel-washi rounded-lg p-3 border ${
                    learned ? "border-emerald-700/60 bg-emerald-950/15" : "border-slate-800"
                  }`}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-brush text-xl text-slate-100">{s.name}</span>
                        {tech && <span className="text-[10px] font-kan text-amber-300">気力{tech.cost}</span>}
                        {tech?.pierceGuard && <span className="text-[9px] font-kan text-rose-300">ガード貫通</span>}
                        {tech?.absorbAndReflect && <span className="text-[9px] font-kan text-amber-300">吸収＋反射</span>}
                        {tech?.sureHit && <span className="text-[9px] font-kan text-fuchsia-300">絶対命中</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-kan tracking-wide">{s.desc}</div>
                    </div>
                    {learned
                      ? <span className="text-[10px] text-emerald-300 font-kan tracking-widest shrink-0">習得済</span>
                      : (
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <button onClick={() => learnSkill(s.id)} disabled={!canLearn}
                            className="text-xs font-kan bg-amber-700 hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed rounded px-3 py-1.5 tracking-widest transition">
                            習得
                          </button>
                          <div className="text-[10px] font-kan">
                            <span className={hasSp ? "text-amber-300" : "text-slate-600"}>SP1</span>
                            <span className="text-slate-600 mx-1">+</span>
                            <span className={hasCoin ? "text-amber-200" : "text-rose-400"}>◎{s.coinPrice}</span>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="text-[10px] text-slate-500 font-kan leading-relaxed border-t border-slate-800 pt-3">
        戦闘技は喧嘩画面で使用可。気力は毎ターン+1回復、ガード時は追加+1。
      </div>
    </div>
  );
}
