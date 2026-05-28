import type { ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import type { MaterializationRecord } from "@/lib/orchestration/materialization/materializationTypes";

export type ExecutionQueueStatus = "pending" | "governance_ready" | "execution_ready";

export interface ExecutionQueueEntry {
  id: string;
  ticketId: string;
  missionId: string;
  label: string;
  status: ExecutionQueueStatus;
}

export function buildExecutionQueue(
  tickets: ExecutionTicket[],
  materializations: MaterializationRecord[]
): ExecutionQueueEntry[] {
  return tickets
    .filter((t) => t.status === "handoff_approved" || t.materializationStatus)
    .map((ticket) => {
      const mat = materializations.find((m) => m.ticketId === ticket.id);
      let status: ExecutionQueueStatus = "pending";

      if (ticket.materializationStatus === "execution_ready" || mat?.status === "execution_ready") {
        status = "execution_ready";
      } else if (
        ticket.materializationStatus === "materialization_requested" ||
        ticket.materializationStatus === "materialized"
      ) {
        status = "governance_ready";
      } else if (ticket.status === "handoff_approved") {
        status = "pending";
      }

      return {
        id: `q-${ticket.id}`,
        ticketId: ticket.id,
        missionId: ticket.missionId,
        label: ticket.executionIntent,
        status,
      };
    });
}