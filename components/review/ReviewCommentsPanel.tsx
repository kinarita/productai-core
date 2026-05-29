"use client";

import type { ReviewComment } from "@/lib/review/reviewComments";
import { cn } from "@/lib/utils";

const severityStyles: Record<string, string> = {
  info: "border-border text-muted",
  suggestion: "border-accent/30 text-accent",
  concern: "border-warning/40 text-warning",
};

export function ReviewCommentsPanel({
  comments,
  compact = false,
}: {
  comments: ReviewComment[];
  compact?: boolean;
}) {
  if (comments.length === 0) {
    return (
      <p className="text-xs text-muted">
        No human review comments recorded for this selection. Comments are recorded by people—not
        generated automatically.
      </p>
    );
  }

  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {comments.map((c) => (
        <li key={c.id} className="rounded-lg border border-border px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground">{c.title}</p>
            {c.severity ? (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] uppercase",
                  severityStyles[c.severity] ?? severityStyles.info
                )}
              >
                {c.severity}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted">{c.comment}</p>
          <p className="mt-2 text-[10px] text-muted">
            {c.authorRole} · {new Date(c.createdAt).toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
