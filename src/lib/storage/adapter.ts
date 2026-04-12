import { GameState } from "@/types/game";

export interface StorageAdapter {
  load(): GameState | null;
  save(state: GameState): void;
}
