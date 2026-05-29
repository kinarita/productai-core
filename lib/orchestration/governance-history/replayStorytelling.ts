import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";
import type { NarrativeSummary } from "@/lib/orchestration/governance-history/narrativeBuilder";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { GovernanceStoryModeId } from "@/lib/orchestration/governance-history/storyModes";

export interface ReplayStorySection {
  id: "context" | "interpretation" | "continuity" | "reflection";
  title: string;
  body: string;
}

export function buildReplayStorySections(input: {
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
  narrativeSummary: NarrativeSummary;
  diagnostics?: ReplayDiagnostics | null;
  storyMode?: GovernanceStoryModeId;
}): ReplayStorySection[] {
  const latest = input.interpretations[0];
  const mode = input.storyMode ?? "summary_story";

  const contextBody =
    mode === "attention_story"
      ? input.narrativeSummary.attentionContext
      : latest
        ? `Observed ${latest.scope.replaceAll("_", " ")} replay with visibility ${latest.visibilityScore} and ${latest.replayConfidence} confidence in the ${latest.window} window.`
        : input.diagnostics
          ? `Current diagnostics: visibility ${input.diagnostics.replayVisibilityScore}, confidence ${input.diagnostics.replayConfidence}.`
          : "No interpretation records yet—story context will form as governance reading continues.";

  const interpretationBody =
    input.interpretations.length > 0
      ? input.interpretations
          .slice(0, mode === "detailed_story" ? 5 : 3)
          .map((r) => r.summary)
          .join(" ")
      : "Interpretation history is not yet recorded for this scope.";

  const continuityBody = input.narrativeSummary.continuityTheme;

  const reflectionBody =
    mode === "continuity_story"
      ? `${input.narrativeSummary.reviewFocus} Reflection is recommendation-only and does not initiate operational execution.`
      : `You may compare continuity themes across sessions and continue human-led review. ${input.journals[0]?.recommendedFollowup ?? "No journal follow-up recorded yet."}`;

  return [
    { id: "context", title: "Context", body: contextBody },
    { id: "interpretation", title: "Interpretation", body: interpretationBody },
    { id: "continuity", title: "Continuity", body: continuityBody },
    { id: "reflection", title: "Reflection", body: reflectionBody },
  ];
}
