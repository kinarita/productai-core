"use client";

import type { ProductBriefIntakeView } from "@/lib/director/directorAnalysis";

export function ProductBriefIntakePanel({ intake }: { intake: ProductBriefIntakeView }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Brief Title</p>
          <p className="font-medium text-foreground">{intake.briefTitle}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Status</p>
          <p>{intake.status}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Approval Status</p>
          <p>{intake.approvalStatus}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Approved At</p>
          <p>{intake.approvedAt ?? "—"}</p>
        </div>
      </div>
      <Section title="Planner Notes" items={intake.plannerNotes} />
      <Section title="Open Questions" items={intake.openQuestions} empty="No open questions recorded." />
    </div>
  );
}

function Section({
  title,
  items,
  empty = "None recorded.",
}: {
  title: string;
  items: string[];
  empty?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground">{title}</p>
      {items.length ? (
        <ul className="mt-1 list-inside list-disc text-xs text-muted">
          {items.map((item, i) => (
            <li key={`${title}-${i}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-muted">{empty}</p>
      )}
    </div>
  );
}
