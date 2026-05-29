"use client";

import type { KnowledgeGraphSummary } from "@/lib/orchestration/governance-history/relationshipAnalysis";

export function KnowledgeGraphSummaryPanel({
  summary,
  compact = false,
}: {
  summary: KnowledgeGraphSummary;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">{summary.advisoryNote}</p>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Connected themes</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {summary.connectedThemes.slice(0, compact ? 3 : 5).map((theme) => (
            <li key={theme}>- {theme}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Active review areas</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {summary.activeReviewAreas.length > 0 ? (
            summary.activeReviewAreas.slice(0, compact ? 3 : 5).map((area) => (
              <li key={area}>- {area}</li>
            ))
          ) : (
            <li>- No active review areas connected yet.</li>
          )}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted">Continuity clusters</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {summary.continuityClusters.slice(0, compact ? 2 : 4).map((cluster) => (
            <li key={cluster}>- {cluster}</li>
          ))}
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

      {!compact ? (
        <>
          <div>
            <p className="text-xs font-medium uppercase text-muted">Most connected missions</p>
            <ul className="mt-1 space-y-1 text-xs text-muted">
              {summary.mostConnectedMissions.map((m) => (
                <li key={m.id}>
                  - {m.title} ({m.connectionCount} connections)
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted">Active attention clusters</p>
            <ul className="mt-1 space-y-1 text-xs text-muted">
              {summary.activeAttentionClusters.length > 0 ? (
                summary.activeAttentionClusters.map((a) => (
                  <li key={a.id}>- {a.title}</li>
                ))
              ) : (
                <li>- No attention clusters in the current graph window.</li>
              )}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
