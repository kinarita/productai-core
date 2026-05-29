import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";
import type { ExecutiveGovernanceDigest } from "@/lib/orchestration/governance-history/governanceDigest";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import { deriveReplayReflectionObservations } from "@/lib/orchestration/governance-history/replayReflectionMemory";

export interface NarrativeSummary {
  title: string;
  summary: string;
  continuityTheme: string;
  reviewFocus: string;
  attentionContext: string;
}

export function buildNarrativeSummary(input: {
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
  digest?: ExecutiveGovernanceDigest | null;
  diagnostics?: ReplayDiagnostics | null;
}): NarrativeSummary {
  const sorted = [...input.interpretations].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
  const latest = sorted[sorted.length - 1];
  const earliest = sorted[0];

  const elevated = input.interpretations.filter(
    (r) => r.continuityStability === "elevated_review"
  ).length;
  const attentionJournals = input.journals.filter((j) => j.relatedAttentionId);

  const continuityTheme =
    latest && earliest && latest.continuityStability !== earliest.continuityStability
      ? `Continuity reading moved from ${earliest.continuityStability.replaceAll("_", " ")} toward ${latest.continuityStability.replaceAll("_", " ")} across recorded sessions.`
      : latest
        ? `Continuity remains framed as ${latest.continuityStability.replaceAll("_", " ")} in the latest interpretation.`
        : "Continuity themes will form as interpretations are recorded over time.";

  const reviewFocus =
    elevated > 0
      ? `Review concentration appeared in ${elevated} interpretation(s). Human review sequencing remains advisory.`
      : input.digest?.reviewConcentration ??
        "Review focus remains distributed across governance reading sessions.";

  const attentionContext =
    attentionJournals.length > 0
      ? `Decision attention context appears in ${attentionJournals.length} journal(s): ${attentionJournals[0].title}.`
      : input.digest?.unresolvedAttentionThemes[0] ??
        "No decision attention themes are linked in journals for this narrative window.";

  const visibilityNote =
    latest && earliest
      ? `Visibility moved from ${earliest.visibilityScore} to ${latest.visibilityScore}.`
      : input.diagnostics
        ? `Current visibility score is ${input.diagnostics.replayVisibilityScore} with ${input.diagnostics.replayConfidence} confidence.`
        : "";

  const patterns = deriveReplayReflectionObservations({
    interpretations: input.interpretations,
    journals: input.journals,
  });
  const patternNote =
    patterns.length > 0 ? patterns[0].observation.slice(0, 120) : "";

  const title =
    sorted.length >= 2
      ? `Governance continuity from ${earliest.createdAt.slice(0, 10)} to ${latest.createdAt.slice(0, 10)}`
      : "Governance interpretation narrative (forming)";

  const summary = [
    "This narrative highlights continuity themes observed across recent governance interpretation sessions.",
    continuityTheme,
    visibilityNote,
    patternNote,
    input.digest?.suggestedReviewContinuation ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title,
    summary,
    continuityTheme,
    reviewFocus,
    attentionContext,
  };
}
