"use client";

import type { DiscussionTargetAudience } from "@/lib/discussion/discussionTypes";
import { PRODUCT_PLANNER_DISPLAY_NAME } from "@/lib/discussion/executiveRoomLabels";

const OPTIONS: { id: DiscussionTargetAudience; label: string }[] = [
  { id: "all", label: "全員" },
  { id: "planner", label: PRODUCT_PLANNER_DISPLAY_NAME },
  { id: "coo", label: "COO" },
];

export function DiscussionAudienceSelector({
  value,
  onChange,
  disabled,
}: {
  value: DiscussionTargetAudience;
  onChange: (value: DiscussionTargetAudience) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-2">
      <p className="mb-1.5 text-[11px] font-medium text-muted">相談相手</p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              value === opt.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
