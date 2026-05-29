"use client";

import Link from "next/link";
import type { ProductBriefReviewContext } from "@/lib/brief/productBriefReview";
import type { ProductBriefRecord } from "@/lib/brief/productBriefWorkspace";
import { briefArtifactId } from "@/lib/brief/productBriefWorkspace";

export function ProductBriefReviewPanel({
  context,
  brief,
}: {
  context: ProductBriefReviewContext;
  brief: ProductBriefRecord;
}) {
  const reviewHref = brief.missionId
    ? `/artifact-review?mission=${brief.missionId}&artifact=${briefArtifactId(brief.missionId)}`
    : "/artifact-review";

  return (
    <div className="space-y-4">
      <ListBlock title="Planner Notes" items={context.plannerNotes} />
      <ListBlock title="Open Questions" items={context.openQuestions} />
      <ListBlock title="Review Notes" items={context.reviewNotes} />
      {context.changesRequested.length > 0 ? (
        <ListBlock title="Changes Requested" items={context.changesRequested} accent />
      ) : null}
      <div>
        <p className="text-xs font-medium uppercase text-muted">Review History</p>
        <ul className="mt-2 space-y-2">
          {context.reviewHistory.map((h) => (
            <li key={`${h.label}-${h.at}`} className="rounded-lg border border-border px-3 py-2 text-xs">
              <p className="font-medium text-foreground">{h.label}</p>
              <p className="text-muted">{h.detail}</p>
              <p className="mt-1 text-[10px] text-muted">{h.at}</p>
            </li>
          ))}
        </ul>
      </div>
      {brief.missionId ? (
        <Link href={reviewHref} className="inline-block text-xs text-accent hover:underline">
          Open Artifact Review →
        </Link>
      ) : null}
    </div>
  );
}

function ListBlock({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className={accent ? "rounded-lg border border-warning/30 bg-warning/5 px-3 py-2" : ""}>
      <p className="text-xs font-medium uppercase text-muted">{title}</p>
      <ul className="mt-1 space-y-0.5 text-xs text-muted">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
