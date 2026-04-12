import { DailyMission, MissionType } from "@/types/game";
import { MISSION_TEMPLATES } from "./constants";

let idCounter = 0;
const uid = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export function generateDailyMissions(date: string): DailyMission[] {
  return MISSION_TEMPLATES.map(t => ({
    id: uid(),
    date,
    type: t.type as MissionType,
    goal: t.goal,
    progress: 0,
    completed: false,
    rewardExp: t.rewardExp,
    rewardDiscipline: t.rewardDiscipline,
  }));
}

export function advanceMission(m: DailyMission, type: MissionType, amount: number): DailyMission {
  if (m.completed || m.type !== type) return m;
  const progress = Math.min(m.goal, m.progress + amount);
  return { ...m, progress, completed: progress >= m.goal };
}
