"use client";

import { useMemo } from "react";
import {
  buildExecutiveGovernanceDigest,
  formatExecutiveGovernanceDigest,
} from "@/lib/orchestration/governance-history/governanceDigest";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import { useGovernanceJournalStore } from "@/lib/store/governanceJournalStore";

interface ExecutiveGovernanceDigestProps {
  onExportDigest?: (text: string) => void;
  compact?: boolean;
}

export function ExecutiveGovernanceDigestPanel({
  onExportDigest,
  compact = false,
}: ExecutiveGovernanceDigestProps) {
  const records = useReplayInterpretationStore((s) => s.records);
  const journals = useGovernanceJournalStore((s) => s.entries);

  const digest = useMemo(
    () => buildExecutiveGovernanceDigest({ interpretations: records, journals }),
    [journals, records]
  );

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">{digest.executiveReadingNote}</p>
      <p className="text-[11px] text-muted">Generated {digest.generatedAt.slice(0, 16)}</p>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Recent replay interpretations</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {digest.recentInterpretations.slice(0, compact ? 3 : 5).map((r) => (
            <li key={r.id}>- {r.summary}</li>
          ))}
          {digest.recentInterpretations.length === 0 ? <li>- None recorded yet.</li> : null}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Recurring governance patterns</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {digest.recurringPatterns.map((p) => (
            <li key={p.id}>
              - {p.theme}: {p.observation}
            </li>
          ))}
          {digest.recurringPatterns.length === 0 ? <li>- No recurring patterns derived yet.</li> : null}
        </ul>
      </div>

      <p className="text-xs text-muted">{digest.reviewConcentration}</p>
      <p className="text-xs text-muted">{digest.runtimeAdvisoryContinuity}</p>

      {digest.continuityShifts.length > 0 ? (
        <ul className="space-y-1 text-xs text-muted">
          {digest.continuityShifts.map((s) => (
            <li key={s}>- {s}</li>
          ))}
        </ul>
      ) : null}

      {onExportDigest ? (
        <button
          type="button"
          onClick={() => onExportDigest(formatExecutiveGovernanceDigest(digest))}
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-accent hover:bg-surface"
        >
          Export governance digest
        </button>
      ) : null}
    </div>
  );
}
