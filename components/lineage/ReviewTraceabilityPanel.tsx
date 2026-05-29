"use client";

import Link from "next/link";
import type { ReviewTraceabilityView } from "@/lib/lineage/reviewTraceability";

export function ReviewTraceabilityPanel({ view }: { view: ReviewTraceabilityView }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="text-xs text-muted">{view.advisoryNote}</p>
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Artifact Review Status</p>
        <p className="text-sm font-medium">{view.artifactReviewStatus}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">Review History</p>
        <ul className="mt-2 space-y-2">
          {view.reviewHistory.map((step) => (
            <li key={step.label} className="rounded-lg border border-border px-3 py-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="font-medium">{step.label}</span>
                <span className="text-[10px] uppercase text-muted">{step.status}</span>
              </div>
              <p className="mt-1 text-muted">{step.detail}</p>
            </li>
          ))}
        </ul>
      </div>
      {view.changesRequested.length > 0 ? (
        <ListSection title="Changes Requested" items={view.changesRequested} />
      ) : null}
      <ListSection title="Approval Context" items={view.approvalContext} />
      <Link href="/artifact-review" className="text-xs text-accent hover:underline">
        Open Artifact Review Workspace
      </Link>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground">{title}</p>
      <ul className="mt-1 list-inside list-disc text-xs text-muted">
        {items.map((item, i) => (
          <li key={`${title}-${i}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
