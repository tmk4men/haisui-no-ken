"use client";
import { useEffect, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { getVolume, setVolume, isMuted, setMuted, SFX } from "@/lib/audio/sfx";
import { getBgmVolume, setBgmVolume, isBgmMuted, setBgmMuted } from "@/lib/audio/bgm";

export default function SettingsPage() {
  const { state, updateSettings } = useGameState();
  const [vol, setVol] = useState(0.7);
  const [mute, setMute] = useState(false);
  const [bgmVol, setBgmVol] = useState(0.35);
  const [bgmMute, setBgmMute] = useState(false);
  useEffect(() => {
    setVol(getVolume()); setMute(isMuted());
    setBgmVol(getBgmVolume()); setBgmMute(isBgmMuted());
  }, []);

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

  const changeVol = (v: number) => { setVol(v); setVolume(v); if (v > 0 && mute) { setMute(false); setMuted(false); } };
  const toggleMute = () => { const m = !mute; setMute(m); setMuted(m); };
  const testSfx = () => { SFX.rep(); };
  const changeBgmVol = (v: number) => { setBgmVol(v); setBgmVolume(v); if (v > 0 && bgmMute) { setBgmMute(false); setBgmMuted(false); } };
  const toggleBgmMute = () => { const m = !bgmMute; setBgmMute(m); setBgmMuted(m); };

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

      <div className="panel-washi rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center gap-3">
          <div>
            <div className="font-brush text-lg text-slate-100">効果音</div>
            <div className="text-[10px] text-slate-400 font-kan mt-0.5">戦闘・単車ロード時</div>
          </div>
          <button onClick={toggleMute}
            className={`rounded-sm px-4 py-1.5 text-xs font-kan tracking-[0.3em] border transition shrink-0 ${
              !mute
                ? "bg-emerald-900/40 border-emerald-600/70 text-emerald-200"
                : "bg-black/40 border-slate-700 text-slate-400"
            }`}>
            {mute ? "消音" : "ON"}
          </button>
        </div>
        <div>
          <div className="flex justify-between text-[11px] font-kan text-rose-300/70 tracking-widest mb-1.5">
            <span>音量</span>
            <span className="font-mono text-slate-300">{Math.round(vol * 100)}%</span>
          </div>
          <input type="range" min={0} max={1} step={0.05}
            value={vol} onChange={e => changeVol(Number(e.target.value))}
            className="w-full accent-rose-600" />
          <button onClick={testSfx}
            className="mt-2 text-[10px] font-kan text-slate-400 hover:text-rose-300 underline tracking-widest">
            鳴らして確認
          </button>
        </div>
      </div>

      <div className="panel-washi rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center gap-3">
          <div>
            <div className="font-brush text-lg text-slate-100">BGM</div>
            <div className="text-[10px] text-slate-400 font-kan mt-0.5">バトル中は自動停止</div>
          </div>
          <button onClick={toggleBgmMute}
            className={`rounded-sm px-4 py-1.5 text-xs font-kan tracking-[0.3em] border transition shrink-0 ${
              !bgmMute
                ? "bg-emerald-900/40 border-emerald-600/70 text-emerald-200"
                : "bg-black/40 border-slate-700 text-slate-400"
            }`}>
            {bgmMute ? "消音" : "ON"}
          </button>
        </div>
        <div>
          <div className="flex justify-between text-[11px] font-kan text-rose-300/70 tracking-widest mb-1.5">
            <span>音量</span>
            <span className="font-mono text-slate-300">{Math.round(bgmVol * 100)}%</span>
          </div>
          <input type="range" min={0} max={1} step={0.05}
            value={bgmVol} onChange={e => changeBgmVol(Number(e.target.value))}
            className="w-full accent-amber-500" />
        </div>
      </div>

      <div className="panel-washi rounded-xl p-4">
        <div className="font-brush text-lg text-slate-100 mb-2">素材クレジット</div>
        <ul className="text-[11px] text-slate-300 font-kan space-y-1 leading-relaxed">
          <li>効果音：<a href="https://otologic.jp" target="_blank" rel="noreferrer"
                    className="text-rose-300 underline hover:text-rose-200">OtoLogic</a>（CC BY 4.0）</li>
          <li>画像：各種 AI生成（筆者所有）</li>
          <li>フォント：Noto Serif JP / Yuji Syuku（Google Fonts）</li>
        </ul>
      </div>

      <div className="text-[10px] text-slate-500 font-kan leading-relaxed border-t border-slate-800/80 pt-3">
        ホーム画面に追加するとアプリ風に使えます（PWA対応）。
      </div>
    </div>
  );
}
