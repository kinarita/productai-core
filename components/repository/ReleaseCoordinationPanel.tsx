"use client";

import type { ReleaseCoordinationView } from "@/lib/repository/releaseCoordination";

export function ReleaseCoordinationPanel({
  view,
  compact = false,
}: {
  view: ReleaseCoordinationView;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Readiness Summary</p>
          <p className="text-xs text-muted">{view.readinessSummary}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">QA Summary</p>
          <p className="text-xs text-muted">{view.qaSummary}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2 sm:col-span-2">
          <p className="text-[10px] uppercase text-muted">Documentation Summary</p>
          <p className="text-xs text-muted">{view.documentationSummary}</p>
        </div>
      </div>
      {view.releaseCandidates.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Release Candidates</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {view.releaseCandidates.slice(0, compact ? 2 : 5).map((c) => (
              <li key={`${c.version}-${c.branch}`}>
                · {c.missionName} — {c.version} ({c.state}) on {c.branch}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {view.releaseBlockers.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Release Blockers</p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted">
            {view.releaseBlockers.slice(0, compact ? 2 : 5).map((b) => (
              <li key={b}>· {b}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
