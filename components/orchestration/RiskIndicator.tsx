import type { ProposalRiskLevel } from "@/lib/orchestration/policy/policyTypes";
import { cn } from "@/lib/utils";

const riskStyles: Record<ProposalRiskLevel, string> = {
  low: "border-border bg-surface text-muted",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
  high: "border-orange-200 bg-orange-50 text-orange-900",
};

interface RiskIndicatorProps {
  level: ProposalRiskLevel;
  factors?: string[];
}

export function RiskIndicator({ level, factors }: RiskIndicatorProps) {
  return (
    <div className="space-y-1">
      <span
        className={cn(
          "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
          riskStyles[level]
        )}
      >
        Risk: {level}
      </span>
      {factors && factors.length > 0 ? (
        <p className="text-xs text-muted">{factors.join(" · ")}</p>
      ) : null}
    </div>
  );
}