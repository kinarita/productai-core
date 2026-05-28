import type { ExecuteStatus } from "@/lib/orchestration/execute/executeTypes";
import { cn } from "@/lib/utils";

const styles: Record<ExecuteStatus, string> = {
  execute_review_pending: "border-amber-200 bg-amber-50 text-amber-900",
  execute_ready: "border-emerald-200 bg-emerald-50 text-emerald-900",
  execute_revoked: "border-border bg-surface text-muted",
  execute_denied: "border-border bg-surface text-muted",
};

export function ExecuteReadyBadge({ status, className }: { status: ExecuteStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        styles[status],
        className
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
