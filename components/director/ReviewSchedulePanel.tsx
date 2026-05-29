"use client";

import type { ReviewScheduleItem } from "@/lib/director/reviewSchedule";
import { cn } from "@/lib/utils";

export function ReviewSchedulePanel({ items }: { items: ReviewScheduleItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-border px-3 py-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-foreground">{item.label}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] uppercase",
                item.state === "completed" && "bg-success/10 text-success",
                item.state === "scheduled" && "bg-accent/10 text-accent",
                item.state === "planned" && "bg-muted/30 text-muted"
              )}
            >
              {item.state}
            </span>
          </div>
          <p className="mt-1 text-muted">{item.note}</p>
        </li>
      ))}
    </ul>
  );
}
