import {
  MISSION_LIFECYCLE_PHASES,
  type MissionLifecyclePhase,
} from "@/types/productai";
import { cn } from "@/lib/utils";

interface LifecycleStepperProps {
  currentPhase: MissionLifecyclePhase;
  compact?: boolean;
  className?: string;
}

export function LifecycleStepper({
  currentPhase,
  compact,
  className,
}: LifecycleStepperProps) {
  const currentIndex = MISSION_LIFECYCLE_PHASES.indexOf(currentPhase);

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {MISSION_LIFECYCLE_PHASES.map((step, i) => (
        <div key={step} className="flex items-center">
          <span
            className={cn(
              "rounded-md font-medium",
              compact ? "px-2 py-0.5 text-xs" : "px-2 py-1 text-xs",
              i <= currentIndex ? "bg-accent text-white" : "bg-surface text-muted"
            )}
          >
            {step}
          </span>
          {i < MISSION_LIFECYCLE_PHASES.length - 1 && (
            <span className="mx-0.5 text-muted">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
