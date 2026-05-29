"use client";

import type { TraceabilitySummary } from "@/lib/orchestration/governance-history/traceabilityAnalysis";

export function TraceabilitySummaryPanel({
  summary,
  compact = false,
}: {
  summary: TraceabilitySummary;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">{summary.advisoryNote}</p>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Top pathways</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {summary.topPathways.length > 0 ? (
            summary.topPathways.slice(0, compact ? 3 : 6).map((p) => (
              <li key={p.id}>- {p.title}</li>
            ))
          ) : (
            <li>- Pathways form as governance memory connects.</li>
          )}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Recurring review paths</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {summary.recurringReviewPaths.slice(0, compact ? 2 : 4).map((line) => (
            <li key={line}>- {line}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Executive participation paths</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {summary.executiveParticipationPaths.slice(0, compact ? 2 : 4).map((line) => (
            <li key={line}>- {line}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Continuity chains</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {summary.continuityChains.slice(0, compact ? 2 : 4).map((line) => (
            <li key={line}>- {line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
