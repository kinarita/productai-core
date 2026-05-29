"use client";

import type { MissionPlanRecord } from "@/lib/director/missionPlan";

export function MissionPlanPanel({ plan }: { plan: MissionPlanRecord }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="font-medium text-foreground">{plan.title}</p>
      <Field label="Objective" value={plan.objective} />
      <Field label="Scope Summary" value={plan.scopeSummary} />
      <ListField label="Success Criteria" items={plan.successCriteria} />
      <ListField label="Assumptions" items={plan.assumptions} />
      <ListField label="Risks" items={plan.risks} />
      <ListField label="Dependencies" items={plan.dependencies} />
      <p className="text-[10px] text-muted">
        Updated {plan.updatedAt} · Display only—no auto mission creation.
      </p>
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
