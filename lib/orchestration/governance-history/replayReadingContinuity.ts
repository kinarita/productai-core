import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";
import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export interface ReplayReadingContinuity {
  recentReviewThemes: string[];
  recentReplayModes: string[];
  recentGovernanceFocus: string[];
  recentDigestContexts: string[];
}

export const emptyReplayReadingContinuity: ReplayReadingContinuity = {
  recentReviewThemes: [],
  recentReplayModes: [],
  recentGovernanceFocus: [],
  recentDigestContexts: [],
};

const MAX = 8;

function pushUnique(list: string[], value: string): string[] {
  return [value, ...list.filter((item) => item !== value)].slice(0, MAX);
}

export function recordReplayReadingContinuity(
  memory: ReplayReadingContinuity,
  input: {
    readingMode: string;
    replayQuery: ReplayQueryState;
    digestContext?: string;
    reviewTheme?: string;
  }
): ReplayReadingContinuity {
  return {
    recentReplayModes: pushUnique(memory.recentReplayModes, input.readingMode),
    recentGovernanceFocus: pushUnique(
      memory.recentGovernanceFocus,
      input.replayQuery.governance !== "all"
        ? input.replayQuery.governance
        : input.replayQuery.scope
    ),
    recentDigestContexts: input.digestContext
      ? pushUnique(memory.recentDigestContexts, input.digestContext)
      : memory.recentDigestContexts,
    recentReviewThemes: input.reviewTheme
      ? pushUnique(memory.recentReviewThemes, input.reviewTheme)
      : memory.recentReviewThemes,
  };
}

export function continuityFocusFromQuery(query: ReplayQueryState): string {
  if (query.governanceAttention !== "all") return `attention:${query.governanceAttention}`;
  if (query.continuity !== "all") return query.continuity;
  return query.scope;
}

export function buildReadingContinuitySummary(memory: ReplayReadingContinuity): string {
  if (
    memory.recentReviewThemes.length === 0 &&
    memory.recentReplayModes.length === 0
  ) {
    return "Reading continuity will accumulate as you review governance contexts in this workspace.";
  }
  const modes = memory.recentReplayModes.slice(0, 3).join(", ");
  const themes = memory.recentReviewThemes.slice(0, 2).join("; ");
  return `Recent modes: ${modes || "none"}. Themes: ${themes || "forming"}.`;
}

export function digestContextFromRecords(input: {
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
}): string {
  const latest = input.interpretations[0];
  const journal = input.journals[0];
  if (latest && journal) {
    return `${latest.summary.slice(0, 80)} · journal: ${journal.title}`;
  }
  if (latest) return latest.summary.slice(0, 120);
  if (journal) return `Journal: ${journal.title}`;
  return "No prior digest context recorded.";
}
