"use client";

import Link from "next/link";
import type { ReleaseValidationView } from "@/lib/qa/releaseValidation";

export function ReleaseValidationPanel({ view }: { view: ReleaseValidationView }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="text-xs text-muted">{view.advisoryNote}</p>

      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">QA Checklist Status</p>
        <p className="text-sm font-medium text-foreground">{view.qaChecklistStatus}</p>
      </div>

      <ListSection title="Validation Coverage" items={view.validationCoverage} />
      <ListSection title="Open Risks" items={view.openRisks} />
      <ListSection title="Review Notes" items={view.reviewNotes} />

      <div className="grid gap-2 sm:grid-cols-2">
        <Link href="/release-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
          Open Release Readiness Workspace
        </Link>
        <Link href="/artifact-review" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
          Open Artifact Review Workspace
        </Link>
      </div>
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

