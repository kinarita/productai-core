"use client";

import type { MissionIntakeView } from "@/lib/architect/architectAnalysis";

export function MissionIntakePanel({ intake }: { intake: MissionIntakeView }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="font-medium text-foreground">{intake.missionName}</p>
      <Field label="Objective" value={intake.objective} />
      <Field label="Scope Summary" value={intake.scopeSummary} />
      <ListField label="Success Criteria" items={intake.successCriteria} />
      <ListField label="Assumptions" items={intake.assumptions} />
      <ListField label="Risks" items={intake.risks} />
      <ListField label="Dependencies" items={intake.dependencies} />
      <p className="text-[10px] text-muted">Director handoff context—visualization only.</p>
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
