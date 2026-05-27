import type { OrchestrationContext } from "@/lib/orchestration/orchestrationTypes";

export function compactContext(context: OrchestrationContext): {
  missionCount: number;
  taskCount: number;
  pendingDecisions: number;
  warningCount: number;
} {
  return {
    missionCount: context.missions.length,
    taskCount: context.tasks.length,
    pendingDecisions: context.decisions.filter((d) => d.status === "pending").length,
    warningCount: context.syncWarnings.length + context.runtimeAlerts.length,
  };
}
