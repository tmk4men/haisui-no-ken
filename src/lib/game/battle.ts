import { DerivedStats, Element } from "@/types/game";
import { Enemy } from "./enemies";
import { BATTLE } from "./constants";

export type TurnEvent = {
  actor: "player" | "enemy";
  damage: number;
  element: Element;
  crit: boolean; // 必殺技
  dodged: boolean;
  techniqueName?: string;
  hpLeft: { player: number; enemy: number };
};

export type BattleResult = { winner: "player" | "enemy"; turns: TurnEvent[] };

type AttackerProfile = { attack: number; magic: number; focus: number; element: Element; isPlayer: boolean };
type DefenderProfile = { defense: number; speed: number; weakness: Element; element: Element };

const PLAYER_TECHS = { physical: "渾身の剛撃", magic: "頭脳の冷眼" };
const ENEMY_TECHS = { physical: "汚ェ一撃", magic: "陰湿な呪い" };

function critChance(focus: number) {
  return BATTLE.critBaseChance + focus / BATTLE.critFocusDivisor;
}
function dodgeChance(speed: number) {
  return Math.min(BATTLE.dodgeMaxChance, speed / BATTLE.dodgeSpeedDivisor);
}

function attackOnce(a: AttackerProfile, d: DefenderProfile): Omit<TurnEvent, "actor" | "hpLeft"> {
  if (Math.random() < dodgeChance(d.speed)) {
    return { damage: 0, element: a.element, crit: false, dodged: true };
  }
  const base = a.element === "magic" ? a.magic : a.attack;
  const defMult = a.element === "magic" ? 1 - Math.min(0.7, d.defense * 0.005) : 1;
  const raw = a.element === "magic" ? base * defMult : Math.max(1, base - d.defense / 2);
  const weaknessMult = a.element === d.weakness ? BATTLE.weaknessMult
    : a.element === d.element ? BATTLE.resistMult : 1;
  const isCrit = Math.random() < critChance(a.focus);
  const critMult = isCrit ? BATTLE.critDamageMult : 1;
  const variance = 0.9 + Math.random() * 0.2;
  const damage = Math.max(1, Math.round(raw * weaknessMult * critMult * variance));
  const techniqueName = isCrit
    ? (a.isPlayer ? PLAYER_TECHS[a.element] : ENEMY_TECHS[a.element])
    : undefined;
  return { damage, element: a.element, crit: isCrit, dodged: false, techniqueName };
}

export function runBattle(player: DerivedStats, enemy: Enemy): BattleResult {
  const playerElement: Element = player.magic > player.attack ? "magic" : "physical";
  const playerProfile: AttackerProfile = { attack: player.attack, magic: player.magic, focus: player.focus, element: playerElement, isPlayer: true };
  const playerDef: DefenderProfile = { defense: player.defense, speed: player.speed, weakness: "magic", element: "physical" };
  const enemyProfile: AttackerProfile = { attack: enemy.stats.attack, magic: enemy.stats.magic, focus: enemy.stats.focus, element: enemy.element, isPlayer: false };
  const enemyDef: DefenderProfile = { defense: enemy.stats.defense, speed: enemy.stats.speed, weakness: enemy.weakness, element: enemy.element };

  let pHp = player.hp;
  let eHp = enemy.stats.hp;
  const turns: TurnEvent[] = [];
  const playerFirst = player.speed >= enemy.stats.speed;
  let safety = 0;
  while (pHp > 0 && eHp > 0 && safety++ < 100) {
    const order: ("player" | "enemy")[] = playerFirst ? ["player", "enemy"] : ["enemy", "player"];
    for (const actor of order) {
      if (pHp <= 0 || eHp <= 0) break;
      const atk = actor === "player" ? attackOnce(playerProfile, enemyDef) : attackOnce(enemyProfile, playerDef);
      if (actor === "player") eHp -= atk.damage;
      else pHp -= atk.damage;
      turns.push({
        actor,
        ...atk,
        hpLeft: { player: Math.max(0, pHp), enemy: Math.max(0, eHp) },
      });
    }
  }
  return { winner: eHp <= 0 ? "player" : "enemy", turns };
}

export function computeExpReward(params: {
  baseReward: number;
  winner: "player" | "enemy";
  winStreak: number;
  firstKill: boolean;
}): number {
  if (params.winner === "enemy") return 0;
  const streakMult = Math.min(
    BATTLE.winStreakBonusCap,
    1 + params.winStreak * BATTLE.winStreakBonusPerWin
  );
  const firstMult = params.firstKill ? BATTLE.firstKillBonusMult : 1;
  return Math.round(params.baseReward * streakMult * firstMult);
}

export function flavorResult(params: {
  winner: "player" | "enemy";
  enemyName: string;
  winStreak: number;
}): string {
  if (params.winner === "player") {
    if (params.winStreak >= 5) return `${params.enemyName} 沈黙。……もう誰も止められねえ。`;
    if (params.winStreak >= 3) return `${params.enemyName} を黙らせた。まだ止まらねえぞ。`;
    return `${params.enemyName} を叩きのめした。`;
  }
  return `${params.enemyName} に膝をついた。……覚えてろよ。`;
}
