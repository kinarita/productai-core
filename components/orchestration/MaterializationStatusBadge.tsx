import type { MaterializationLifecycleStatus } from "@/lib/orchestration/execution/executionTypes";
import { cn } from "@/lib/utils";

const styles: Partial<Record<MaterializationLifecycleStatus, string>> = {
  execution_planned: "border-border bg-surface text-muted",
  materialization_requested: "border-amber-200 bg-amber-50 text-amber-900",
  materialized: "border-indigo-200 bg-indigo-50 text-indigo-900",
  execution_ready: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

interface MaterializationStatusBadgeProps {
  status?: MaterializationLifecycleStatus;
  className?: string;
}

export function MaterializationStatusBadge({ status, className }: MaterializationStatusBadgeProps) {
  if (!status) {
    return (
      <span
        className={cn(
          "inline-flex rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-medium text-muted",
          className
        )}
      >
        Not materialized
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        styles[status] ?? "border-border bg-surface text-muted",
        className
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}