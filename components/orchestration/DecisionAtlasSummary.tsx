"use client";

import type { DecisionAtlasSummary } from "@/lib/orchestration/governance-history/decisionMemoryAnalysis";

export function DecisionAtlasSummaryPanel({
  summary,
  compact = false,
}: {
  summary: DecisionAtlasSummary;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">{summary.advisoryNote}</p>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Top themes</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {summary.topThemes.length > 0 ? (
            summary.topThemes.slice(0, compact ? 3 : 6).map((theme) => (
              <li key={theme.id}>
                - {theme.title} ({theme.count} linked context{theme.count === 1 ? "" : "s"})
              </li>
            ))
          ) : (
            <li>- Themes will appear as governance memory accrues.</li>
          )}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Review continuity</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {summary.reviewContinuity.slice(0, compact ? 2 : 4).map((line) => (
            <li key={line}>- {line}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Decision context</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {summary.decisionContext.length > 0 ? (
            summary.decisionContext.map((ctx) => <li key={ctx}>- {ctx}</li>)
          ) : (
            <li>- Record interpretations and narratives to form decision context.</li>
          )}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Executive participation</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {summary.executiveParticipation.slice(0, compact ? 3 : 5).map((entry) => (
            <li key={entry}>- {entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
