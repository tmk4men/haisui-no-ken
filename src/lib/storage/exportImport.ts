import { GameState } from "@/types/game";
import { migrate } from "./migrate";

export function exportState(state: GameState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `real-life-rpg-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importStateFromFile(file: File): Promise<GameState> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  return migrate(parsed);
}
