import { Element } from "@/types/game";

export type Technique = {
  id: string;
  name: string;
  cost: number;           // 消費気力
  element: Element;
  mult: number;           // 対応ステータス倍率（physical=attack, magic=magic）
  pierceGuard?: boolean;  // 相手ガードを貫通（ダメージ×1.2）
  absorbAndReflect?: boolean; // 不動：被ダメ0＋attack*0.8を反射、自分は0ダメ
  sureHit?: boolean;      // 絶対命中（ガードも貫通）
  flavor: string;
};

export const TECHNIQUES: Technique[] = [
  { id: "tech_konshin",  name: "渾身の剛撃", cost: 3, element: "physical", mult: 1.8,                     flavor: "骨まで砕く一撃。" },
  { id: "tech_yomikiri", name: "読み切り",   cost: 3, element: "magic",    mult: 1.5, pierceGuard: true,  flavor: "三手先を読んで、急所に通す。" },
  { id: "tech_fudou",    name: "不動",       cost: 2, element: "physical", mult: 0.8, absorbAndReflect: true, flavor: "動かず、受け、返す。" },
  { id: "tech_hadou",    name: "破道",       cost: 5, element: "magic",    mult: 1.2, sureHit: true, pierceGuard: true, flavor: "拳と知略が、道を裂く。" },
];

export function findTech(id: string): Technique | undefined {
  return TECHNIQUES.find(t => t.id === id);
}
