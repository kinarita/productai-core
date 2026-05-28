import Link from "next/link";
import type { GovernanceTimelineEvent } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import { resolveMissionLabel } from "@/lib/orchestration/processing/missionLabel";

export function GovernanceTimeline({
  events,
  missionNameMap,
  maxEvents = 12,
}: {
  events: GovernanceTimelineEvent[];
  missionNameMap?: Record<string, string>;
  maxEvents?: number;
}) {
  const compact = maxEvents <= 16;
  if (!events.length) {
    return <p className="text-xs text-muted">No governance timeline events available.</p>;
  }
  return (
    <ul className="space-y-2">
      {events.slice(0, maxEvents).map((event) => (
        <li key={event.id} className="rounded-lg border border-border bg-surface p-3 text-xs">
          <p className="font-medium text-foreground">{event.title}</p>
          <p className="mt-1 text-muted">{compact ? event.summary : `${event.summary} (${event.id})`}</p>
          <p className="mt-1 text-muted">
            {event.timestamp} · {event.source} · {event.severity.replaceAll("_", " ")} ·{" "}
            {event.eventType.replaceAll("_", " ")}
          </p>
          <div className="mt-1 flex flex-wrap gap-3">
            <Link href={`/missions/${event.missionId}`} className="font-medium text-accent hover:underline">
              {resolveMissionLabel({ missionId: event.missionId, missionNameMap })} →
            </Link>
            {event.taskId ? (
              <Link href={`/tasks/${event.taskId}`} className="font-medium text-accent hover:underline">
                Task →
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
