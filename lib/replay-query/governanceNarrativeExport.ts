import type { ExecutiveGovernanceNarrative } from "@/lib/orchestration/governance-history/governanceNarratives";
import type { ExecutiveReviewJourney } from "@/lib/orchestration/governance-history/reviewJourney";
import type { NarrativeSummary } from "@/lib/orchestration/governance-history/narrativeBuilder";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";

export function formatGovernanceNarrativeExport(input: {
  narrativeSummary: NarrativeSummary;
  narrative?: ExecutiveGovernanceNarrative | null;
  journey?: ExecutiveReviewJourney | null;
  diagnostics?: ReplayDiagnostics | null;
}): string {
  const lines = [
    "ProductAI — Executive governance narrative (interpretation support only)",
    "",
    "Narrative summary:",
    input.narrativeSummary.summary,
    "",
    `Continuity theme: ${input.narrativeSummary.continuityTheme}`,
    `Review focus: ${input.narrativeSummary.reviewFocus}`,
    `Attention context: ${input.narrativeSummary.attentionContext}`,
  ];

  if (input.narrative) {
    lines.push(
      "",
      "Saved narrative:",
      input.narrative.title,
      `Time window: ${input.narrative.timeWindow}`,
      `Visibility trend: ${input.narrative.visibilityTrend}`,
      input.narrative.reviewTheme
    );
  }

  if (input.journey) {
    lines.push(
      "",
      "Review journey:",
      input.journey.title,
      `Continuity focus: ${input.journey.continuityFocus}`,
      `Next suggested reading (advisory): ${input.journey.nextSuggestedReading}`
    );
  }

  if (input.diagnostics) {
    lines.push(
      "",
      "Replay diagnostics context:",
      `Visibility ${input.diagnostics.replayVisibilityScore} · confidence ${input.diagnostics.replayConfidence} · completeness ${Math.round(input.diagnostics.metadataCompletenessRatio * 100)}%`
    );
  }

  lines.push(
    "",
    "Excludes execution state, authorization state, operator state, and execution targets.",
    "This narrative organizes flow for human interpretation—it does not conclude or decide."
  );

  return lines.join("\n");
}
