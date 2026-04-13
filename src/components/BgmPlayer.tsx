"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getBgmVolume } from "@/lib/audio/bgm";

const BGM_SRC = "/bgm/minagiru.mp3";

export function BgmPlayer() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  // バトル画面ではBGM停止
  const shouldPlay = !pathname?.startsWith("/battle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const a = new Audio(BGM_SRC);
    a.loop = true;
    a.preload = "auto";
    a.volume = getBgmVolume();
    audioRef.current = a;

    const tryStart = () => {
      if (!audioRef.current) return;
      audioRef.current.volume = getBgmVolume();
      const p = audioRef.current.play();
      if (p && typeof p.catch === "function") {
        p.then(() => { startedRef.current = true; }).catch(() => {
          // autoplay blocked → wait for gesture
          const handler = () => {
            off();
            tryStart();
          };
          const off = () => {
            window.removeEventListener("pointerdown", handler);
            window.removeEventListener("keydown", handler);
            window.removeEventListener("touchstart", handler);
          };
          window.addEventListener("pointerdown", handler, { once: true });
          window.addEventListener("keydown", handler, { once: true });
          window.addEventListener("touchstart", handler, { once: true });
        });
      } else {
        startedRef.current = true;
      }
    };
    tryStart();

    const onVol = () => {
      if (audioRef.current) audioRef.current.volume = getBgmVolume();
    };
    window.addEventListener("bgm-volume-changed", onVol);

    return () => {
      window.removeEventListener("bgm-volume-changed", onVol);
      try { a.pause(); a.src = ""; } catch { /* ignore */ }
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (shouldPlay) {
      // バトルから戻ったとき再開
      a.volume = getBgmVolume();
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => { /* ignore */ });
    } else {
      try { a.pause(); } catch { /* ignore */ }
    }
  }, [shouldPlay]);

  return null;
}
