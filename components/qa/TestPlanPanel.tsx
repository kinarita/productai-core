"use client";

import Link from "next/link";
import type { TestPlanRecord } from "@/lib/qa/testPlan";

export function TestPlanPanel({ plan }: { plan: TestPlanRecord }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Test Plan</p>
        <p className="text-lg font-semibold text-foreground">{plan.title}</p>
        <p className="mt-1 text-xs text-muted">
          Created: {plan.createdAt} · Updated: {plan.updatedAt}
        </p>
        <Link href={plan.artifactReviewHref} className="mt-2 inline-block text-xs text-accent hover:underline">
          Review this Test Plan artifact
        </Link>
      </div>

      <ListSection title="Objectives" items={plan.objectives} />
      <div>
        <p className="text-xs font-medium text-foreground">Scope</p>
        <p className="mt-1 text-xs text-muted">{plan.scope}</p>
      </div>
      <ListSection title="Test Areas" items={plan.testAreas} />
      <ListSection title="Assumptions" items={plan.assumptions} />
      <ListSection title="Exclusions" items={plan.exclusions} />
      <p className="text-[10px] text-muted">
        Display only. No automated testing or execution is performed.
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

