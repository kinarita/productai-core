"use client";

import { StatusPill } from "@/components/StatusPill";
import type { MissionExecutionCounts } from "@/lib/task/missionExecutionInsights";

interface MissionExecutionFlowProps {
  counts: MissionExecutionCounts;
}

type StepTone = "muted" | "info" | "warning" | "danger" | "success";

interface FlowStep {
  key: string;
  label: string;
  count: number;
  tone: StepTone;
}

function variantFromTone(tone: StepTone) {
  if (tone === "danger") return "danger" as const;
  if (tone === "warning") return "warning" as const;
  if (tone === "success") return "success" as const;
  if (tone === "info") return "info" as const;
  return "muted" as const;
}

function markerClass(tone: StepTone) {
  if (tone === "danger") return "bg-danger";
  if (tone === "warning") return "bg-warning";
  if (tone === "success") return "bg-success";
  if (tone === "info") return "bg-info";
  return "bg-border";
}

export function MissionExecutionFlow({ counts }: MissionExecutionFlowProps) {
  const steps: FlowStep[] = [
    {
      key: "judgment",
      label: "Judgment",
      count: counts.decisionCount,
      tone: counts.decisionCount > 0 ? "info" : "muted",
    },
    {
      key: "tasks",
      label: "Tasks Created",
      count: counts.tasksCreated,
      tone: counts.tasksCreated > 0 ? "info" : "muted",
    },
    {
      key: "execution",
      label: "Active Execution",
      count: counts.activeExecution,
      tone: counts.blockedCount > 0 ? "warning" : counts.activeExecution > 0 ? "info" : "muted",
    },
    {
      key: "qa",
      label: "QA Review",
      count: counts.reviewCount,
      tone: counts.reviewCount > 0 ? "warning" : "muted",
    },
    {
      key: "completed",
      label: "Completed Execution",
      count: counts.completedCount,
      tone: counts.completedCount > 0 ? "success" : "muted",
    },
  ];

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${markerClass(step.tone)}`} />
              {!isLast ? <span className="my-1 min-h-[24px] w-px bg-border" /> : null}
            </div>
            <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <StatusPill variant={variantFromTone(step.tone)}>{step.count}</StatusPill>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
