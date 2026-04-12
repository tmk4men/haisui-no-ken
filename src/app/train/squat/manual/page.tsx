"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";

export default function ManualSquatPage() {
  const [reps, setReps] = useState(20);
  const { addSquats } = useGameState();
  const router = useRouter();
  const submit = () => {
    // カメラ不使用のペナルティ：全回を shallow 相当として扱い Body 上昇を大きく抑制
    if (reps > 0) addSquats({ good: 0, deep: 0, fast: 0, shallow: reps });
    router.push("/");
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">スクワット（手入力）</h2>
      <p className="text-sm text-slate-400">カメラが使えない環境向け。ズル防止のため Body 上昇はカメラ判定の 30% に抑えられます。</p>
      <input type="number" min={1} value={reps} onChange={e => setReps(Number(e.target.value))}
        className="w-full bg-slate-950 rounded-lg p-3 ring-1 ring-slate-800" />
      <button onClick={submit} className="w-full bg-slate-700 hover:bg-slate-600 rounded-xl py-3 font-semibold">
        記録する（Body +{(reps * 0.1 * 0.3).toFixed(2)}）
      </button>
    </div>
  );
}
