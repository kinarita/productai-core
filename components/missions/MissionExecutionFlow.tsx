"use client";

import Link from "next/link";
import { StatusPill } from "@/components/StatusPill";
import type { MissionExecutionCounts } from "@/lib/task/missionExecutionInsights";

interface MissionExecutionFlowProps {
  missionId: string;
  counts: MissionExecutionCounts;
}

type StepTone = "muted" | "info" | "warning" | "danger" | "success";

interface FlowStep {
  key: string;
  label: string;
  count: number;
  tone: StepTone;
  href?: string;
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

export function MissionExecutionFlow({ missionId, counts }: MissionExecutionFlowProps) {
  const steps: FlowStep[] = [
    {
      key: "judgment",
      label: "Judgment",
      count: counts.decisionCount,
      tone: counts.decisionCount > 0 ? "info" : "muted",
      href: `/judgment?mission=${missionId}`,
    },
    {
      key: "tasks",
      label: "Tasks Created",
      count: counts.tasksCreated,
      tone: counts.tasksCreated > 0 ? "info" : "muted",
      href: `/tasks?mission=${missionId}`,
    },
    {
      key: "execution",
      label: "Active Execution",
      count: counts.activeExecution,
      tone: counts.blockedCount > 0 ? "warning" : counts.activeExecution > 0 ? "info" : "muted",
      href: `/tasks?mission=${missionId}&status=active`,
    },
    {
      key: "blocked",
      label: "Blocked",
      count: counts.blockedCount,
      tone: counts.blockedCount > 0 ? "danger" : "muted",
      href: `/tasks?mission=${missionId}&status=blocked`,
    },
    {
      key: "qa",
      label: "QA Review",
      count: counts.reviewCount,
      tone: counts.reviewCount > 0 ? "warning" : "muted",
      href: `/tasks?mission=${missionId}&status=in_review`,
    },
    {
      key: "completed",
      label: "Completed Execution",
      count: counts.completedCount,
      tone: counts.completedCount > 0 ? "success" : "muted",
      href: `/tasks?mission=${missionId}&status=completed`,
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
              {step.href ? (
                <Link
                  href={step.href}
                  className="group inline-flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-surface"
                >
                  <p className="text-sm font-medium text-foreground group-hover:text-accent">{step.label}</p>
                  <StatusPill variant={variantFromTone(step.tone)}>{step.count}</StatusPill>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{step.label}</p>
                  <StatusPill variant={variantFromTone(step.tone)}>{step.count}</StatusPill>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
