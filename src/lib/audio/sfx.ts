"use client";

let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return ctx;
}

function beep(freq: number, durMs: number, type: OscillatorType = "square", gain = 0.08) {
  const a = ac(); if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g).connect(a.destination);
  osc.start();
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + durMs / 1000);
  osc.stop(a.currentTime + durMs / 1000);
}

export const SFX = {
  rep: () => beep(880, 80, "sine", 0.05),
  deep: () => beep(1200, 150, "triangle", 0.06),
  special: () => {
    beep(180, 120, "sawtooth", 0.1);
    setTimeout(() => beep(520, 240, "square", 0.08), 120);
  },
  victory: () => {
    beep(523, 120, "square", 0.08);
    setTimeout(() => beep(659, 120, "square", 0.08), 140);
    setTimeout(() => beep(784, 260, "square", 0.08), 280);
  },
  defeat: () => beep(120, 500, "sawtooth", 0.07),
};
