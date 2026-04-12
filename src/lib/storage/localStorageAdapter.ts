import { GameState } from "@/types/game";
import { StorageAdapter } from "./adapter";
import { migrate } from "./migrate";

const KEY = "real-life-rpg:state";

export const localStorageAdapter: StorageAdapter = {
  load() {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return migrate(JSON.parse(raw));
    } catch {
      return null;
    }
  },
  save(state) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(state));
  },
};
