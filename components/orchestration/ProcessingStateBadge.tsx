import type { ProcessingStatus } from "@/lib/orchestration/processing/processingTypes";
import { cn } from "@/lib/utils";

const styles: Record<ProcessingStatus, string> = {
  processing_prepared: "border-amber-200 bg-amber-50 text-amber-900",
  processing_active: "border-emerald-200 bg-emerald-50 text-emerald-900",
  processing_paused: "border-border bg-surface text-muted",
  processing_revoked: "border-border bg-surface text-muted",
  processing_denied: "border-rose-200 bg-rose-50 text-rose-800",
  processing_review_required: "border-amber-200 bg-amber-50 text-amber-900",
};

export function ProcessingStateBadge({ status }: { status?: ProcessingStatus }) {
  if (!status) return null;
  return (
    <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize", styles[status])}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
