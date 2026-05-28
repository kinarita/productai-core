import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import { coerceContinuityCategory } from "@/lib/replay-query/replayValidation";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export function buildReplayQuery(state: ReplayQueryState): string {
  const canonicalState: ReplayQueryState = {
    ...state,
    continuity:
      state.continuity === "all" ? "all" : coerceContinuityCategory(state.continuity),
  };
  const params = new URLSearchParams();
  (Object.keys(canonicalState) as Array<keyof ReplayQueryState>).forEach((key) => {
    const value = canonicalState[key];
    if (value !== replayQueryDefaults[key]) params.set(key, value);
  });
  if (canonicalState.governance !== "all") {
    params.set("gov", canonicalState.governance);
  }
  if (canonicalState.reasonCategory !== "all") {
    params.set("category", canonicalState.reasonCategory);
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}
