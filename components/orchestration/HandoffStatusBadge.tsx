import type { ExecutionTicketStatus } from "@/lib/orchestration/execution/executionTypes";
import { cn } from "@/lib/utils";

const styles: Record<ExecutionTicketStatus, string> = {
  draft: "border-border bg-surface text-muted",
  awaiting_handoff: "border-amber-200 bg-amber-50 text-amber-900",
  handoff_approved: "border-emerald-200 bg-emerald-50 text-emerald-900",
  queued: "border-border bg-surface text-muted",
  executing: "border-border bg-surface text-muted",
  completed: "border-border bg-surface text-muted",
  cancelled: "border-border bg-surface text-muted",
};

interface HandoffStatusBadgeProps {
  status: ExecutionTicketStatus;
  className?: string;
}

export function HandoffStatusBadge({ status, className }: HandoffStatusBadgeProps) {
  const label = status.replaceAll("_", " ");
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        styles[status],
        className
      )}
    >
      {label}
    </span>
  );
}