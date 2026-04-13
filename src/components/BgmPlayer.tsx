"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getBgmVolume } from "@/lib/audio/bgm";

const FIELD_SRC = "/bgm/minagiru.mp3";
const BATTLE_SRC = "/bgm/battle.mp3";

export function BgmPlayer() {
  const pathname = usePathname();
  const fieldRef = useRef<HTMLAudioElement | null>(null);
  const battleRef = useRef<HTMLAudioElement | null>(null);
  const currentRef = useRef<HTMLAudioElement | null>(null);

  const isBattle = !!pathname?.startsWith("/battle");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const field = new Audio(FIELD_SRC);
    field.loop = true; field.preload = "auto";
    const battle = new Audio(BATTLE_SRC);
    battle.loop = true; battle.preload = "auto";
    fieldRef.current = field;
    battleRef.current = battle;

    const pickInitial = () => (window.location.pathname.startsWith("/battle") ? battle : field);
    currentRef.current = pickInitial();
    currentRef.current.volume = getBgmVolume();

    const tryStart = (target: HTMLAudioElement) => {
      target.volume = getBgmVolume();
      const p = target.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          const handler = () => {
            off();
            const cur = currentRef.current;
            if (cur) tryStart(cur);
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
      }
    };
    tryStart(currentRef.current);

    const onVol = () => {
      if (currentRef.current) currentRef.current.volume = getBgmVolume();
    };
    const onVisibility = () => {
      const cur = currentRef.current;
      if (!cur) return;
      if (document.visibilityState === "hidden") {
        try { cur.pause(); } catch { /* ignore */ }
      } else {
        cur.volume = getBgmVolume();
        const p = cur.play();
        if (p && typeof p.catch === "function") p.catch(() => { /* ignore */ });
      }
    };
    const onPageHide = () => {
      try { fieldRef.current?.pause(); battleRef.current?.pause(); } catch { /* ignore */ }
    };
    window.addEventListener("bgm-volume-changed", onVol);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("blur", onPageHide);

    return () => {
      window.removeEventListener("bgm-volume-changed", onVol);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("blur", onPageHide);
      try { field.pause(); field.src = ""; battle.pause(); battle.src = ""; } catch { /* ignore */ }
      fieldRef.current = null; battleRef.current = null; currentRef.current = null;
    };
  }, []);

  // ルート変化でクロスフェード
  useEffect(() => {
    const field = fieldRef.current;
    const battle = battleRef.current;
    if (!field || !battle) return;
    const next = isBattle ? battle : field;
    const prev = isBattle ? field : battle;
    if (currentRef.current === next) return;

    currentRef.current = next;
    const targetVol = getBgmVolume();
    // 簡易クロスフェード
    const steps = 8;
    const ms = 240;
    const startPrevVol = prev.volume;
    next.volume = 0;
    const p = next.play();
    if (p && typeof p.catch === "function") p.catch(() => { /* ignore */ });
    let i = 0;
    const iv = setInterval(() => {
      i++;
      const t = i / steps;
      prev.volume = Math.max(0, startPrevVol * (1 - t));
      next.volume = Math.min(1, targetVol * t);
      if (i >= steps) {
        clearInterval(iv);
        try { prev.pause(); prev.currentTime = 0; } catch { /* ignore */ }
        next.volume = targetVol;
      }
    }, ms / steps);
    return () => clearInterval(iv);
  }, [isBattle]);

  return null;
}
