"use client";
import { useEffect, useState } from "react";

const KEY = "kandou:battleTutorialSeenV2";

export function BattleTutorial() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);
  if (!open) return null;
  const close = () => { localStorage.setItem(KEY, "1"); setOpen(false); };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
      <div className="panel-washi rounded-xl max-w-md w-full p-5 space-y-4 border border-rose-900/60">
        <div className="flex items-baseline gap-2">
          <span className="hanko">心得</span>
          <h3 className="font-brush text-2xl ink-title">出入りの流れ</h3>
        </div>
        <ul className="space-y-2 text-sm font-kan text-slate-200 tracking-wide">
          <li><b className="text-rose-300">拳</b>：速い基本攻撃。</li>
          <li><b className="text-rose-300">蹴り</b>：重い。相手の<b>技の出鼻</b>を潰せる。</li>
          <li><b className="text-rose-300">ガード</b>：被ダメ大幅減＋気力＋1。技には貫かれやすい。</li>
          <li><b className="text-rose-300">技</b>：<b className="text-amber-300">気力</b>を消費。技の覚書で習得。</li>
        </ul>
        <div className="text-[11px] text-slate-400 font-kan border-t border-slate-800/70 pt-3 leading-relaxed space-y-1">
          <div>先手後手は<b className="text-rose-300">眼力(知力)</b>で決まる。先手で沈めれば反撃なし。</div>
          <div>相性：蹴り&gt;技&gt;ガード&gt;拳・蹴り。気力は毎ターン＋1、ガードで＋2。</div>
        </div>
        <button onClick={close}
          className="slash-on-hover w-full border border-rose-800/70 bg-rose-950/40 hover:bg-rose-900/40 rounded-md py-3 font-brush text-xl ink-title tracking-widest">
          得心
        </button>
      </div>
    </div>
  );
}
