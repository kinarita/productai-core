"use client";

import { useMemo } from "react";
import { buildNarrativeSummary } from "@/lib/orchestration/governance-history/narrativeBuilder";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import { useGovernanceJournalStore } from "@/lib/store/governanceJournalStore";
import { useGovernanceNarrativeStore } from "@/lib/store/governanceNarrativeStore";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";

export function ExecutiveGovernanceNarrativePanel({
  replayDiagnostics = null,
  compact = false,
}: {
  replayDiagnostics?: ReplayDiagnostics | null;
  compact?: boolean;
}) {
  const records = useReplayInterpretationStore((s) => s.records);
  const journals = useGovernanceJournalStore((s) => s.entries);
  const narratives = useGovernanceNarrativeStore((s) => s.narratives);
  const saveNarrative = useGovernanceNarrativeStore((s) => s.saveNarrative);
  const removeNarrative = useGovernanceNarrativeStore((s) => s.removeNarrative);

  const liveSummary = useMemo(
    () => buildNarrativeSummary({ interpretations: records, journals, diagnostics: replayDiagnostics }),
    [journals, records, replayDiagnostics]
  );

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">
        This narrative highlights continuity themes observed across recent governance interpretation
        sessions. It organizes flow—it does not conclude or decide.
      </p>
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-sm font-medium text-foreground">{liveSummary.title}</p>
        <p className="mt-1 text-xs text-muted">{liveSummary.summary}</p>
        <p className="mt-2 text-[11px] text-muted">{liveSummary.continuityTheme}</p>
      </div>
      <button
        type="button"
        onClick={() => saveNarrative({ interpretations: records, journals })}
        className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-surface"
      >
        Save governance narrative
      </button>
      {narratives.length > 0 ? (
        <ul className="space-y-2">
          {narratives.slice(0, compact ? 3 : 5).map((n) => (
            <li key={n.id} className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
              <p className="font-medium text-foreground">{n.title}</p>
              <p className="text-muted">{n.timeWindow} · {n.visibilityTrend}</p>
              <p className="mt-1 text-muted">{n.summary.slice(0, 160)}…</p>
              <button
                type="button"
                onClick={() => removeNarrative(n.id)}
                className="mt-1 text-[11px] text-muted hover:text-foreground"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
