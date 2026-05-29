"use client";

import type { UxSpecificationView } from "@/lib/designer/uxSpecification";

export function UxSpecificationPanel({ ux }: { ux: UxSpecificationView }) {
  return (
    <div className="space-y-4 text-sm">
      <ListSection title="User Goals" items={ux.userGoals} />
      <ListSection title="User Tasks" items={ux.userTasks} />
      <ListSection title="Success Signals" items={ux.successSignals} />
      <ListSection title="Friction Points" items={ux.frictionPoints} />
      <ListSection title="Accessibility Notes" items={ux.accessibilityNotes} />
      <p className="text-[10px] text-muted">UX organization only—no UI implementation.</p>
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
