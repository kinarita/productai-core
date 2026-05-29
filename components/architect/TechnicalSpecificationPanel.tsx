"use client";

import Link from "next/link";
import type { TechnicalSpecificationRecord } from "@/lib/architect/technicalSpecification";

export function TechnicalSpecificationPanel({ spec }: { spec: TechnicalSpecificationRecord }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-foreground">{spec.title}</p>
        <Link href={spec.artifactReviewHref} className="text-xs text-accent hover:underline">
          Open Artifact Review →
        </Link>
      </div>
      <Field label="Problem Statement" value={spec.problemStatement} />
      <Field label="Proposed Solution" value={spec.proposedSolution} />
      <Field label="Architecture Summary" value={spec.architectureSummary} />
      <ListField label="Constraints" items={spec.constraints} />
      <ListField label="Assumptions" items={spec.assumptions} />
      <ListField label="Open Questions" items={spec.openQuestions} />
      <p className="text-[10px] text-muted">Display only—no code generation.</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted">{label}</p>
      <p className="text-xs text-foreground">{value}</p>
    </div>
  );
}

function ListField({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted">{label}</p>
      <ul className="mt-1 list-inside list-disc text-xs text-muted">
        {items.map((item, i) => (
          <li key={`${label}-${i}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
