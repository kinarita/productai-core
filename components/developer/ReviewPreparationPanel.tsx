"use client";

import type { DevelopmentReviewPreparationView } from "@/lib/developer/reviewPreparation";

export function ReviewPreparationPanel({ prep }: { prep: DevelopmentReviewPreparationView }) {
  return (
    <div className="space-y-4 text-sm">
      <ListSection title="Review Targets" items={prep.reviewTargets} />
      <ListSection title="Review Scope" items={prep.reviewScope} />
      <ListSection title="Review Notes" items={prep.reviewNotes} />
      <ListSection title="Recommended Review Areas" items={prep.recommendedReviewAreas} />
      <p className="text-[10px] text-muted">
        Integrates Architecture, Design, and Implementation review context.
      </p>
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
