import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { ReplayQueryState, ReplayScope, ReplayWindow } from "@/lib/replay-query/replayQueryTypes";

export interface ReplayInterpretationRecord {
  id: string;
  createdAt: string;
  replayQuery: ReplayQueryState;
  scope: ReplayScope;
  window: ReplayWindow;
  interpretationPreset: string | null;
  continuityStability: ReplayDiagnostics["continuityStability"];
  replayConfidence: ReplayDiagnostics["replayConfidence"];
  visibilityScore: number;
  summary: string;
  reviewFocus: string;
}

export function createReplayInterpretationRecord(input: {
  replayQuery: ReplayQueryState;
  diagnostics: ReplayDiagnostics;
  interpretationPreset?: string | null;
  summary?: string;
  reviewFocus?: string;
}): ReplayInterpretationRecord {
  const now = new Date().toISOString();
  return {
    id: `interpretation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    replayQuery: input.replayQuery,
    scope: input.replayQuery.scope,
    window: input.replayQuery.replayWindow,
    interpretationPreset: input.interpretationPreset ?? null,
    continuityStability: input.diagnostics.continuityStability,
    replayConfidence: input.diagnostics.replayConfidence,
    visibilityScore: input.diagnostics.replayVisibilityScore,
    summary:
      input.summary ??
      `Interpreted ${input.replayQuery.scope.replaceAll("_", " ")} replay with ${input.diagnostics.replayConfidence} confidence.`,
    reviewFocus:
      input.reviewFocus ??
      (input.diagnostics.continuityExplanation.slice(0, 240) ||
        "Governance continuity interpretation recorded for executive review continuity."),
  };
}

export function formatInterpretationRecordLabel(record: ReplayInterpretationRecord): string {
  return `${record.scope.replaceAll("_", " ")} · ${record.window} · visibility ${record.visibilityScore}`;
}
