"use client";

import type { CrossReviewTraceabilityView } from "@/lib/cross-review/crossRoleReviewAnalysis";

export function CrossReviewTraceabilityPanel({
  view,
}: {
  view: CrossReviewTraceabilityView;
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Requested By</p>
          <p className="text-sm">{view.requestedBy}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Reviewed By</p>
          <p className="text-sm">{view.reviewedBy}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Related Role</p>
          <p className="text-sm">{view.relatedRole}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Related Artifact</p>
          <p className="text-sm">{view.relatedArtifact}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">Related Feed Events</p>
        <ul className="mt-1 space-y-1">
          {view.relatedFeedEvents.map((e, i) => (
            <li key={i} className="text-xs text-muted">
              · {e}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-muted">{view.advisoryNote}</p>
    </div>
  );
}
