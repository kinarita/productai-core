"use client";

import type { ProjectActivityItem } from "@/lib/project-creation/projectCreationTypes";
import { normalizeActivityFeed } from "@/lib/coo-review/normalizeActivityLabels";

export const ACTIVITY_INITIAL_VISIBLE = 7;
export const ACTIVITY_SHOW_MORE_STEP = 20;

export function activityFeedTitle(visible: number, total: number): string {
  if (total === 0) return "Activity";
  return `Activity (${visible} of ${total})`;
}

export function ProjectActivityFeed({
  items,
  visibleCount = ACTIVITY_INITIAL_VISIBLE,
  onVisibleCountChange,
}: {
  items: ProjectActivityItem[];
  visibleCount?: number;
  onVisibleCountChange?: (count: number) => void;
}) {
  const displayItems = normalizeActivityFeed(items);
  const total = displayItems.length;
  const effectiveVisible = Math.min(visibleCount, total);
  const visibleItems = displayItems.slice(0, effectiveVisible);
  const canShowMore = effectiveVisible < total;
  const canCollapse = effectiveVisible > ACTIVITY_INITIAL_VISIBLE;

  if (!displayItems.length) {
    return <p className="text-sm text-muted">Activity will appear here as your AI team works.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {visibleItems.map((item) => (
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
      <div className="flex flex-wrap gap-3">
        {canShowMore && onVisibleCountChange ? (
          <button
            type="button"
            onClick={() =>
              onVisibleCountChange(
                Math.min(visibleCount + ACTIVITY_SHOW_MORE_STEP, total)
              )
            }
            className="text-xs font-medium text-accent hover:underline"
          >
            Show More Activity
          </button>
        ) : null}
        {canCollapse && onVisibleCountChange ? (
          <button
            type="button"
            onClick={() => onVisibleCountChange(ACTIVITY_INITIAL_VISIBLE)}
            className="text-xs font-medium text-muted hover:text-foreground hover:underline"
          >
            Collapse Activity
          </button>
        ) : null}
      </div>
    </div>
  );
}
