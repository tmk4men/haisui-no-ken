"use client";
import { useState } from "react";

export function CharaPortrait({ src = "/chara/main.png", className = "" }: { src?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-950 ring-1 ring-slate-800 ${className}`}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center text-slate-600 text-xs">
          <div className="text-center">
            <div className="text-5xl mb-2">🥷</div>
            <div>立ち絵は後日差し替え</div>
            <div className="opacity-60">public/chara/main.png</div>
          </div>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="主人公" className="w-full h-full object-cover" onError={() => setFailed(true)} />
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />
    </div>
  );
}
