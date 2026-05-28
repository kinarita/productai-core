import type { QueueLifecycleStatus } from "@/lib/orchestration/queue/executionQueueTypes";
import { cn } from "@/lib/utils";

const ORDER: QueueLifecycleStatus[] = [
  "execution_ready",
  "queued",
  "reserved",
  "worker_prepared",
  "awaiting_execution_authorization",
  "authorization_requested",
  "execution_authorized",
  "execute_review_pending",
  "execute_ready",
  "execution_start_requested",
  "execution_started",
  "execution_session_active",
];

interface QueueLifecycleViewProps {
  current: QueueLifecycleStatus;
}

export function QueueLifecycleView({ current }: QueueLifecycleViewProps) {
  const currentIndex = ORDER.indexOf(current);

  return (
    <ol className="flex flex-wrap gap-2">
      {ORDER.map((step, index) => {
        const active = step === current;
        const complete = currentIndex > index;
        return (
          <li
            key={step}
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs capitalize",
              active
                ? "border-accent bg-indigo-50 text-accent"
                : complete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-border bg-surface text-muted"
            )}
          >
            {step.replaceAll("_", " ")}
          </li>
        );
      })}
    </ol>
  );
}