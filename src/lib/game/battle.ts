import { DerivedStats, Element } from "@/types/game";
import { Enemy, EnemyAI } from "./enemies";
import { Technique, findTech } from "./techniques";
import { BATTLE } from "./constants";

export type Action = "punch" | "kick" | "guard" | "tech";

export type PlayerAction =
  | { type: "punch" | "kick" | "guard" }
  | { type: "tech"; techId: string };

export type EnemyActionResolved =
  | { type: "punch" | "kick" | "guard" }
  | { type: "tech"; tech: Technique };

export type Side = {
  hp: number;
  maxHp: number;
  ki: number;
  maxKi: number;
};

export type TurnLog = {
  turn: number;
  playerAction: Action;
  playerTechName?: string;
  enemyAction: Action;
  enemyTechName?: string;
  playerDamage: number;  // プレイヤーが敵に与えたダメ
  enemyDamage: number;   // 敵がプレイヤーに与えたダメ
  playerDodged: boolean;
  enemyDodged: boolean;
  notes: string[];
  hpLeft: { player: number; enemy: number };
};

export type BattleState = {
  player: Side;
  enemy: Side;
  turn: number;
  over: null | "player" | "enemy";
  log: TurnLog[];
};

export const KI_MAX = 5;
export const KI_START = 1;
export const KI_REGEN = 1;  // ガード同士でさらに加算される想定

export function initBattle(playerStats: DerivedStats, enemy: Enemy): BattleState {
  return {
    player: { hp: playerStats.hp, maxHp: playerStats.hp, ki: KI_START, maxKi: KI_MAX },
    enemy:  { hp: enemy.stats.hp, maxHp: enemy.stats.hp, ki: KI_START, maxKi: KI_MAX },
    turn: 1,
    over: null,
    log: [],
  };
}

export function canUseTech(ki: number, tech: Technique) {
  return ki >= tech.cost;
}

// --- AI: 敵が選ぶアクション ---
export function chooseEnemyAction(state: BattleState, enemy: Enemy): EnemyActionResolved {
  const ai: EnemyAI = enemy.ai;
  const ki = state.enemy.ki;
  const hpRatio = state.enemy.hp / state.enemy.maxHp;

  // 敵の技は要素で固定（physical=猛撃 mult1.7 / magic=呪い mult1.5 pierceGuard）
  const enemyTech: Technique = enemy.element === "magic"
    ? { id: "enemy_juso", name: "陰湿な呪い", cost: 3, element: "magic", mult: 1.5, pierceGuard: true, flavor: "" }
    : { id: "enemy_ichigeki", name: "汚ェ一撃", cost: 3, element: "physical", mult: 1.7, flavor: "" };

  const rand = Math.random();
  const canTech = ki >= enemyTech.cost;
  const pick = (a: Action): EnemyActionResolved => a === "tech" ? { type: "tech", tech: enemyTech } : { type: a };

  if (ai === "novice") {
    if (rand < 0.55) return pick("punch");
    if (rand < 0.90) return pick("kick");
    return pick("guard");
  }
  if (ai === "bruiser") {
    if (canTech && rand < 0.20) return pick("tech");
    if (rand < 0.45) return pick("punch");
    if (rand < 0.75) return pick("kick");
    return pick("guard");
  }
  if (ai === "caster") {
    if (canTech && rand < 0.45) return pick("tech");
    if (rand < 0.60) return pick("guard");
    if (rand < 0.80) return pick("punch");
    return pick("kick");
  }
  // boss: HPが半分切ったら技多用、気力貯めるガードも織り交ぜる
  if (ai === "boss") {
    if (hpRatio < 0.5 && canTech && rand < 0.55) return pick("tech");
    if (canTech && rand < 0.30) return pick("tech");
    if (rand < 0.50) return pick("kick");
    if (rand < 0.75) return pick("punch");
    return pick("guard");
  }
  return pick("punch");
}

