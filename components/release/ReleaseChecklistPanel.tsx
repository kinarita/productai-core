"use client";

import type { ReleaseChecklistItem } from "@/lib/release/releaseChecklist";
import { cn } from "@/lib/utils";

const statusStyles: Record<ReleaseChecklistItem["status"], string> = {
  complete: "text-success border-success/30 bg-success/5",
  partial: "text-warning border-warning/30 bg-warning/5",
  missing: "text-muted border-border",
};

export function ReleaseChecklistPanel({
  items,
  compact = false,
}: {
  items: ReleaseChecklistItem[];
  compact?: boolean;
}) {
  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "rounded-lg border px-3 py-2",
            statusStyles[item.status]
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium">{item.label}</span>
            <span className="text-[10px] uppercase">{item.status}</span>
          </div>
          {!compact ? <p className="mt-1 text-[11px] opacity-90">{item.detail}</p> : null}
        </li>
      ))}
    </ul>
  );
}
