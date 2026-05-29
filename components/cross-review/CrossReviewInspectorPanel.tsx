"use client";

import Link from "next/link";
import type { CrossReviewInspectorView } from "@/lib/cross-review/crossRoleReviewAnalysis";

export function CrossReviewInspectorPanel({
  inspector,
}: {
  inspector: CrossReviewInspectorView;
}) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">{inspector.artifactTitle}</p>
        <p className="mt-1 text-xs text-muted">State: {inspector.reviewState}</p>
        <p className="mt-2 text-xs">{inspector.artifactSummary}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground">Review History</p>
        <ul className="mt-1 space-y-1">
          {inspector.reviewHistory.map((h) => (
            <li key={h.label} className="text-xs text-muted">
              · {h.label} — {h.detail}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground">Related Feed Events</p>
        {inspector.relatedFeedEvents.length ? (
          <ul className="mt-1 space-y-2">
            {inspector.relatedFeedEvents.map((e) => (
              <li key={e.id} className="rounded-lg border border-border px-3 py-2 text-xs text-muted">
                <span className="font-medium text-foreground">{e.label}</span>
                <p className="mt-0.5">{e.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-muted">No related feed events in view.</p>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-foreground">Related Workspaces</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {inspector.relatedWorkspaces.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
            >
              {w.label}
            </Link>
          ))}
        </div>
      </div>

      <Link href={inspector.lineageHref} className="text-xs text-accent hover:underline">
        Open Artifact Lineage
      </Link>
    </div>
  );
}