// --- 攻撃のダメージ算出 ---
function computeDamage(params: {
  action: Action;
  tech?: Technique;
  attackerStats: { attack: number; magic: number; focus: number };
  defenderStats: { defense: number; speed: number };
  defenderElement: Element;
  defenderWeakness: Element;
  oppAction: Action;    // 相手が取った行動（ガード中ならダメ減）
}): { damage: number; element: Element; notes: string[] } {
  const { action, tech, attackerStats, defenderStats, defenderElement, defenderWeakness, oppAction } = params;
  const notes: string[] = [];
  if (action === "guard") return { damage: 0, element: "physical", notes };

  let element: Element = "physical";
  let base = 0;
  if (action === "punch") { element = "physical"; base = attackerStats.attack; }
  else if (action === "kick") { element = "physical"; base = attackerStats.attack * 1.4; }
  else if (action === "tech" && tech) { element = tech.element; base = (tech.element === "magic" ? attackerStats.magic : attackerStats.attack) * tech.mult; }

  // ガード相性
  let guardMult = 1;
  if (oppAction === "guard") {
    if (action === "tech" && tech?.pierceGuard) { guardMult = 1.2; notes.push("ガード貫通"); }
    else if (action === "tech" && tech?.sureHit) { guardMult = 1.0; notes.push("絶対命中"); }
    else { guardMult = 0.3; notes.push("ガードで軽減"); }
  }

  // 属性相性
  const weaknessMult = element === defenderWeakness ? BATTLE.weaknessMult
    : element === defenderElement ? BATTLE.resistMult : 1;
  if (weaknessMult > 1) notes.push("弱点を突いた");
  else if (weaknessMult < 1) notes.push("耐性で半減");

  // 防御差し引き
  const defCut = element === "physical" ? defenderStats.defense / 2 : defenderStats.defense / 4;
  const variance = 0.9 + Math.random() * 0.2;
  const dmg = Math.max(1, Math.round((base - defCut) * guardMult * weaknessMult * variance));
  return { damage: dmg, element, notes };
}

