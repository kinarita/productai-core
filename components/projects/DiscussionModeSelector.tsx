"use client";

import {
  DISCUSSION_MODE_HINTS,
  DISCUSSION_MODE_LABELS,
  type DiscussionMode,
} from "@/lib/discussion/strategyRoomTypes";

export function DiscussionModeSelector({
  mode,
  onChange,
  disabled,
}: {
  mode: DiscussionMode;
  onChange: (mode: DiscussionMode) => void;
  disabled?: boolean;
}) {
  const modes: DiscussionMode[] = ["explore", "challenge", "decision"];

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Discussion mode</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => onChange(m)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              mode === m
                ? "bg-accent text-white"
                : "border border-border text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            {DISCUSSION_MODE_LABELS[m]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted">{DISCUSSION_MODE_HINTS[mode]}</p>
    </div>
  );
}
