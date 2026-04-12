"use client";
import { useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import { todayKey } from "@/lib/game/date";

// ページが開かれている間、設定された時刻に Notification を1日1回発火
export function ReminderScheduler() {
  const { state } = useGameState();
  useEffect(() => {
    if (!state?.settings.reminderEnabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const KEY = "haisui:lastReminder";
    const [hh, mm] = state.settings.reminderTime.split(":").map(Number);
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getHours() !== hh || now.getMinutes() !== mm) return;
      const last = localStorage.getItem(KEY);
      if (last === todayKey()) return;
      if (Notification.permission === "granted") {
        new Notification("背水ノ拳", { body: "今日も、刻め。" });
      }
      localStorage.setItem(KEY, todayKey());
    }, 30000);
    return () => clearInterval(timer);
  }, [state?.settings.reminderEnabled, state?.settings.reminderTime]);
  return null;
}
