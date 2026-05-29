"use client";

import type { RepositoryPlanView } from "@/lib/developer/repositoryPlan";

export function RepositoryPlanPanel({ plan }: { plan: RepositoryPlanView }) {
  return (
    <div className="space-y-4 text-sm">
      <ListSection title="Repository Structure" items={plan.repositoryStructure} />
      <ListSection title="Branch Strategy" items={plan.branchStrategy} />
      <ListSection title="Review Strategy" items={plan.reviewStrategy} />
      <ListSection title="Documentation Strategy" items={plan.documentationStrategy} />
      <p className="text-[10px] text-muted">Repository design only—no GitHub execution.</p>
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
