export type BaseStats = { body: number; mind: number; discipline: number };

export type DerivedStats = {
  hp: number;
  attack: number;
  defense: number;
  magic: number;
  speed: number;
  focus: number;
};

export type Character = {
  id: string;
  name: string;
  level: number;
  exp: number;
  base: BaseStats;
  skillPoints: number;
  skills: string[];
  equippedId?: string;
  equipmentUnlocked: string[];
};

export type SquatQuality = "good" | "deep" | "fast" | "shallow";

export type SquatSession = {
  id: string;
  date: string;
  reps: number;
  qualityCounts: Record<SquatQuality, number>;
  bodyGained: number;
  createdAt: number;
};

export type PushupSession = {
  id: string;
  date: string;
  reps: number;
  qualityCounts: Record<SquatQuality, number>;
  bodyGained: number;
  createdAt: number;
};

export type PlankSession = {
  id: string;
  date: string;
  durationSec: number;
  bodyGained: number;
  createdAt: number;
};

export type StudySession = {
  id: string;
  date: string;
  minutes: number;
  subject?: string;
  createdAt: number;
};

export type DailyActivity = { date: string; didTrain: boolean; didStudy: boolean };

export type Element = "physical" | "magic";

export type BattleRecord = {
  id: string;
  enemyId: string;
  result: "win" | "lose";
  expGained: number;
  createdAt: number;
};

export type MissionType = "squat" | "study" | "battleWin" | "pushup" | "plank";

export type DailyMission = {
  id: string;
  date: string;
  type: MissionType;
  goal: number;
  progress: number;
  completed: boolean;
  rewardExp: number;
  rewardDiscipline: number;
};

export type PendingBuff = { kind: "revenge"; expiresDate: string };

export type Settings = {
  reminderEnabled: boolean;
  reminderTime: string; // "HH:MM"
};

export type Inventory = Record<string, number>;

export type GameState = {
  version: number;
  worldHp: number;
  worldHpMax: number;
  worldHpLastRecoverAt: number;
  coins: number;
  inventory: Inventory;
  character: Character;
  squats: SquatSession[];
  pushups: PushupSession[];
  planks: PlankSession[];
  studies: StudySession[];
  dailies: Record<string, DailyActivity>;
  streak: number;
  lastActiveDate?: string;
  battles: BattleRecord[];
  winStreak: number;
  missions: Record<string, DailyMission[]>;
  buffs: PendingBuff[];
  achievements: Record<string, number>; // id → unlockedAt timestamp (0 if locked — absent means locked)
  settings: Settings;
  lastWeeklyReportDate?: string;
  lastShareDate?: string;
};
