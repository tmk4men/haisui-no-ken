"use client";
import { useEffect, useState } from "react";

export function SpecialMoveFlash({ techName, trigger }: { techName: string | null; trigger: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!techName) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 900);
    return () => clearTimeout(t);
  }, [trigger, techName]);
  if (!show || !techName) return null;
  return (
    <div className="fixed inset-0 z-50 pointer-events-none grid place-items-center bg-black/60 animate-[pulse_0.9s_ease-out]">
      <div className="text-5xl font-black text-amber-300 tracking-widest drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" style={{ fontFamily: "serif" }}>
        《{techName}》
      </div>
    </div>
  );
}