// --- 1ターン解決（先手後手制：知力=focus で先攻決定） ---
export function resolveTurn(
  state: BattleState,
  playerAction: PlayerAction,
  playerStats: DerivedStats,
  enemy: Enemy,
): BattleState {
  if (state.over) return state;
  const enemyChoice = chooseEnemyAction(state, enemy);
  const notes: string[] = [];
  let playerAct: Action = playerAction.type;
  let enemyAct: Action = enemyChoice.type;

  // 気力計算（消費）
  let pKi = state.player.ki;
  let eKi = state.enemy.ki;
  let playerTech: Technique | undefined;
  if (playerAction.type === "tech") {
    playerTech = findTech(playerAction.techId);
    if (!playerTech || pKi < playerTech.cost) {
      playerAct = "punch";
      playerTech = undefined;
      notes.push("気力不足：拳に切替");
    } else pKi -= playerTech.cost;
  }
  let enemyTech: Technique | undefined;
  if (enemyChoice.type === "tech") {
    enemyTech = enemyChoice.tech;
    if (eKi < enemyTech.cost) { enemyAct = "punch"; enemyTech = undefined; }
    else eKi -= enemyTech.cost;
  }

  // 先攻決定：知力(focus)が高い方、同値はランダム
  const pFocus = playerStats.focus;
  const eFocus = enemy.stats.focus;
  const playerFirst = pFocus > eFocus ? true
    : pFocus < eFocus ? false
    : Math.random() < 0.5;
  notes.push(playerFirst ? `先手：自 (眼力 ${pFocus} vs ${eFocus})` : `先手：敵 (眼力 ${pFocus} vs ${eFocus})`);

  // 蹴りが先攻なら相手の技を潰す（後攻の蹴りは技を潰せない＝既に発動済み）
  let pCancelled = false, eCancelled = false;
  if (playerFirst && playerAct === "kick" && enemyAct === "tech") {
    eCancelled = true; enemyTech = undefined;
    notes.push("蹴りで敵の技を潰した");
  } else if (!playerFirst && enemyAct === "kick" && playerAct === "tech") {
    pCancelled = true; playerTech = undefined;
    notes.push("蹴りに技を潰された");
  }

  let newEnemyHp = state.enemy.hp;
  let newPlayerHp = state.player.hp;
  let playerDamage = 0; // 自→敵
  let enemyDamage = 0;  // 敵→自

  const playerTurn = () => {
    if (pCancelled || playerAct === "guard") return;
    // 敵が不動で受ける
    if (enemyAct === "tech" && enemyTech?.absorbAndReflect) {
      const refl = Math.max(1, Math.round(playerStats.attack * enemyTech.mult));
      newPlayerHp = Math.max(0, newPlayerHp - refl);
      enemyDamage += refl;
      notes.push(`敵の不動で受け流され、${refl} 反射された`);
      return;
    }
    const r = computeDamage({
      action: playerAct, tech: playerTech,
      attackerStats: { attack: playerStats.attack, magic: playerStats.magic, focus: playerStats.focus },
      defenderStats: { defense: enemy.stats.defense, speed: enemy.stats.speed },
      defenderElement: enemy.element, defenderWeakness: enemy.weakness,
      oppAction: enemyAct,
    });
    playerDamage += r.damage;
    newEnemyHp = Math.max(0, newEnemyHp - r.damage);
    if (r.notes.length) notes.push(...r.notes.map(n => `[自→敵] ${n}`));
  };

  const enemyTurn = () => {
    if (eCancelled || enemyAct === "guard") return;
    if (playerAct === "tech" && playerTech?.absorbAndReflect) {
      const refl = Math.max(1, Math.round(enemy.stats.attack * playerTech.mult));
      newEnemyHp = Math.max(0, newEnemyHp - refl);
      playerDamage += refl;
      notes.push(`不動で受け流し、${refl} 反射`);
      return;
    }
    const r = computeDamage({
      action: enemyAct, tech: enemyTech,
      attackerStats: { attack: enemy.stats.attack, magic: enemy.stats.magic, focus: enemy.stats.focus },
      defenderStats: { defense: playerStats.defense, speed: playerStats.speed },
      defenderElement: "physical", defenderWeakness: "magic",
      oppAction: playerAct,
    });
    enemyDamage += r.damage;
    newPlayerHp = Math.max(0, newPlayerHp - r.damage);
    if (r.notes.length) notes.push(...r.notes.map(n => `[敵→自] ${n}`));
  };

  // 先攻→後攻の順で解決（先攻で倒したら後攻の反撃なし）
  if (playerFirst) {
    playerTurn();
    if (newEnemyHp > 0) enemyTurn();
    else notes.push("先手で沈めた");
  } else {
    enemyTurn();
    if (newPlayerHp > 0) playerTurn();
    else notes.push("先手を取られ、沈んだ");
  }

  // ガード気力ボーナス
  if (playerAct === "guard") pKi = Math.min(KI_MAX, pKi + 1);
  if (enemyAct === "guard") eKi = Math.min(KI_MAX, eKi + 1);
  if (playerAct === "guard" && enemyAct === "guard") {
    pKi = Math.min(KI_MAX, pKi + 1);
    eKi = Math.min(KI_MAX, eKi + 1);
    notes.push("睨み合い — 両者気力+1");
  }
  // 自動回復
  pKi = Math.min(KI_MAX, pKi + KI_REGEN);
  eKi = Math.min(KI_MAX, eKi + KI_REGEN);

  const turnLog: TurnLog = {
    turn: state.turn,
    playerAction: playerAct,
    playerTechName: playerTech?.name,
    enemyAction: enemyAct,
    enemyTechName: enemyTech?.name,
    playerDamage,
    enemyDamage,
    playerDodged: false,
    enemyDodged: false,
    notes,
    hpLeft: { player: newPlayerHp, enemy: newEnemyHp },
  };

  let over: BattleState["over"] = null;
  if (newEnemyHp <= 0 && newPlayerHp > 0) over = "player";
  else if (newPlayerHp <= 0 && newEnemyHp > 0) over = "enemy";
  else if (newPlayerHp <= 0 && newEnemyHp <= 0) over = "enemy"; // 念のため

  return {
    player: { ...state.player, hp: newPlayerHp, ki: pKi },
    enemy:  { ...state.enemy,  hp: newEnemyHp,  ki: eKi },
    turn: state.turn + 1,
    over,
    log: [...state.log, turnLog],
  };
}

// --- 既存インターフェース互換（EXP計算/フレーバー） ---
export function computeExpReward(params: {
  baseReward: number;
  winner: "player" | "enemy";
  winStreak: number;
  firstKill: boolean;
}): number {
  if (params.winner === "enemy") return 0;
  const streakMult = Math.min(BATTLE.winStreakBonusCap, 1 + params.winStreak * BATTLE.winStreakBonusPerWin);
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
