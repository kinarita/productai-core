import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";

export function processingBoundaryLines(item: ExecutionQueueItem, runtimeAdvisory?: string): string[] {
  return [
    `Processing target: ${item.executionTarget}`,
    "Allowed scope: reasoning, planning, orchestration continuity.",
    "Prohibited actions: code execution, repository modification, deployment, external execution.",
    `Runtime conditions: ${runtimeAdvisory ?? "No active runtime advisory."}`,
    "Continuity requirements: execution session active + operator signature continuity.",
    "Approval chain continuity: handoff → authorization → execute_ready → execution_session_active.",
  ];
}

export function processingSemanticsMessage(): string {
  return "Processing governance continuity has entered an active state. No operational execution has been initiated.";
}
