import { cn } from "@/lib/utils";

type StatusPillVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"
  | "muted";

interface StatusPillProps {
  children: React.ReactNode;
  variant?: StatusPillVariant;
  className?: string;
}

const variants: Record<StatusPillVariant, string> = {
  default: "bg-surface text-foreground border-border",
  success: "bg-green-50 text-success border-green-200",
  warning: "bg-amber-50 text-warning border-amber-200",
  danger: "bg-red-50 text-danger border-red-200",
  info: "bg-blue-50 text-info border-blue-200",
  accent: "bg-indigo-50 text-accent border-indigo-200",
  muted: "bg-surface text-muted border-border",
};

export function StatusPill({ children, variant = "default", className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
