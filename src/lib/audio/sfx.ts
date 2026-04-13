"use client";

/*
  音声素材クレジット：効果音 OtoLogic (CC BY 4.0)  https://otologic.jp
  ファイルは public/sfx/*.mp3 として配置。未配置ならシンセ音にフォールバック。
*/

const SFX_VOLUME_KEY = "kandou:sfxVolume";
const SFX_MUTE_KEY = "kandou:sfxMute";

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
  g.gain.value = gain * getVolume();
  osc.connect(g).connect(a.destination);
  osc.start();
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + durMs / 1000);
  osc.stop(a.currentTime + durMs / 1000);
}

export function getVolume(): number {
  if (typeof window === "undefined") return 1;
  if (localStorage.getItem(SFX_MUTE_KEY) === "1") return 0;
  const v = localStorage.getItem(SFX_VOLUME_KEY);
  return v === null ? 0.7 : Math.max(0, Math.min(1, Number(v)));
}
export function setVolume(v: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SFX_VOLUME_KEY, String(Math.max(0, Math.min(1, v))));
}
export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SFX_MUTE_KEY) === "1";
}
export function setMuted(m: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SFX_MUTE_KEY, m ? "1" : "0");
}

const cache = new Map<string, HTMLAudioElement>();
const failed = new Set<string>();

function play(file: string, fallback: () => void, gain = 1) {
  if (typeof window === "undefined") return;
  const vol = getVolume();
  if (vol <= 0) return;
  if (failed.has(file)) { fallback(); return; }
  let a = cache.get(file);
  if (!a) {
    a = new Audio(file);
    a.preload = "auto";
    a.addEventListener("error", () => { failed.add(file); }, { once: true });
    cache.set(file, a);
  }
  try {
    const clone = a.cloneNode(true) as HTMLAudioElement;
    clone.volume = Math.max(0, Math.min(1, vol * gain));
    const p = clone.play();
    if (p && typeof p.catch === "function") p.catch(() => fallback());
  } catch {
    fallback();
  }
}

// --- 単車ローダー用：最初の4秒だけ再生してフェードアウト ---
export function playBikeLoader(opts: { durationMs?: number; fadeMs?: number } = {}) {
  if (typeof window === "undefined") return;
  const vol = getVolume();
  if (vol <= 0) return;
  const duration = opts.durationMs ?? 4000;
  const fade = opts.fadeMs ?? 1200;

  const runFade = (audio: HTMLAudioElement) => {
    const start = duration - fade;
    const startVol = audio.volume;
    setTimeout(() => {
      const steps = 20; let i = 0;
      const iv = setInterval(() => {
        i++;
        audio.volume = Math.max(0, startVol * (1 - i / steps));
        if (i >= steps) clearInterval(iv);
      }, fade / 20);
    }, start);
    setTimeout(() => { try { audio.pause(); audio.src = ""; } catch {} }, duration);
  };

  const start = (byGesture = false) => {
    const audio = new Audio("/sfx/bike.mp3");
    audio.preload = "auto";
    audio.volume = Math.max(0, Math.min(1, vol * 0.8));
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.then(() => runFade(audio)).catch(() => {
        if (byGesture) return; // 既にジェスチャで再試行してもダメ→諦め
        // 初回ブロック時：最初のユーザー操作で再生
        const handler = () => {
          off();
          start(true);
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
      runFade(audio);
    }
  };
  start();
}

export const SFX = {
  rep:    () => play("/sfx/punch.mp3",   () => beep(880, 80, "sine", 0.05), 0.8),
  deep:   () => play("/sfx/kick.mp3",    () => beep(1200, 150, "triangle", 0.06), 0.9),
  guard:  () => play("/sfx/guard.mp3",   () => beep(400, 120, "square", 0.06), 0.7),
  hit:    () => play("/sfx/hit.mp3",     () => beep(200, 120, "sawtooth", 0.07), 0.9),
  special:() => play("/sfx/tech.mp3",    () => { beep(180, 120, "sawtooth", 0.1); setTimeout(() => beep(520, 240, "square", 0.08), 120); }, 1),
  victory:() => play("/sfx/victory.mp3", () => { beep(523, 120, "square", 0.08); setTimeout(() => beep(659, 120, "square", 0.08), 140); setTimeout(() => beep(784, 260, "square", 0.08), 280); }, 1),
  defeat: () => play("/sfx/defeat.mp3",  () => beep(120, 500, "sawtooth", 0.07), 0.9),
  bike:   () => playBikeLoader(),
};
