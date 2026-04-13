"use client";
import { useGameState } from "@/hooks/useGameState";

export default function SettingsPage() {
  const { state, updateSettings } = useGameState();
  if (!state) return <div className="text-slate-400 font-kan">読み込み中…</div>;
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
    <div className="space-y-5">
      <h2 className="font-brush text-2xl ink-title blood-stroke">設定</h2>

      <div className="panel-washi rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center gap-3">
          <div className="min-w-0">
            <div className="font-brush text-lg text-slate-100">毎日のリマインド</div>
            <div className="text-[10px] text-slate-400 font-kan mt-0.5 tracking-wide">
              指定時刻に通知（ブラウザを開いている間のみ）
            </div>
          </div>
          <button onClick={togglePermission}
            className={`rounded-sm px-4 py-1.5 text-xs font-kan tracking-[0.3em] border transition shrink-0 ${
              s.reminderEnabled
                ? "bg-emerald-900/40 border-emerald-600/70 text-emerald-200"
                : "bg-black/40 border-slate-700 text-slate-400"
            }`}>
            {s.reminderEnabled ? "ON" : "OFF"}
          </button>
        </div>
        <div>
          <label className="block text-[11px] font-kan tracking-widest text-rose-300/70 mb-1.5">時刻</label>
          <input type="time" value={s.reminderTime}
            onChange={e => updateSettings({ reminderTime: e.target.value })}
            className="w-full bg-black/40 border border-slate-800 rounded-md p-2.5 font-mono" />
        </div>
      </div>

      <div className="text-[10px] text-slate-500 font-kan leading-relaxed border-t border-slate-800/80 pt-3">
        ホーム画面に追加するとアプリ風に使えます（PWA対応）。
      </div>
    </div>
  );
}
