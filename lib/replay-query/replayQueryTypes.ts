export type ReplayScope =
  | "organization"
  | "mission"
  | "runtime"
  | "continuity"
  | "governance_review";

export type ReplayWindow = "latest" | "short" | "medium" | "extended";

export interface ReplayQueryState {
  mission: string;
  severity: string;
  eventType: string;
  source: string;
  reasonCategory: string;
  continuity: string;
  advisory: string;
  review: string;
  governance: string;
  replayWindow: ReplayWindow;
  scope: ReplayScope;
}
