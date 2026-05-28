import { cn } from "@/lib/utils";

interface ReadinessScoreBadgeProps {
  score: number;
  className?: string;
}

export function ReadinessScoreBadge({ score, className }: ReadinessScoreBadgeProps) {
  const tone =
    score >= 80
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : score >= 60
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-border bg-surface text-muted";

  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
        tone,
        className
      )}
    >
      Readiness {score}
    </span>
  );
}