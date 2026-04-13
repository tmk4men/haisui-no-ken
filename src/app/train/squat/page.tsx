"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { useGameState } from "@/hooks/useGameState";
import { SquatDetector, SQUAT_FORM_MSG, SquatFormIssue } from "@/lib/pose/squatDetector";
import { SquatQuality } from "@/types/game";
import { SFX } from "@/lib/audio/sfx";
import { TrainBanner } from "@/components/TrainBanner";

const QUALITY_LABEL: Record<SquatQuality, string> = { good: "Good", deep: "Deep!", fast: "Fast", shallow: "Shallow" };
const QUALITY_COLOR: Record<SquatQuality, string> = { good: "text-emerald-300", deep: "text-amber-300", fast: "text-sky-300", shallow: "text-slate-500" };

export default function SquatPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef(new SquatDetector());
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<SquatQuality, number>>({ good: 0, deep: 0, fast: 0, shallow: 0 });
  const [display, setDisplay] = useState({ angle: 180, phase: "standing", lastQuality: null as SquatQuality | null });
  const [flash, setFlash] = useState(0);
  const [issues, setIssues] = useState<SquatFormIssue[]>([]);
  const { addSquats } = useGameState();
  const router = useRouter();

  const total = useMemo(() => counts.good + counts.deep + counts.fast + counts.shallow, [counts]);

  const { ready, error, start, stop } = usePoseDetection(videoRef, (f) => {
    const res = detectorRef.current.update(f.landmarks, f.timestamp);
    if (res.rep) {
      const q = res.rep.quality;
      setCounts(c => ({ ...c, [q]: c[q] + 1 }));
      setDisplay(d => ({ ...d, lastQuality: q }));
      setFlash(Date.now());
      setIssues(detectorRef.current.lastIssues);
      SFX.click();
      if (q === "deep") setTimeout(() => SFX.click(), 90);
    }
    setDisplay(d => ({ ...d, angle: res.displayMetric, phase: res.phase }));
  });

  useEffect(() => () => {
    stop();
    const s = videoRef.current?.srcObject as MediaStream | null;
    s?.getTracks().forEach(t => t.stop());
  }, [stop]);

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false });
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraOn(true); start();
    } catch (e) { setCameraError((e as Error).message); }
  };

  const finish = () => {
    stop();
    if (total > 0) addSquats(counts);
    router.push("/");
  };

  return (
    <div className="space-y-4">
      <TrainBanner src="/bg/squat.webp" title="シバキ上げ・スクワット" desc="深く沈め、脚に刻め" />
      <div className="flex justify-end">
        <Link href="/train/squat/manual" className="text-xs text-slate-400 underline">カメラなしモード</Link>
      </div>
      <p className="text-xs text-slate-400 font-kan">90°以下=有効、75°以下=Deep(+50%)、速すぎ=Fast(-40%)、浅い=Shallow(-70%)</p>

      <div className="relative rounded-xl overflow-hidden bg-black aspect-video ring-1 ring-slate-800">
        <video ref={videoRef} className="w-full h-full object-contain scale-x-[-1]" playsInline muted />
        {!cameraOn && (
          <button onClick={enableCamera} disabled={!ready}
            className="absolute inset-0 grid place-items-center bg-black/60 text-lg font-semibold disabled:opacity-50">
            {ready ? "カメラを開始" : "モデル読込中…"}
          </button>
        )}
        <div className="absolute top-2 left-2 bg-black/60 rounded px-2 py-1 text-xs font-mono">{display.phase} / {display.angle.toFixed(0)}°</div>
        <div className="absolute top-2 right-2 bg-emerald-600/80 rounded px-3 py-1 text-lg font-bold">{total} 回</div>
        {display.lastQuality && (
          <div key={flash} className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-3xl font-black ${QUALITY_COLOR[display.lastQuality]} animate-pulse`}>
            {QUALITY_LABEL[display.lastQuality]}
          </div>
        )}
      </div>

      {issues.length > 0 && (
        <div className="rounded-lg bg-amber-900/30 ring-1 ring-amber-700/50 p-3 text-xs text-amber-200 space-y-1">
          {issues.map(i => <div key={i}>⚠ {SQUAT_FORM_MSG[i]}</div>)}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        {(["deep", "good", "fast", "shallow"] as SquatQuality[]).map(q => (
          <div key={q} className="rounded-lg bg-slate-900 ring-1 ring-slate-800 py-2">
            <div className={`text-xs ${QUALITY_COLOR[q]}`}>{QUALITY_LABEL[q]}</div>
            <div className="font-mono text-lg">{counts[q]}</div>
          </div>
        ))}
      </div>

      {(error || cameraError) && <div className="text-rose-400 text-sm">エラー: {error ?? cameraError}</div>}

      <button onClick={finish} className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 font-semibold">
        終了して記録 ({total} 回)
      </button>
    </div>
  );
}
