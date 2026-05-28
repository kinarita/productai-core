import type { ProcessingReasonCategory } from "@/lib/orchestration/processing/processingTypes";

export function ProcessingReasonBadge({ category }: { category: ProcessingReasonCategory }) {
  return (
    <span className="inline-flex rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted">
      {category.replaceAll("_", " ")}
    </span>
  );
}
