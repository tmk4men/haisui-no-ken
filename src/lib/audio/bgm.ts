"use client";

const BGM_VOLUME_KEY = "kandou:bgmVolume";
const BGM_MUTE_KEY = "kandou:bgmMute";

export function getBgmVolume(): number {
  if (typeof window === "undefined") return 0.4;
  if (localStorage.getItem(BGM_MUTE_KEY) === "1") return 0;
  const v = localStorage.getItem(BGM_VOLUME_KEY);
  return v === null ? 0.35 : Math.max(0, Math.min(1, Number(v)));
}
export function setBgmVolume(v: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BGM_VOLUME_KEY, String(Math.max(0, Math.min(1, v))));
  window.dispatchEvent(new Event("bgm-volume-changed"));
}
export function isBgmMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(BGM_MUTE_KEY) === "1";
}
export function setBgmMuted(m: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BGM_MUTE_KEY, m ? "1" : "0");
  window.dispatchEvent(new Event("bgm-volume-changed"));
}
