import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export const replayQueryDefaults: ReplayQueryState = {
  mission: "all",
  severity: "all",
  eventType: "all",
  source: "all",
  reasonCategory: "all",
  continuity: "all",
  advisory: "all",
  review: "all",
  governance: "all",
  replayWindow: "latest",
  scope: "organization",
};
