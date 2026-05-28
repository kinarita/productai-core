import type { ReplayScope, ReplayWindow } from "@/lib/replay-query/replayQueryTypes";
import { CONTINUITY_CATEGORIES, REPLAY_CATEGORIES, REPLAY_SEVERITIES, REPLAY_SOURCES } from "@/lib/replay-query/replayTaxonomy";

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
  ...Object.fromEntries(REPLAY_SEVERITIES.map((entry) => [entry.value, entry.label])),
};

export const replayContinuityLabels: Record<string, string> = {
  all: "All continuity",
  ...Object.fromEntries(CONTINUITY_CATEGORIES.map((entry) => [entry.value, entry.label])),
};

export const replayCategoryLabels: Record<string, string> = {
  all: "All replay categories",
  ...Object.fromEntries(REPLAY_CATEGORIES.map((entry) => [entry.value, entry.label])),
};

export const replaySourceLabels: Record<string, string> = {
  all: "All sources",
  ...Object.fromEntries(REPLAY_SOURCES.map((entry) => [entry.value, entry.label])),
};
