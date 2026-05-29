"use client";

import Link from "next/link";
import type { Mission, Task } from "@/types/productai";
import { buildMissionCrossReviewContext } from "@/lib/cross-review/crossRoleReviewAnalysis";

export function MissionCrossReviewContextPanel({
  mission,
  tasks,
}: {
  mission: Mission;
  tasks: Task[];
}) {
  const ctx = buildMissionCrossReviewContext({ mission, tasks });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{ctx.progressNote}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Active Reviews</p>
          <p className="text-lg font-semibold">{ctx.activeReviews}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Pending Reviews</p>
          <p className="text-lg font-semibold">{ctx.pendingReviews}</p>
        </div>
      </div>
      {ctx.relatedArtifacts.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Related Artifacts</p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted">
            {ctx.relatedArtifacts.map((a) => (
              <li key={a}>· {a}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {ctx.reviewHistory.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Review History</p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted">
            {ctx.reviewHistory.map((h) => (
              <li key={`${h.label}-${h.at}`}>
                · {h.label} — {h.state} ({h.at})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Link href={ctx.workspaceHref} className="text-xs text-accent hover:underline">
        Open Review Workspace
      </Link>
    </div>
  );
}
