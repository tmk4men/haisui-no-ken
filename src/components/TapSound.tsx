"use client";

import { useEffect } from "react";
import { playTap } from "@/lib/audio/sfx";

export function TapSound() {
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const el = target.closest(
        'button, a, [role="button"], [role="link"], input[type="button"], input[type="submit"], label[for]'
      ) as HTMLElement | null;
      if (!el) return;
      if (el.closest("[data-no-tap]")) return;
      if ((el as HTMLButtonElement).disabled) return;
      playTap();
    };
    window.addEventListener("pointerdown", handler, { passive: true });
    return () => window.removeEventListener("pointerdown", handler);
  }, []);
  return null;
}
