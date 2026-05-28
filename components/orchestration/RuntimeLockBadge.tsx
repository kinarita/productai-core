import type { RuntimeLockStatus } from "@/lib/orchestration/queue/executionQueueTypes";
import { cn } from "@/lib/utils";

const styles: Record<RuntimeLockStatus, string> = {
  unlocked: "border-border bg-surface text-muted",
  advisory_locked: "border-amber-200 bg-amber-50 text-amber-900",
  locked: "border-orange-200 bg-orange-50 text-orange-900",
};

interface RuntimeLockBadgeProps {
  status: RuntimeLockStatus;
  className?: string;
}

export function RuntimeLockBadge({ status, className }: RuntimeLockBadgeProps) {
  const label =
    status === "unlocked"
      ? "Runtime unlocked"
      : status === "advisory_locked"
        ? "Runtime advisory lock"
        : "Runtime locked";

  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[status],
        className
      )}
    >
      {label}
    </span>
  );
}