import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export function buildReplayQuery(state: ReplayQueryState): string {
  const params = new URLSearchParams();
  (Object.keys(state) as Array<keyof ReplayQueryState>).forEach((key) => {
    const value = state[key];
    if (value !== replayQueryDefaults[key]) params.set(key, value);
  });
  if (state.governance !== "all") {
    params.set("gov", state.governance);
  }
  if (state.reasonCategory !== "all") {
    params.set("category", state.reasonCategory);
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}
