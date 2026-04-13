export type ItemKind = "world-heal" | "battle-heal" | "wallet";

export type Item = {
  id: string;
  name: string;
  kind: ItemKind;
  icon: string;
  desc: string;
  // world-heal: worldHpに回復
  // battle-heal: バトル中HPに回復
  healAmount?: number;
  // wallet: 所持時に自動で中身を取得（ドロップ時のみ現れる / 直接所持はしない）
  coinContents?: number;
  // ショップ購入価格（未定義 = 非売品/ドロップ専用）
  price?: number;
};

export const ITEMS: Record<string, Item> = {
  omamori: {
    id: "omamori",
    name: "お守り",
    kind: "world-heal",
    icon: "符",
    desc: "体力を1回復する。",
    healAmount: 1,
    price: 15,
  },
  yunomi: {
    id: "yunomi",
    name: "湯呑み一杯",
    kind: "world-heal",
    icon: "湯",
    desc: "体力を全回復する。",
    healAmount: 99,
    price: 60,
  },
  nigiri: {
    id: "nigiri",
    name: "握り飯",
    kind: "battle-heal",
    icon: "飯",
    desc: "バトル中、HPを15回復する（1ターン消費）。",
    healAmount: 15,
    price: 25,
  },
  boro_wallet: {
    id: "boro_wallet",
    name: "ボロ財布",
    kind: "wallet",
    icon: "財",
    desc: "中に5コイン。",
    coinContents: 5,
  },
  money_clip: {
    id: "money_clip",
    name: "マネークリップ",
    kind: "wallet",
    icon: "札",
    desc: "中に15コイン。",
    coinContents: 15,
  },
  luxury_wallet: {
    id: "luxury_wallet",
    name: "高級財布",
    kind: "wallet",
    icon: "金",
    desc: "中に40コイン。",
    coinContents: 40,
  },
};

export const SHOP_ITEMS = ["omamori", "yunomi", "nigiri"];

export const WORLD_HP_MAX = 5;
export const WORLD_HP_RECOVER_MS = 1000 * 60 * 60 * 2; // 2時間で1回復

// 敵撃破時に落ちるコイン＋財布ドロップの算出
export function rollEnemyDrop(expReward: number, rng: () => number = Math.random): {
  coins: number; walletId?: string;
} {
  // 基礎コイン: expReward の 30〜60%
  const coins = Math.max(1, Math.round(expReward * (0.3 + rng() * 0.3)));
  const r = rng();
  let walletId: string | undefined;
  if (r < 0.06) walletId = "luxury_wallet";
  else if (r < 0.22) walletId = "money_clip";
  else if (r < 0.55) walletId = "boro_wallet";
  return { coins, walletId };
}
