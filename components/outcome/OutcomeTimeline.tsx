"use client";

import type { OutcomeTimelineEvent } from "@/lib/outcome/releaseOutcomeContext";

const phaseLabels: Record<OutcomeTimelineEvent["phase"], string> = {
  release: "Mission Release",
  feedback: "Feedback",
  review: "Review",
  follow_up: "Follow-up",
  reflection: "Reflection",
};

export function OutcomeTimeline({
  events,
  compact = false,
}: {
  events: OutcomeTimelineEvent[];
  compact?: boolean;
}) {
  if (events.length === 0) {
    return <p className="text-xs text-muted">No outcome timeline events for the selected mission.</p>;
  }

  return (
    <ol className={compact ? "space-y-2" : "space-y-4"}>
      {events.slice(0, compact ? 4 : undefined).map((event, index) => (
        <li key={event.id} className="relative pl-6">
          {index < events.length - 1 ? (
            <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
          ) : null}
          <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-accent bg-background" />
          <p className="text-[10px] font-medium uppercase text-muted">{phaseLabels[event.phase]}</p>
          <p className="text-xs font-medium text-foreground">{event.label}</p>
          <p className="mt-0.5 text-xs text-muted">{event.detail}</p>
          <p className="mt-0.5 text-[10px] text-muted">{event.timestamp}</p>
        </li>
      ))}
    </ol>
  );
}
