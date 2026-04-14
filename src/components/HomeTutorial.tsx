"use client";
import { useEffect, useState } from "react";

const KEY = "kandou:homeTutorialSeenV1";

export function HomeTutorial() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // オープニングの後に表示するため、少し遅延
    const t = setTimeout(() => {
      if (!localStorage.getItem(KEY) && !localStorage.getItem("opening-seen-v1")) {
        // オープニング未視聴＝初回起動 → 開始タップ後に出るべき
        // オープニングが消えた後に再チェックする
        return;
      }
      if (!localStorage.getItem(KEY)) setOpen(true);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  const close = () => { try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } setOpen(false); };

  const STEPS = [
    {
      title: "体力と喧嘩",
      body: (
        <>
          <p>喧嘩に<b className="text-rose-300">負けると体力が1減る</b>（最大5）。0になると喧嘩不可。</p>
          <p>時間経過（<b>約2時間で1回復</b>）か、<b className="text-emerald-300">お守り/湯呑み</b>で即回復できる。</p>
        </>
      ),
    },
    {
      title: "コインと売店",
      body: (
        <>
          <p>敵を倒すと<b className="text-amber-300">コイン</b>と時々<b className="text-amber-300">財布</b>が手に入る。</p>
          <p>財布は<b>ホームで「開ける」</b>とコインを獲得。高級ほど中身が厚い。</p>
          <p>コインは<b>売店（ホーム下部）</b>でアイテムや技習得に使える。</p>
        </>
      ),
    },
    {
      title: "握り飯と怒ゲージ",
      body: (
        <>
          <p><b className="text-amber-300">握り飯</b>を持ってると喧嘩中に食える（HP+15、1ターン消費）。</p>
          <p>被ダメで<b className="text-rose-300">怒ゲージ</b>が溜まり、満タンで次の攻撃が<b>+30%</b>。追い込まれた時の逆転札。</p>
        </>
      ),
    },
    {
      title: "鍛錬で強くなれ",
      body: (
        <>
          <p><b className="text-rose-300">シバキ上げ</b>（スクワ・腕立・プランク）と<b className="text-sky-300">勉学</b>（勉強）で成長する。</p>
          <p>毎日続ければ連続日数ボーナス。続けた分だけ、喧嘩で勝てるようになる。</p>
        </>
      ),
    },
  ];

  const isLast = step === STEPS.length - 1;
  const cur = STEPS[step];

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-4">
      <div className="panel-washi rounded-xl max-w-md w-full p-5 space-y-4 border border-rose-900/60">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="hanko">手引</span>
            <h3 className="font-brush text-2xl ink-title">{cur.title}</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{step + 1}/{STEPS.length}</span>
        </div>
        <div className="space-y-2 text-sm font-kan text-slate-200 tracking-wide leading-relaxed">
          {cur.body}
        </div>
        <div className="flex gap-2 pt-1">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 border border-slate-700 bg-black/40 hover:bg-slate-900 rounded-md py-2.5 font-kan tracking-widest text-slate-300">
              戻る
            </button>
          )}
          {!isLast ? (
            <button onClick={() => setStep(s => s + 1)}
              className="flex-1 slash-on-hover border border-rose-800/70 bg-rose-950/40 hover:bg-rose-900/40 rounded-md py-2.5 font-brush text-lg ink-title tracking-widest">
              次へ
            </button>
          ) : (
            <button onClick={close}
              className="flex-1 slash-on-hover border border-amber-700/70 bg-amber-950/40 hover:bg-amber-900/40 rounded-md py-2.5 font-brush text-lg tracking-widest text-amber-100">
              承知
            </button>
          )}
        </div>
        <button onClick={close} className="block mx-auto text-[10px] font-kan text-slate-500 underline tracking-widest">
          もう見ない
        </button>
      </div>
    </div>
  );
}
