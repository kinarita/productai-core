import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";

export function buildExecutionBoundaryConfirmation(
  item: ExecutionQueueItem,
  runtimeAdvisory?: string
): string[] {
  return [
    `Execution target: ${item.executionTarget}`,
    "Governance scope: controlled execution session initialization only.",
    `Runtime advisory: ${runtimeAdvisory ?? "No active advisory."}`,
    "Execution limitations: no code execution, no adapter execution, no deployment action.",
    "Prohibited actions: MCP/GitHub/Claude Code execution remains disabled.",
    "Authorization continuity: handoff → execution authorization → execute_ready confirmation.",
  ];
}
