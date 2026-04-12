import { GameState } from "@/types/game";
import { StorageAdapter } from "./adapter";

// クラウド同期用スタブ。後で Supabase/Firebase 等を差し込む想定。
// 実装時は fetch で /api/state に PUT/GET し、Bearer token で認証。
export function createCloudAdapter(endpoint: string, token: string): StorageAdapter {
  return {
    async load() {
      void endpoint; void token;
      throw new Error("CloudAdapter: 未実装。実装する時はここで GET して JSON.parse する。");
    },
    async save(state: GameState) {
      void state; void endpoint; void token;
      throw new Error("CloudAdapter: 未実装。");
    },
  } as unknown as StorageAdapter;
}
