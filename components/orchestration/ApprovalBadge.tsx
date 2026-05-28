import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApprovalBadgeProps {
  required: boolean;
  className?: string;
}

export function ApprovalBadge({ required, className }: ApprovalBadgeProps) {
  if (!required) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-medium text-muted",
          className
        )}
      >
        No executive gate
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900",
        className
      )}
    >
      <Shield className="h-3 w-3" />
      Executive approval required
    </span>
  );
}