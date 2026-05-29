"use client";

import Link from "next/link";
import type { ReleaseReadinessView } from "@/lib/delivery/releaseReadiness";

export function ReleaseReadinessPanel({
  view,
  compact = false,
}: {
  view: ReleaseReadinessView;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Readiness Summary</p>
          <p className="text-sm font-medium">{view.readinessSummary}</p>
          <p className="mt-1 text-xs text-muted">Score: {view.readinessScore}/100</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">QA Status</p>
          <p className="text-xs text-muted">{view.qaStatus}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Documentation</p>
          <p className="text-xs text-muted">{view.documentationStatus}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Review Status</p>
          <p className="text-xs text-muted">{view.reviewStatus}</p>
        </div>
      </div>
      {view.releaseBlockers.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Release Blockers</p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted">
            {view.releaseBlockers.slice(0, compact ? 2 : 5).map((b) => (
              <li key={b}>· {b}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-muted">No release blockers observed for coordination reading.</p>
      )}
      <Link href="/release-workspace" className="mt-2 inline-block text-xs text-accent hover:underline">
        {compact ? "Release Workspace" : "Open Release Readiness Workspace"}
      </Link>
    </div>
  );
}
