import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import {
  getConfidenceWording,
  getContinuityWording,
  replayDiagnosticsDefinitions,
} from "@/lib/replay-query/replayDiagnosticsLabels";
import { getContinuityStabilityLabel } from "@/lib/replay-query/replayDiagnosticsHelpers";

export function buildReplayLiteracySummary(diagnostics?: ReplayDiagnostics | null): string {
  if (!diagnostics) {
    return "Replay diagnostics support continuity interpretation across governance workflows. Open Runtime & Cost or CEO Home for scope-specific replay context.";
  }
  const completeness = Math.round(diagnostics.metadataCompletenessRatio * 100);
  return `Visibility score ${diagnostics.replayVisibilityScore} with ${completeness}% metadata completeness. ${getConfidenceWording(diagnostics.replayConfidence)}`;
}

export function buildContinuityInterpretation(diagnostics?: ReplayDiagnostics | null): string {
  if (!diagnostics) {
    return "Continuity should be read as governance context: stable, review-elevated, or advisory-dense depending on replay scope—not as an automated health verdict.";
  }
  const stabilityLabel = getContinuityStabilityLabel(diagnostics.continuityStability);
  return `${stabilityLabel}. ${getContinuityWording(diagnostics.continuityStability)} ${diagnostics.continuityExplanation}`;
}

export function buildGovernanceAttentionInterpretation(input?: {
  attentionCount?: number;
  lifecycleSummary?: string;
}): string {
  const count = input?.attentionCount ?? 0;
  if (count === 0) {
    return "No decision attention items are currently highlighted. Attention appears when replay, memory, or processing context suggests executive interpretation may help continuity reading.";
  }
  const lifecycle = input?.lifecycleSummary
    ? ` ${input.lifecycleSummary}`
    : "";
  return `${count} decision attention item(s) may benefit from executive interpretation.${lifecycle} Attention is recommendation-oriented and does not initiate operational execution.`;
}

export function buildReplayDiagnosticsOnboardingBullets(diagnostics?: ReplayDiagnostics | null): {
  visibility: string;
  confidence: string;
  completeness: string;
  continuity: string;
} {
  return {
    visibility: replayDiagnosticsDefinitions.replayVisibilityScore,
    confidence: diagnostics
      ? getConfidenceWording(diagnostics.replayConfidence)
      : replayDiagnosticsDefinitions.replayConfidence,
    completeness: replayDiagnosticsDefinitions.metadataCompleteness,
    continuity: diagnostics
      ? `${replayDiagnosticsDefinitions.continuityStability} ${getContinuityWording(diagnostics.continuityStability)}`
      : replayDiagnosticsDefinitions.continuityStability,
  };
}
