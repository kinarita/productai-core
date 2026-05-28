import type { AuthorizationStatus } from "@/lib/orchestration/authorization/authorizationTypes";
import { cn } from "@/lib/utils";

const styles: Record<AuthorizationStatus, string> = {
  authorization_requested: "border-amber-200 bg-amber-50 text-amber-900",
  authorized: "border-emerald-200 bg-emerald-50 text-emerald-900",
  execution_authorized: "border-emerald-200 bg-emerald-50 text-emerald-900",
  denied: "border-border bg-surface text-muted",
  revoked: "border-border bg-surface text-muted",
};

export function AuthorizationStatusBadge({
  status,
  className,
}: {
  status: AuthorizationStatus;
  className?: string;
}) {
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
