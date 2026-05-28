import type { ReplayQueryState, ReplayScope, ReplayWindow } from "@/lib/replay-query/replayQueryTypes";

const MAX_RECENT = 6;

export interface ReplayContinuityMemory {
  recentScopes: ReplayScope[];
  recentWindows: ReplayWindow[];
  recentAttentionCategories: string[];
  recentContinuityFocus: string[];
}

export const emptyReplayContinuityMemory: ReplayContinuityMemory = {
  recentScopes: [],
  recentWindows: [],
  recentAttentionCategories: [],
  recentContinuityFocus: [],
};

function pushUnique<T>(list: T[], value: T, max: number): T[] {
  const next = [value, ...list.filter((item) => item !== value)];
  return next.slice(0, max);
}

export function recordReplayContinuityContext(
  memory: ReplayContinuityMemory,
  query: ReplayQueryState
): ReplayContinuityMemory {
  return {
    recentScopes: pushUnique(memory.recentScopes, query.scope, MAX_RECENT),
    recentWindows: pushUnique(memory.recentWindows, query.replayWindow, MAX_RECENT),
    recentAttentionCategories:
      query.governanceAttention !== "all"
        ? pushUnique(memory.recentAttentionCategories, query.governanceAttention, MAX_RECENT)
        : memory.recentAttentionCategories,
    recentContinuityFocus:
      query.continuity !== "all"
        ? pushUnique(memory.recentContinuityFocus, query.continuity, MAX_RECENT)
        : memory.recentContinuityFocus,
  };
}

export interface ReplaySessionRecommendation {
  id: string;
  title: string;
  description: string;
  replayQuery: Partial<ReplayQueryState>;
}

export function buildReplaySessionRecommendations(input: {
  memory: ReplayContinuityMemory;
  lastReplayView: ReplayQueryState | null;
}): ReplaySessionRecommendation[] {
  const recommendations: ReplaySessionRecommendation[] = [];

  if (input.lastReplayView) {
    recommendations.push({
      id: "continue-recent",
      title: "Continue recent replay review",
      description:
        "Resume the last governance interpretation scope you were reading. View continuity only—no automated actions.",
      replayQuery: input.lastReplayView,
    });
  }

  if (input.memory.recentAttentionCategories.length > 0) {
    recommendations.push({
      id: "resume-governance",
      title: "Resume governance interpretation",
      description:
        "Reopen attention-oriented replay context from your recent governance reading sessions.",
      replayQuery: {
        governanceAttention: input.memory.recentAttentionCategories[0],
        governance: "decision_attention",
      },
    });
  }

  if (
    input.memory.recentContinuityFocus.includes("continuity_review") ||
    input.lastReplayView?.continuity === "continuity_review"
  ) {
    recommendations.push({
      id: "revisit-elevated-review",
      title: "Revisit elevated review continuity",
      description:
        "Review concentration and elevated review density remain advisory signals for human sequencing.",
      replayQuery: {
        continuity: "continuity_review",
        governance: "review_lifecycle",
        severity: "elevated",
      },
    });
  }

  if (
    input.memory.recentScopes.includes("runtime") ||
    input.lastReplayView?.scope === "runtime"
  ) {
    recommendations.push({
      id: "continue-runtime",
      title: "Continue runtime continuity interpretation",
      description:
        "Return to runtime continuity framing for advisory density and instability context.",
      replayQuery: {
        scope: "runtime",
        continuity: "continuity_runtime",
      },
    });
  }

  return recommendations.slice(0, 4);
}
