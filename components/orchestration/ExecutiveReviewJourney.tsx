"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildNarrativeSummary } from "@/lib/orchestration/governance-history/narrativeBuilder";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import { useGovernanceJournalStore } from "@/lib/store/governanceJournalStore";
import { useGovernanceNarrativeStore } from "@/lib/store/governanceNarrativeStore";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import { mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export function ExecutiveReviewJourneyPanel({
  replayQuery = replayQueryDefaults,
  linkBasePath = "/runtime-cost",
  compact = false,
}: {
  replayQuery?: ReplayQueryState;
  linkBasePath?: string;
  compact?: boolean;
}) {
  const records = useReplayInterpretationStore((s) => s.records);
  const journals = useGovernanceJournalStore((s) => s.entries);
  const journeys = useGovernanceNarrativeStore((s) => s.journeys);
  const activeJourneyId = useGovernanceNarrativeStore((s) => s.activeJourneyId);
  const saveJourney = useGovernanceNarrativeStore((s) => s.saveJourney);
  const setActiveJourney = useGovernanceNarrativeStore((s) => s.setActiveJourney);

  const liveSummary = useMemo(
    () => buildNarrativeSummary({ interpretations: records, journals }),
    [journals, records]
  );

  const activeJourney = journeys.find((j) => j.id === activeJourneyId) ?? journeys[0];

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">
        Review journeys are footprints of continuous governance reading—not automatic routing.
      </p>
      <button
        type="button"
        onClick={() => saveJourney({ interpretations: records, journals })}
        className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-surface"
      >
        Record review journey
      </button>
      {activeJourney ? (
        <div className="rounded-lg border border-border bg-background px-3 py-2">
          <p className="text-sm font-medium text-foreground">{activeJourney.title}</p>
          <p className="mt-1 text-xs text-muted">{activeJourney.continuityFocus}</p>
          <p className="mt-1 text-xs text-muted">
            Next suggested reading (advisory): {activeJourney.nextSuggestedReading}
          </p>
          {activeJourney.recentThemes.length > 0 ? (
            <p className="mt-1 text-[11px] text-muted">
              Themes: {activeJourney.recentThemes.join(", ")}
            </p>
          ) : null}
          <Link
            href={buildReplayHref(linkBasePath, mergeReplayQuery(replayQuery, { governanceAttention: "attention" }))}
            className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
          >
            Continue journey reading →
          </Link>
        </div>
      ) : (
        <p className="text-xs text-muted">{liveSummary.reviewFocus}</p>
      )}
      {journeys.length > 1 ? (
        <ul className="flex flex-wrap gap-1">
          {journeys.slice(0, 5).map((j) => (
            <button
              key={j.id}
              type="button"
              onClick={() => setActiveJourney(j.id)}
              className="rounded-md border border-border px-2 py-0.5 text-[10px] text-muted hover:text-foreground"
            >
              {j.startedAt.slice(0, 10)}
            </button>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
