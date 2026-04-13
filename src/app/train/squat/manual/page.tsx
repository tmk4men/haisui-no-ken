"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";

export default function ManualSquatPage() {
  const [reps, setReps] = useState(20);
  const { addSquats } = useGameState();
  const router = useRouter();
  const submit = () => {
    if (reps > 0) addSquats({ good: 0, deep: 0, fast: 0, shallow: reps });
    router.push("/");
  };
  return (
    <div className="space-y-5">
      <h2 className="font-brush text-2xl ink-title blood-stroke">スクワット（手入力）</h2>
      <p className="text-[11px] text-slate-400 font-kan tracking-widest leading-relaxed">
        カメラが使えない環境向け。ズル防止のため、拳の上昇はカメラ判定の 30% に抑えられる。
      </p>

      <div className="panel-washi rounded-xl p-4 space-y-3">
        <label className="block text-[11px] font-kan tracking-widest text-rose-300/70">回数</label>
        <input type="number" min={1} value={reps}
          onChange={e => setReps(Number(e.target.value))}
          className="w-full bg-black/40 border border-slate-800 rounded-md p-3 font-mono text-lg" />
        <button onClick={submit}
          className="slash-on-hover w-full border border-rose-800/60 bg-rose-950/30 hover:bg-rose-900/40 rounded-md py-3 font-kan tracking-[0.3em] text-rose-100">
          刻む（拳 +{(reps * 0.1 * 0.3).toFixed(2)}）
        </button>
      </div>
    </div>
  );
}
