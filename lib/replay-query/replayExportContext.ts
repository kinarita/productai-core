import type { ExecutiveReplaySummary } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import type { ReplayInterpretationPreset } from "@/lib/orchestration/governance-history/replayInterpretationPresets";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import { buildReplayQuery } from "@/lib/replay-query/replayQueryBuilder";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export interface ReplayInterpretationExportContext {
  replayQuery: ReplayQueryState;
  scope: string;
  window: string;
  continuityExplanation: string;
  interpretationPresetTitle?: string;
  diagnosticsSummary: string;
  exportNote: string;
}

export function buildReplayInterpretationExportContext(input: {
  replayQuery: ReplayQueryState;
  continuityExplanation: string;
  diagnostics?: ReplayDiagnostics | null;
  summary?: ExecutiveReplaySummary | null;
  preset?: ReplayInterpretationPreset | null;
  baseUrl?: string;
}): ReplayInterpretationExportContext {
  const diagnosticsSummary = input.summary?.diagnosticsSummary
    ?? (input.diagnostics
      ? `Visibility ${input.diagnostics.replayVisibilityScore} · confidence ${input.diagnostics.replayConfidence} · completeness ${Math.round(input.diagnostics.metadataCompletenessRatio * 100)}%`
      : "Diagnostics summary unavailable for this scope.");

  const queryString = buildReplayQuery(input.replayQuery);
  const path = `/runtime-cost${queryString}`;
  const href = input.baseUrl ? `${input.baseUrl}${path}` : path;

  return {
    replayQuery: input.replayQuery,
    scope: input.replayQuery.scope,
    window: input.replayQuery.replayWindow,
    continuityExplanation: input.continuityExplanation,
    interpretationPresetTitle: input.preset?.title,
    diagnosticsSummary,
    exportNote: `Replay interpretation context (recommendation-only). Share link: ${href}`,
  };
}

export function formatReplayInterpretationExport(context: ReplayInterpretationExportContext): string {
  const lines = [
    "ProductAI — Replay interpretation context",
    context.exportNote,
    "",
    `Scope: ${context.scope}`,
    `Window: ${context.window}`,
    context.interpretationPresetTitle
      ? `Interpretation preset: ${context.interpretationPresetTitle}`
      : null,
    "",
    "Continuity explanation:",
    context.continuityExplanation,
    "",
    "Diagnostics summary:",
    context.diagnosticsSummary,
    "",
    "This export excludes execution intent, authorization state, and operator state.",
    "Replay diagnostics are recommendation-oriented governance aids.",
  ].filter(Boolean) as string[];

  return lines.join("\n");
}
