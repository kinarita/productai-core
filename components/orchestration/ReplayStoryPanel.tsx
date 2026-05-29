"use client";

import { useMemo } from "react";
import { buildReplayStorySections } from "@/lib/orchestration/governance-history/replayStorytelling";
import { buildNarrativeSummary } from "@/lib/orchestration/governance-history/narrativeBuilder";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import { useGovernanceJournalStore } from "@/lib/store/governanceJournalStore";
import { useGovernanceNarrativeStore } from "@/lib/store/governanceNarrativeStore";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";

export function ReplayStoryPanel({
  replayDiagnostics = null,
}: {
  replayDiagnostics?: ReplayDiagnostics | null;
}) {
  const records = useReplayInterpretationStore((s) => s.records);
  const journals = useGovernanceJournalStore((s) => s.entries);
  const activeStoryMode = useGovernanceNarrativeStore((s) => s.activeStoryMode);

  const narrativeSummary = useMemo(
    () => buildNarrativeSummary({ interpretations: records, journals, diagnostics: replayDiagnostics }),
    [journals, records, replayDiagnostics]
  );

  const sections = useMemo(
    () =>
      buildReplayStorySections({
        interpretations: records,
        journals,
        narrativeSummary,
        diagnostics: replayDiagnostics,
        storyMode: activeStoryMode,
      }),
    [activeStoryMode, journals, narrativeSummary, records, replayDiagnostics]
  );

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.id} className="rounded-lg border border-border bg-background px-3 py-2">
          <p className="text-xs font-medium uppercase text-muted">{section.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{section.body}</p>
        </div>
      ))}
    </div>
  );
}
