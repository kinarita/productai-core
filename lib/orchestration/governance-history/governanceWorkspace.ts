import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import type { GovernanceReadingModeId } from "@/lib/orchestration/governance-history/readingModes";

export interface GovernanceWorkspace {
  id: string;
  title: string;
  description?: string;
  savedReplayQuery: ReplayQueryState;
  activeReadingMode: GovernanceReadingModeId;
  pinnedInterpretations: string[];
  pinnedJournals: string[];
  pinnedAttentionItems: string[];
  createdAt: string;
  lastViewedAt?: string;
}

export function createGovernanceWorkspace(input: {
  title: string;
  savedReplayQuery: ReplayQueryState;
  description?: string;
  activeReadingMode?: GovernanceReadingModeId;
}): GovernanceWorkspace {
  const now = new Date().toISOString();
  return {
    id: `workspace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    description: input.description,
    savedReplayQuery: input.savedReplayQuery,
    activeReadingMode: input.activeReadingMode ?? "executive_overview",
    pinnedInterpretations: [],
    pinnedJournals: [],
    pinnedAttentionItems: [],
    createdAt: now,
    lastViewedAt: now,
  };
}

export function touchGovernanceWorkspace(workspace: GovernanceWorkspace): GovernanceWorkspace {
  return { ...workspace, lastViewedAt: new Date().toISOString() };
}
