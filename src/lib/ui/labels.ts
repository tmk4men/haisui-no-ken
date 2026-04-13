export const TITLE = "漢道";
export const TITLE_SUB = "OTOKODOU";
export const TITLE_MARK = "刻";
export const TAGLINE = "日々、己を刻め。";

export const BASE_LABEL = { body: "拳", mind: "頭", discipline: "肚" } as const;

export const DERIVED_LABEL = {
  hp: "体力",
  attack: "剛撃",
  defense: "受け",
  magic: "知略",
  speed: "機敏",
  focus: "眼力",
} as const;

export const MISSION_LABEL = {
  squat: "シバキ上げ（スクワット）",
  pushup: "押し込み（腕立て）",
  plank: "我慢（プランク・秒）",
  study: "読み込み（勉強・分）",
  battleWin: "殴り合いに勝つ",
} as const;

export const LEVELUP_LINES = [
  "ひとつ、漢の階段を昇った。",
  "刻んだ努力が、骨に染みた。",
  "拳が重くなった気がする。",
  "背中が、少し広くなった。",
];

export function levelupLine(level: number): string {
  return LEVELUP_LINES[level % LEVELUP_LINES.length];
}
