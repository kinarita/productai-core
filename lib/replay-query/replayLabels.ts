import type { ReplayScope, ReplayWindow } from "@/lib/replay-query/replayQueryTypes";

export const replayScopeLabels: Record<ReplayScope, string> = {
  organization: "Organization-wide",
  mission: "Mission-focused",
  runtime: "Runtime continuity",
  continuity: "Continuity",
  governance_review: "Governance review",
};

export const replayWindowLabels: Record<ReplayWindow, string> = {
  latest: "Latest",
  short: "Short",
  medium: "Medium",
  extended: "Extended",
};

export const replayWindowDescriptions: Record<ReplayWindow, string> = {
  latest: "Focused operational replay window",
  short: "Condensed continuity replay",
  medium: "Balanced governance replay",
  extended: "Extended continuity replay context",
};

export const replaySeverityLabels: Record<string, string> = {
  all: "All severity",
  low: "Low",
  moderate: "Moderate",
  elevated: "Elevated",
  critical_review: "Critical review",
};
