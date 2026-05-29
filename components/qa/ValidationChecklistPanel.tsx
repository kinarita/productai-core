"use client";

import type { ValidationChecklistItem, ValidationChecklistView } from "@/lib/qa/validationChecklist";
import { cn } from "@/lib/utils";

const statusStyles: Record<ValidationChecklistItem["status"], string> = {
  planned: "text-muted border-border",
  in_review: "text-warning border-warning/30 bg-warning/5",
  completed: "text-success border-success/30 bg-success/5",
};

export function ValidationChecklistPanel({
  checklist,
  compact = false,
}: {
  checklist: ValidationChecklistView;
  compact?: boolean;
}) {
  const items = [
    checklist.functional,
    checklist.ux,
    checklist.integration,
    checklist.data,
    checklist.security,
    checklist.documentation,
  ];

  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {items.map((item) => (
        <li
          key={item.id}
          className={cn("rounded-lg border px-3 py-2", statusStyles[item.status])}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium">{item.label}</span>
            <span className="text-[10px] uppercase">{item.status.replaceAll("_", " ")}</span>
          </div>
          {!compact ? (
            <ul className="mt-1 list-inside list-disc text-[11px] opacity-90">
              {item.notes.map((n, i) => (
                <li key={`${item.id}-${i}`}>{n}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

