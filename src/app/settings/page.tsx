"use client";
import { useGameState } from "@/hooks/useGameState";

export default function SettingsPage() {
  const { state, updateSettings } = useGameState();
  if (!state) return <div className="text-slate-400">読み込み中…</div>;
  const s = state.settings;

  const togglePermission = async () => {
    if (typeof Notification === "undefined") { alert("この環境は通知未対応"); return; }
    if (Notification.permission === "granted") {
      updateSettings({ reminderEnabled: !s.reminderEnabled });
    } else {
      const p = await Notification.requestPermission();
      if (p === "granted") updateSettings({ reminderEnabled: true });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">設定</h2>
      <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold">毎日のリマインド</div>
            <div className="text-xs text-slate-400">指定時刻に通知（ブラウザを開いている間のみ）</div>
          </div>
          <button onClick={togglePermission} className={`rounded-lg px-3 py-1.5 text-sm ${s.reminderEnabled ? "bg-emerald-600" : "bg-slate-700"}`}>
            {s.reminderEnabled ? "ON" : "OFF"}
          </button>
        </div>
        <div>
          <label className="text-xs text-slate-400">時刻</label>
          <input type="time" value={s.reminderTime} onChange={e => updateSettings({ reminderTime: e.target.value })}
            className="w-full bg-slate-950 rounded-lg p-2 ring-1 ring-slate-800" />
        </div>
      </div>
      <div className="text-xs text-slate-500">
        ホーム画面に追加するとアプリ風に使えます（PWA対応）。
      </div>
    </div>
  );
}
