import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import type { GovernanceJournalEntry } from "@/lib/orchestration/governance-history/governanceJournal";
import {
  deriveReplayReflectionObservations,
  type ReplayReflectionObservation,
} from "@/lib/orchestration/governance-history/replayReflectionMemory";

export interface ExecutiveGovernanceDigest {
  generatedAt: string;
  recentInterpretations: ReplayInterpretationRecord[];
  recurringPatterns: ReplayReflectionObservation[];
  continuityShifts: string[];
  reviewConcentration: string;
  runtimeAdvisoryContinuity: string;
  unresolvedAttentionThemes: string[];
  executiveReadingNote: string;
}

export function buildExecutiveGovernanceDigest(input: {
  interpretations: ReplayInterpretationRecord[];
  journals: GovernanceJournalEntry[];
}): ExecutiveGovernanceDigest {
  const recent = [...input.interpretations]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);
  const recurringPatterns = deriveReplayReflectionObservations({
    interpretations: input.interpretations,
    journals: input.journals,
  });

  const continuityShifts: string[] = [];
  for (let i = 0; i < recent.length - 1; i += 1) {
    const newer = recent[i];
    const older = recent[i + 1];
    if (newer.continuityStability !== older.continuityStability) {
      continuityShifts.push(
        `${newer.createdAt.slice(0, 10)}: continuity reading shifted from ${older.continuityStability.replaceAll("_", " ")} to ${newer.continuityStability.replaceAll("_", " ")}.`
      );
    }
  }

  const elevatedCount = recent.filter((r) => r.continuityStability === "elevated_review").length;
  const reviewConcentration =
    elevatedCount > 0
      ? `Review concentration noted in ${elevatedCount} recent interpretation(s). Human sequencing remains advisory.`
      : "No elevated review concentration in the latest interpretation window.";

  const runtimeCount = recent.filter((r) => r.scope === "runtime").length;
  const runtimeAdvisoryContinuity =
    runtimeCount > 0
      ? `Runtime continuity interpreted ${runtimeCount} time(s) recently. Observability context only.`
      : "Runtime continuity interpretation not prominent in recent records.";

  const unresolvedAttentionThemes = input.journals
    .filter((j) => j.relatedAttentionId)
    .slice(0, 5)
    .map((j) => `${j.title}: ${j.humanInterpretation.slice(0, 120)}`);

  return {
    generatedAt: new Date().toISOString(),
    recentInterpretations: recent,
    recurringPatterns,
    continuityShifts: continuityShifts.slice(0, 5),
    reviewConcentration,
    runtimeAdvisoryContinuity,
    unresolvedAttentionThemes,
    executiveReadingNote:
      "This digest is recommendation-oriented executive reading support—not executive decision automation.",
  };
}

export function formatExecutiveGovernanceDigest(digest: ExecutiveGovernanceDigest): string {
  const lines = [
    "ProductAI — Executive governance digest",
    digest.executiveReadingNote,
    `Generated: ${digest.generatedAt}`,
    "",
    "Recent replay interpretations:",
    ...digest.recentInterpretations.slice(0, 5).map(
      (r) => `- ${r.createdAt.slice(0, 16)} · ${r.summary}`
    ),
    "",
    "Recurring governance patterns:",
    ...digest.recurringPatterns.map((p) => `- ${p.theme}: ${p.observation}`),
    "",
    "Continuity shifts:",
    ...(digest.continuityShifts.length > 0
      ? digest.continuityShifts.map((s) => `- ${s}`)
      : ["- No continuity stability shifts in recent records."]),
    "",
    `Review concentration: ${digest.reviewConcentration}`,
    `Runtime advisory continuity: ${digest.runtimeAdvisoryContinuity}`,
    "",
    "Unresolved attention themes:",
    ...(digest.unresolvedAttentionThemes.length > 0
      ? digest.unresolvedAttentionThemes.map((t) => `- ${t}`)
      : ["- None recorded in governance journals."]),
    "",
    "Excludes execution state, authorization state, operator state, and execution targets.",
  ];
  return lines.join("\n");
}
