"use client";

import type { TechnicalSpecificationIntakeView } from "@/lib/designer/designerAnalysis";

export function TechnicalSpecificationIntakePanel({
  intake,
}: {
  intake: TechnicalSpecificationIntakeView;
}) {
  return (
    <div className="space-y-4 text-sm">
      <p className="font-medium text-foreground">{intake.missionName}</p>
      <Field label="Problem Statement" value={intake.problemStatement} />
      <Field label="Proposed Solution" value={intake.proposedSolution} />
      <Field label="Architecture Summary" value={intake.architectureSummary} />
      <ListField label="Constraints" items={intake.constraints} />
      <ListField label="Assumptions" items={intake.assumptions} />
      <ListField label="Open Questions" items={intake.openQuestions} />
      <p className="text-[10px] text-muted">From Architect Workspace—visualization only.</p>
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
