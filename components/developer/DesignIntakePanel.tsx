"use client";

import type { DesignIntakeView } from "@/lib/developer/developerAnalysis";

export function DesignIntakePanel({ intake }: { intake: DesignIntakeView }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="font-medium text-foreground">{intake.missionName}</p>
      <Field label="User Flow Summary" value={intake.userFlowSummary} />
      <ListField label="Design Principles" items={intake.designPrinciples} />
      <Field label="Screen Inventory" value={intake.screenInventorySummary} />
      <Field label="Component Inventory" value={intake.componentInventorySummary} />
      <ListField label="UX Notes" items={intake.uxNotes} />
      <p className="text-[10px] text-muted">From Designer Workspace—visualization only.</p>
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
