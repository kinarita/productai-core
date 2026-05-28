"use client";

import Link from "next/link";
import { formatInterpretationRecordLabel } from "@/lib/orchestration/governance-history/replayInterpretationHistory";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface ReplayInterpretationHistoryPanelProps {
  replayQuery: ReplayQueryState;
  replayDiagnostics?: ReplayDiagnostics | null;
  interpretationPreset?: string | null;
  linkBasePath?: string;
  compact?: boolean;
}

export function ReplayInterpretationHistoryPanel({
  replayQuery,
  replayDiagnostics,
  interpretationPreset = null,
  linkBasePath = "/runtime-cost",
  compact = false,
}: ReplayInterpretationHistoryPanelProps) {
  const records = useReplayInterpretationStore((s) => s.records);
  const recordInterpretation = useReplayInterpretationStore((s) => s.recordInterpretation);
  const removeRecord = useReplayInterpretationStore((s) => s.removeRecord);
  const setComparisonLeft = useReplayInterpretationStore((s) => s.setComparisonLeft);
  const setComparisonRight = useReplayInterpretationStore((s) => s.setComparisonRight);

  const recordCurrent = () => {
    if (!replayDiagnostics) return;
    recordInterpretation({
      replayQuery,
      diagnostics: replayDiagnostics,
      interpretationPreset,
    });
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">
        Interpretation history preserves how governance was read—not merely which views were opened.
      </p>
      {replayDiagnostics ? (
        <button
          type="button"
          onClick={recordCurrent}
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-surface"
        >
          Record current interpretation
        </button>
      ) : null}
      {records.length === 0 ? (
        <p className="text-xs text-muted">No interpretation records yet.</p>
      ) : (
        <ul className="space-y-2">
          {records.slice(0, compact ? 5 : 10).map((record) => (
            <li key={record.id} className="rounded-lg border border-border bg-background px-3 py-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  {formatInterpretationRecordLabel(record)}
                </p>
                <span className="text-[11px] text-muted">{record.createdAt.slice(0, 16)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{record.summary}</p>
              <p className="mt-1 text-[11px] text-muted">{record.reviewFocus}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={buildReplayHref(linkBasePath, record.replayQuery)}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Reopen context →
                </Link>
                <button
                  type="button"
                  onClick={() => setComparisonLeft(record.id)}
                  className="text-[11px] text-muted hover:text-foreground"
                >
                  Compare A
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonRight(record.id)}
                  className="text-[11px] text-muted hover:text-foreground"
                >
                  Compare B
                </button>
                <button
                  type="button"
                  onClick={() => removeRecord(record.id)}
                  className="text-[11px] text-muted hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
