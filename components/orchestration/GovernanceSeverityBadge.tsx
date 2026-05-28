import type { GovernanceSeverity } from "@/lib/orchestration/processing/processingTypes";
import { cn } from "@/lib/utils";

const styles: Record<GovernanceSeverity, string> = {
  low: "border-slate-200 bg-slate-50 text-slate-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-rose-200 bg-rose-50 text-rose-800",
};

export function GovernanceSeverityBadge({ severity }: { severity: GovernanceSeverity }) {
  return (
    <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-xs font-medium", styles[severity])}>
      {severity}
    </span>
  );
}
