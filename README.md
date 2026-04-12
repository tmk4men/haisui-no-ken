# Real Life RPG (MVP)

現実の努力（筋トレ・勉強）がキャラクターのステータスに変換されるソロ育成ゲームのプロトタイプ。

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 を開く。

## 機能
- ホーム: ステータスと今日のサマリー
- スクワット: カメラ + MediaPipe Pose Landmarker で回数自動カウント
- 勉強: 時間を手入力
- バトル: ステータス依存のオート戦闘
- キャラ詳細: 履歴 / リセット

保存は `localStorage`（`src/lib/storage/` を差し替えでSQLite等に拡張可能）。

## ディレクトリ
- `src/app/` — ページ（App Router）
- `src/components/` — UI
- `src/hooks/` — `useGameState`, `usePoseDetection`
- `src/lib/game/` — 成長・戦闘などの純粋ロジック
- `src/lib/pose/` — スクワット状態遷移判定
- `src/lib/storage/` — 永続化アダプタ
- `src/types/` — 型定義

## 成長レート（`src/lib/game/constants.ts`）
- 1スクワット = Body +0.1
- 1分勉強 = Mind +0.05
- 1活動日 = Discipline +0.2

## 注意
- カメラ使用には HTTPS または localhost が必要
- MediaPipe モデル/WASM は CDN から初回ロード
