import { DerivedStats, Element } from "@/types/game";

export type Enemy = {
  id: string;
  name: string;
  chapter: string;
  taunt: string;
  element: Element;
  weakness: Element;
  stats: DerivedStats;
  expReward: number;
};

export const ENEMIES: Enemy[] = [
  // 第一章 — 路地裏
  { id: "kamashi", name: "かまし屋ジン", chapter: "第一章 — 路地裏", taunt: "オイ、カツアゲじゃねえ、挨拶だよ。", element: "physical", weakness: "physical", stats: { hp: 30, attack: 6, defense: 2, magic: 0, focus: 0, speed: 4 }, expReward: 20 },
  { id: "chinpira", name: "ツメ甘のチンピラ", chapter: "第一章 — 路地裏", taunt: "ビビってんじゃねえよ、ア？", element: "physical", weakness: "physical", stats: { hp: 40, attack: 7, defense: 3, magic: 0, focus: 2, speed: 6 }, expReward: 28 },
  // 第二章 — シマ争い
  { id: "totou", name: "徒党の頭・赤城", chapter: "第二章 — シマ争い", taunt: "てめえ一人で、どうにかなる相手じゃねえぞ。", element: "physical", weakness: "magic", stats: { hp: 55, attack: 10, defense: 5, magic: 0, focus: 0, speed: 8 }, expReward: 40 },
  { id: "bantou", name: "番頭の五郎", chapter: "第二章 — シマ争い", taunt: "シマ荒らしは、消えてもらう。", element: "physical", weakness: "magic", stats: { hp: 70, attack: 12, defense: 7, magic: 0, focus: 4, speed: 7 }, expReward: 55 },
  // 第三章 — 因縁
  { id: "onnen", name: "怨念の特攻隊長", chapter: "第三章 — 因縁", taunt: "気合いだけじゃ、亡霊は殴れねえぜ。", element: "magic", weakness: "magic", stats: { hp: 90, attack: 8, defense: 8, magic: 16, focus: 10, speed: 10 }, expReward: 80 },
  { id: "noroi", name: "呪詛の語り部", chapter: "第三章 — 因縁", taunt: "お前の名を、もう知っている。", element: "magic", weakness: "magic", stats: { hp: 85, attack: 6, defense: 10, magic: 20, focus: 14, speed: 9 }, expReward: 95 },
  // 第四章 — 頭脳戦
  { id: "reigan", name: "冷眼の策士・黒須", chapter: "第四章 — 頭脳戦", taunt: "脳がなけりゃ、拳は届かない。", element: "magic", weakness: "physical", stats: { hp: 70, attack: 4, defense: 6, magic: 22, focus: 18, speed: 12 }, expReward: 100 },
  { id: "joshi", name: "読み屋の女史", chapter: "第四章 — 頭脳戦", taunt: "三手先は、読めてる。", element: "magic", weakness: "physical", stats: { hp: 85, attack: 5, defense: 8, magic: 26, focus: 22, speed: 14 }, expReward: 120 },
  // 終章 — 伝説
  { id: "hebi", name: "毒蛇のセキ", chapter: "終章 — 伝説", taunt: "噛まれたが最後、遺言は間に合わねえ。", element: "physical", weakness: "magic", stats: { hp: 110, attack: 16, defense: 10, magic: 4, focus: 16, speed: 18 }, expReward: 140 },
  { id: "densetsu", name: "伝説の男・虎", chapter: "終章 — 伝説", taunt: "……来い。漢なら、逃げるな。", element: "physical", weakness: "magic", stats: { hp: 160, attack: 20, defense: 16, magic: 8, focus: 22, speed: 18 }, expReward: 200 },
];
