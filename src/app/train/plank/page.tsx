"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { useGameState } from "@/hooks/useGameState";
import { PlankDetector } from "@/lib/pose/plankDetector";
import { TrainBanner } from "@/components/TrainBanner";

export default function PlankPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef(new PlankDetector());
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [holding, setHolding] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const { addPlank } = useGameState();
  const router = useRouter();

  const { ready, error, start, stop } = usePoseDetection(videoRef, (f) => {
    const r = detectorRef.current.update(f.landmarks, f.timestamp);
    setHolding(r.holding);
    setDurationSec(r.durationSec);
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
    const s = Math.round(detectorRef.current.getDurationSec());
    if (s > 0) addPlank(s);
    router.push("/");
  };

  return (
    <div className="space-y-4">
      <TrainBanner src="/bg/plank.webp" title="我慢・プランク" desc="耐えろ、退くな" />
      <p className="text-xs text-slate-400 font-kan">肩→腰→足首が一直線なら保持中としてカウント。</p>

      <div className="relative rounded-xl overflow-hidden bg-black aspect-video ring-1 ring-slate-800">
        <video ref={videoRef} className="w-full h-full object-contain scale-x-[-1]" playsInline muted />
        {!cameraOn && (
          <button onClick={enableCamera} disabled={!ready}
            className="absolute inset-0 grid place-items-center bg-black/60 text-lg font-semibold disabled:opacity-50">
            {ready ? "カメラを開始" : "モデル読込中…"}
          </button>
        )}
        <div className={`absolute top-2 left-2 rounded px-2 py-1 text-xs font-mono ${holding ? "bg-emerald-600/80" : "bg-slate-700/80"}`}>
          {holding ? "HOLDING" : "—"}
        </div>
        <div className="absolute top-2 right-2 bg-black/70 rounded px-3 py-1 text-lg font-bold font-mono">
          {Math.floor(durationSec)}s
        </div>
      </div>

      {(error || cameraError) && <div className="text-rose-400 text-sm">エラー: {error ?? cameraError}</div>}

      <button onClick={finish} className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 font-semibold">
        終了して記録 ({Math.floor(durationSec)}秒)
      </button>
    </div>
  );
}
