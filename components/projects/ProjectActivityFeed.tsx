"use client";

import type { ProjectActivityItem } from "@/lib/project-creation/projectCreationTypes";

export function ProjectActivityFeed({ items }: { items: ProjectActivityItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted">Activity will appear here as your AI team works.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex gap-3 rounded-lg border border-border bg-surface px-4 py-3"
        >
          <span className="text-xl" aria-hidden>
            {item.workerEmoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">
              <span className="font-medium">{item.workerName}</span> {item.message}
            </p>
            <p className="mt-0.5 text-xs text-muted">{item.timestamp}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
